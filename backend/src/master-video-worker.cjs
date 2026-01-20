// Master Video Worker - обработка master-роликов
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const DB_PATH = "/data/db/synthnova.sqlite";
const MASTER_OUTPUT_DIR = '/data/master-videos';
const POLL_INTERVAL = 10000; // 10 секунд

// Убедимся что директория существует
if (!fs.existsSync(MASTER_OUTPUT_DIR)) {
  fs.mkdirSync(MASTER_OUTPUT_DIR, { recursive: true });
}

let db;
let isProcessing = false;

function initDB() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  console.log('[Worker] Database connected');
}

// Получить следующий ролик для обработки
function getNextPendingMaster() {
  const stmt = db.prepare(`
    SELECT * FROM master_videos 
    WHERE status = 'created' 
    ORDER BY created_at ASC 
    LIMIT 1
  `);
  return stmt.get();
}

// Обновить статус
function updateStatus(masterId, status) {
  const stmt = db.prepare(`
    UPDATE master_videos 
    SET status = ?, updated_at = datetime('now') 
    WHERE master_id = ?
  `);
  stmt.run(status, masterId);
  console.log(`[Worker] ${masterId}: status → ${status}`);
}

// Обновить video_path
function updateVideoPath(masterId, videoPath, filePath) {
  const stmt = db.prepare(`
    UPDATE master_videos 
    SET video_path = ?, file_path = ?, status = 'completed', updated_at = datetime('now')
    WHERE master_id = ?
  `);
  stmt.run(videoPath, filePath, masterId);
  console.log(`[Worker] ${masterId}: video saved → ${videoPath}`);
}

// Получить assets по IDs
function getAssets(assetIds) {
  const placeholders = assetIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT asset_id, file_path, original_filename, asset_type 
    FROM project_assets 
    WHERE asset_id IN (${placeholders})
  `);
  return stmt.all(...assetIds);
}

// Склеить видео через FFmpeg
async function concatenateVideos(assets, outputPath) {
  console.log(`[Worker] Concatenating ${assets.length} videos...`);
  
  // Создать файл со списком видео для concat
  const concatFilePath = `/tmp/concat_${Date.now()}.txt`;
  const fileList = assets.map(asset => `file '${asset.file_path}'`).join('\n');
  fs.writeFileSync(concatFilePath, fileList);
  
  try {
    // FFmpeg concat с re-encoding для совместимости
    const cmd = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" \
      -c:v libx264 -preset medium -crf 23 \
      -c:a aac -b:a 128k \
      -movflags +faststart \
      -y "${outputPath}"`;
    
    console.log('[Worker] FFmpeg command:', cmd);
    const { stdout, stderr } = await execPromise(cmd, { maxBuffer: 10 * 1024 * 1024 });
    
    console.log('[Worker] FFmpeg completed successfully');
    
    // Проверить что файл создан
    if (!fs.existsSync(outputPath)) {
      throw new Error('Output file not created');
    }
    
    const stats = fs.statSync(outputPath);
    console.log(`[Worker] Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('[Worker] FFmpeg error:', error.message);
    if (error.stderr) console.error('[Worker] FFmpeg stderr:', error.stderr);
    throw error;
  } finally {
    // Удалить временный файл
    if (fs.existsSync(concatFilePath)) {
      fs.unlinkSync(concatFilePath);
    }
  }
}

// Обработать master-ролик
async function processMasterVideo(master) {
  // Parse shots_config if it is a string
  if (typeof master.shots_config === "string") {
    master.shots_config = JSON.parse(master.shots_config);
  }
  const { master_id, project_id, name, shots_config } = master;
  
  console.log(`\n[Worker] ========================================`);
  console.log(`[Worker] Processing: ${master_id} (${name})`);
  console.log(`[Worker] Project: ${project_id}`);
  console.log(`[Worker] Shots: ${shots_config.length}`);
  
  try {
    // 1. Обновить статус на processing
    updateStatus(master_id, 'processing');
    
    // 2. Получить assets
    const assets = getAssets(shots_config);
    console.log(`[Worker] Found ${assets.length} assets`);
    
    if (assets.length === 0) {
      throw new Error('No assets found for shots_config');
    }
    
    // Проверить что все файлы существуют
    const missingFiles = assets.filter(a => !fs.existsSync(a.file_path));
    if (missingFiles.length > 0) {
      console.error('[Worker] Missing files:', missingFiles.map(a => a.file_path));
      throw new Error(`${missingFiles.length} files not found`);
    }
    
    // 3. Создать output path
    const timestamp = Date.now();
    const filename = `${master_id}_${timestamp}.mp4`;
    const outputPath = path.join(MASTER_OUTPUT_DIR, filename);
    
    // 4. Склеить видео
    await concatenateVideos(assets, outputPath);
    
    // 5. Обновить БД
    const relativePath = `/data/master-videos/${filename}`;
    updateVideoPath(master_id, relativePath, relativePath);
    
    console.log(`[Worker] ✅ COMPLETED: ${master_id}`);
    console.log(`[Worker] Output: ${relativePath}`);
    console.log(`[Worker] ========================================\n`);
    
  } catch (error) {
    console.error(`[Worker] ❌ FAILED: ${master_id}`);
    console.error('[Worker] Error:', error.message);
    updateStatus(master_id, 'failed');
  }
}

// Главный цикл обработки
async function processingLoop() {
  if (isProcessing) {
    return; // Уже обрабатываем
  }
  
  try {
    isProcessing = true;
    
    const master = getNextPendingMaster();
    
    if (master) {
      await processMasterVideo(master);
    }
    
  } catch (error) {
    console.error('[Worker] Loop error:', error);
  } finally {
    isProcessing = false;
  }
}

// Запуск worker
function start() {
  console.log('[Worker] Master Video Worker starting...');
  console.log(`[Worker] DB: ${DB_PATH}`);
  console.log(`[Worker] Output dir: ${MASTER_OUTPUT_DIR}`);
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL}ms`);
  
  initDB();
  
  // Запустить цикл обработки
  setInterval(processingLoop, POLL_INTERVAL);
  
  // Первый запуск сразу
  processingLoop();
  
  console.log('[Worker] Worker started! Waiting for tasks...\n');
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Worker] Shutting down...');
  if (db) db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Worker] Shutting down...');
  if (db) db.close();
  process.exit(0);
});

// Запуск
start();
