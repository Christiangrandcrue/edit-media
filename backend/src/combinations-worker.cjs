const Database = require('better-sqlite3');

// ========== Permutation Functions ==========
// Generate all permutations of array elements with length k
function generatePermutations(arr, k) {
  const result = [];
  
  function permute(current, remaining) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const newRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
      permute([...current, next], newRemaining);
    }
  }
  
  permute([], arr);
  return result;
}

// Calculate total number of permutations for given mid_counts
function calculateTotalPermutations(numHooks, numMids, numCtas, midCounts) {
  function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }
  
  function permutations(n, k) {
    if (k > n) return 0;
    return factorial(n) / factorial(n - k);
  }
  
  let total = 0;
  for (const count of midCounts) {
    const perms = permutations(numMids, count);
    total += numHooks * perms * numCtas;
  }
  return total;
}
// ========== End Permutation Functions ==========

// ========== Video Metadata Functions ==========
// Get video duration using ffprobe
function getVideoDuration(filePath) {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { encoding: 'utf8' }
    );
    return parseFloat(output.trim());
  } catch (error) {
    console.error('❌ Ошибка получения длительности:', error.message);
    return 0;
  }
}

// Get video metadata (duration + fileSize)
function getVideoMetadata(filePath) {
  const duration = getVideoDuration(filePath);
  const fileSize = fs.statSync(filePath).size;
  return { duration, fileSize };
}
// ========== End Video Metadata Functions ==========

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Конфигурация
const DB_PATH = '/data/db/synthnova.sqlite';
const MASTER_OUTPUT = '/data/master-videos';
const TEMP_DIR = '/tmp/combinations';
const POLL_INTERVAL = 10000; // 10 секунд

console.log('🚀 Combinations Worker запущен');
console.log('📂 DB:', DB_PATH);
console.log('📁 Output:', MASTER_OUTPUT);
console.log('⏱️  Poll interval:', POLL_INTERVAL + 'ms');

// Создаём директории
if (!fs.existsSync(MASTER_OUTPUT)) {
  fs.mkdirSync(MASTER_OUTPUT, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Получить длительность видео через ffprobe
function getVideoDuration(filePath) {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { encoding: 'utf8' }
    );
    return parseFloat(output.trim());
  } catch (error) {
    console.error('❌ Ошибка получения длительности:', error.message);
    return 0;
  }
}

// Склеить видео в один master
function concatenateVideos(videoFiles, outputPath) {
  const listFile = path.join(TEMP_DIR, `concat_${Date.now()}.txt`);
  
  try {
    // Создаём файл списка для ffmpeg
    const fileList = videoFiles.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(listFile, fileList);
    
    // Склеиваем видео
    execSync(
      `ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}" -y`,
      { stdio: 'pipe' }
    );
    
    // Удаляем временный файл
    fs.unlinkSync(listFile);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка склейки видео:', error.message);
    if (fs.existsSync(listFile)) {
      fs.unlinkSync(listFile);
    }
    return false;
  }
}

// Генерация ID
function generateId(prefix = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}${timestamp}_${random}`;
}

// Обработка одного задания
function processCombinationJob(job) {
  const jobId = job.job_id;
  const projectId = job.project_id;
  
  console.log(`\n🎬 Обработка job ${jobId}`);
  console.log(`   Project: ${projectId}`);
  
  try {
    // Парсим выбранные ID
    const hookIds = JSON.parse(job.hook_ids || '[]');
    const midIds = JSON.parse(job.mid_ids || '[]');
    const ctaIds = JSON.parse(job.cta_ids || '[]');
    const midCounts = JSON.parse(job.mid_counts || '[1]');
    
    console.log(`   Hooks: ${hookIds.length}, Mids: ${midIds.length}, CTAs: ${ctaIds.length}`);
    
    if (hookIds.length === 0 || midIds.length === 0 || ctaIds.length === 0) {
      throw new Error('Нет выбранных материалов для комбинаций');
    }
    
    // Получаем пути к файлам
    const getAssetPath = db.prepare(`
      SELECT asset_id, file_path FROM project_assets 
      WHERE project_id = ? AND asset_id = ?
    `);
    
    const hooks = hookIds.map(id => getAssetPath.get(projectId, id)).filter(Boolean);
    const mids = midIds.map(id => getAssetPath.get(projectId, id)).filter(Boolean);
    const ctas = ctaIds.map(id => getAssetPath.get(projectId, id)).filter(Boolean);
    
    console.log(`   Найдено файлов: hooks=${hooks.length}, mids=${mids.length}, ctas=${ctas.length}`);
    
    if (hooks.length === 0 || mids.length === 0 || ctas.length === 0) {
      throw new Error('Не найдены файлы для выбранных материалов');
    }
    
    // Пересчитываем общее количество с учётом перестановок
    const totalCombinations = calculateTotalPermutations(hooks.length, mids.length, ctas.length, midCounts);
    console.log(`   📊 Всего комбинаций с перестановками: ${totalCombinations}`);
    
    // Обновляем total_combinations в БД
    db.prepare(`
      UPDATE combination_jobs 
      SET total_combinations = ?,
          status = 'processing',
          updated_at = datetime('now')
      WHERE job_id = ?
    `).run(totalCombinations, jobId);
    
    let combinationIndex = 0;
    let processed = 0;
    let failed = 0;
    
    // Генерируем все комбинации с перестановками
    for (const hook of hooks) {
      for (const cta of ctas) {
        // Для каждого выбранного количества mid-шотов
        for (const midCount of midCounts) {
          // Генерируем все перестановки mids длины midCount
          const midPermutations = generatePermutations(mids, midCount);
          
          console.log(`   🔄 Hook: ${hook.asset_id}, MidCount: ${midCount}, Перестановок: ${midPermutations.length}`);
          
          for (const midPermutation of midPermutations) {
            combinationIndex++;
            
            const masterId = generateId('master_');
            const masterName = `Combo_${combinationIndex}`;
            const outputPath = path.join(MASTER_OUTPUT, `${masterId}.mp4`);
            
            console.log(`   ${combinationIndex}/${totalCombinations}: ${masterName} [${midCount} mids]`);
            
            // Обновляем прогресс
            db.prepare(`
              UPDATE combination_jobs 
              SET progress = ?,
                  updated_at = datetime('now')
              WHERE job_id = ?
            `).run(combinationIndex, jobId);
            
            // Склеиваем Hook + Mid₁ + Mid₂ + ... + CTA
            const videoFiles = [
              hook.file_path,
              ...midPermutation.map(m => m.file_path),
              cta.file_path
            ];
            
            const success = concatenateVideos(videoFiles, outputPath);
            
            if (!success) {
              console.error(`   ❌ Ошибка создания ${masterName}`);
              failed++;
              continue;
            }
            
            // Получаем длительность и размер видео
            const { duration, fileSize } = getVideoMetadata(outputPath);
            
            // Сохраняем в БД master_videos
            db.prepare(`
              INSERT INTO master_videos (
                master_id, project_id, name, video_path, status, created_at
              ) VALUES (?, ?, ?, ?, 'completed', datetime('now'))
            `).run(masterId, projectId, masterName, outputPath);
            
            // Сохраняем связь с combination_job
            // Теперь вместо одного mid_id сохраняем массив
            const midIdsStr = midPermutation.map(m => m.asset_id).join(',');
            db.prepare(`
              INSERT INTO combination_masters (
                job_id, master_id, project_id, combination_index,
                hook_id, mid_id, cta_id, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `).run(jobId, masterId, projectId, combinationIndex, 
                   hook.asset_id, midIdsStr, cta.asset_id);
            
            processed++;
            
            console.log(`   ✅ ${masterName}: ${(duration).toFixed(1)}s, ${(fileSize / 1024 / 1024).toFixed(1)} MB`);
          }
        }
      }
    }
    
    // Завершаем job
    db.prepare(`
      UPDATE combination_jobs 
      SET status = 'completed',
          progress = ?,
          completed = ?,
          completed_at = datetime('now'),
          updated_at = datetime('now')
      WHERE job_id = ?
    `).run(processed, processed, jobId);
    
    console.log(`\n✅ Job ${jobId} завершён: ${processed}/${totalCombinations} master-видео создано`);
    
  } catch (error) {
    console.error(`❌ Ошибка обработки job ${jobId}:`, error.message);
    
    // Помечаем job как failed
    db.prepare(`
      UPDATE combination_jobs 
      SET status = 'failed',
          error = ?,
          updated_at = datetime('now')
      WHERE job_id = ?
    `).run(error.message, jobId);
  }
}

// Основной цикл
function pollJobs() {
  try {
    // Ищем задания в очереди
    const jobs = db.prepare(`
      SELECT * FROM combination_jobs 
      WHERE status = 'queued' 
      ORDER BY created_at ASC 
      LIMIT 1
    `).all();
    
    if (jobs.length === 0) {
      // console.log('⏳ Нет заданий в очереди');
      return;
    }
    
    jobs.forEach(job => processCombinationJob(job));
    
  } catch (error) {
    console.error('❌ Ошибка в pollJobs:', error.message);
  }
}

// Запуск worker
console.log('\n🔄 Worker готов к работе\n');
setInterval(pollJobs, POLL_INTERVAL);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  Получен SIGTERM, завершаю работу...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Получен SIGINT, завершаю работу...');
  db.close();
  process.exit(0);
});
