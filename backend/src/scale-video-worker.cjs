const Database = require("better-sqlite3");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const execPromise = promisify(exec);

// Конфигурация
const DB_PATH = "/data/db/synthnova.sqlite";
const OUTPUT_DIR = "/data/scaled-videos";
const MASTER_VIDEOS_DIR = "/data/master-videos";
const POLL_INTERVAL = 10000; // 10 секунд

// Настройки форматов (aspect ratio)
const FORMATS = {
  "16:9": { width: 1920, height: 1080, name: "landscape" },
  "9:16": { width: 1080, height: 1920, name: "vertical" },
  "1:1": { width: 1080, height: 1080, name: "square" },
  "4:5": { width: 1080, height: 1350, name: "instagram" }
};

// Обеспечиваем наличие выходного каталога
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Создан каталог: ${OUTPUT_DIR}`);
}

const db = new Database(DB_PATH);

// Генерация уникального ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Получить длительность видео через ffprobe
async function getVideoDuration(videoPath) {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error(`❌ Ошибка ffprobe для ${videoPath}:`, error.message);
    return null;
  }
}

// Получить следующую задачу на обработку
function getNextJob() {
  return db.prepare(`
    SELECT * FROM scale_jobs 
    WHERE status = 'queued' 
    ORDER BY created_at ASC 
    LIMIT 1
  `).get();
}

// Обновить статус задачи
function updateJobStatus(jobId, status, progress = null, error = null) {
  const updates = { status, updated_at: new Date().toISOString() };
  if (progress !== null) updates.progress = progress;
  if (error) updates.error = error;
  if (status === 'completed') updates.completed_at = new Date().toISOString();

  const fields = Object.keys(updates).map(k => `${k} = @${k}`).join(", ");
  db.prepare(`UPDATE scale_jobs SET ${fields} WHERE job_id = @jobId`).run({ jobId, ...updates });
}

// Создать scaled_video запись
function createScaledVideo(data) {
  db.prepare(`
    INSERT INTO scaled_videos (
      scaled_id, job_id, project_id, master_video_id, 
      format, sequence, status, created_at
    ) VALUES (
      @scaled_id, @job_id, @project_id, @master_video_id,
      @format, @sequence, @status, @created_at
    )
  `).run(data);
}

// Обновить scaled_video
function updateScaledVideo(scaledId, updates) {
  const fields = Object.keys(updates).map(k => `${k} = @${k}`).join(", ");
  db.prepare(`UPDATE scaled_videos SET ${fields} WHERE scaled_id = @scaledId`).run({ scaledId, ...updates });
}

// Нарезка видео на случайные фрагменты
async function scaleVideo(job) {
  console.log(`\n🎬 Обработка задачи: ${job.job_id}`);
  console.log(`   Проект: ${job.project_id}`);
  console.log(`   Master: ${job.master_video_id}`);
  console.log(`   Количество: ${job.count}`);
  console.log(`   Форматы: ${job.formats}`);

  try {
    // Получаем master video
    const master = db.prepare("SELECT * FROM master_videos WHERE master_id = ?").get(job.master_video_id);
    if (!master || !master.video_path || !fs.existsSync(master.video_path)) {
      throw new Error(`Master видео не найдено: ${job.master_video_id}`);
    }

    console.log(`\n📹 Master видео: ${master.video_path}`);
    
    // Получаем длительность
    const duration = await getVideoDuration(master.video_path);
    if (!duration || duration < 10) {
      throw new Error(`Видео слишком короткое: ${duration}s`);
    }

    console.log(`   Длительность: ${duration.toFixed(2)}s`);

    // Парсим форматы
    const formats = JSON.parse(job.formats);
    const total = job.count * formats.length;
    
    updateJobStatus(job.job_id, 'processing', 0, null);
    updateJobStatus(job.job_id, 'processing', 0, null);
    db.prepare("UPDATE scale_jobs SET total = ? WHERE job_id = ?").run(total, job.job_id);

    let processed = 0;

    // Генерируем случайные версии для каждого формата
    for (const format of formats) {
      if (!FORMATS[format]) {
        console.warn(`⚠️ Неизвестный формат: ${format}, пропускаю`);
        continue;
      }

      console.log(`\n📐 Формат: ${format} (${FORMATS[format].name})`);

      for (let i = 0; i < job.count; i++) {
        const scaledId = generateId(`scaled`);
        const sequence = i + 1;
        
        // Создаём запись
        createScaledVideo({
          scaled_id: scaledId,
          job_id: job.job_id,
          project_id: job.project_id,
          master_video_id: job.master_video_id,
          format,
          sequence,
          status: 'processing',
          created_at: new Date().toISOString()
        });

        console.log(`\n   🎯 Версия ${sequence}/${job.count} (${format})`);

        try {
          // Генерируем случайные параметры нарезки
          const clipDuration = 15 + Math.random() * 15; // 15-30 сек
          const maxStart = duration - clipDuration;
          const startTime = maxStart > 0 ? Math.random() * maxStart : 0;

          console.log(`      Фрагмент: ${startTime.toFixed(2)}s - ${(startTime + clipDuration).toFixed(2)}s`);

          // Формируем имя файла
          const outputFilename = `${scaledId}_${format.replace(':', 'x')}.mp4`;
          const outputPath = path.join(OUTPUT_DIR, outputFilename);

          // FFmpeg команда для нарезки и изменения формата
          const { width, height } = FORMATS[format];
          const ffmpegCmd = `ffmpeg -ss ${startTime.toFixed(2)} -i "${master.video_path}" -t ${clipDuration.toFixed(2)} \
            -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black" \
            -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart -y "${outputPath}"`;

          console.log(`      FFmpeg: обрезка и масштабирование...`);
          await execPromise(ffmpegCmd);

          // Проверяем результат
          if (!fs.existsSync(outputPath)) {
            throw new Error("Output файл не создан");
          }

          const stats = fs.statSync(outputPath);
          const finalDuration = await getVideoDuration(outputPath);

          console.log(`      ✅ Готово: ${(stats.size / 1024 / 1024).toFixed(2)} MB, ${finalDuration.toFixed(2)}s`);

          // Обновляем запись
          updateScaledVideo(scaledId, {
            video_path: outputPath,
            file_size: stats.size,
            duration: finalDuration,
            status: 'completed',
            completed_at: new Date().toISOString()
          });

        } catch (error) {
          console.error(`      ❌ Ошибка версии ${sequence}:`, error.message);
          updateScaledVideo(scaledId, {
            status: 'failed',
            error: error.message
          });
        }

        processed++;
        const progress = Math.floor((processed / total) * 100);
        updateJobStatus(job.job_id, 'processing', progress, null);
      }
    }

    // Финализация
    updateJobStatus(job.job_id, 'completed', 100, null);
    console.log(`\n✅ Задача ${job.job_id} завершена: ${processed}/${total} версий`);

  } catch (error) {
    console.error(`\n❌ Ошибка задачи ${job.job_id}:`, error.message);
    updateJobStatus(job.job_id, 'failed', null, error.message);
  }
}

// Основной цикл обработки
async function processLoop() {
  while (true) {
    try {
      const job = getNextJob();
      
      if (job) {
        await scaleVideo(job);
      } else {
        // Нет задач, ждём
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
      
    } catch (error) {
      console.error("❌ Критическая ошибка в цикле:", error);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏸️  SIGTERM получен, завершаю работу...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏸️  SIGINT получен, завершаю работу...');
  db.close();
  process.exit(0);
});

// Старт
console.log('🚀 Scale Video Worker запущен');
console.log(`   DB: ${DB_PATH}`);
console.log(`   Output: ${OUTPUT_DIR}`);
console.log(`   Poll interval: ${POLL_INTERVAL}ms\n`);

processLoop().catch(error => {
  console.error('❌ Фатальная ошибка:', error);
  db.close();
  process.exit(1);
});
