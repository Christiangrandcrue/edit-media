const Database = require("better-sqlite3");
const db = new Database("/data/db/synthnova.sqlite");

console.log("🔧 Пересоздаю таблицу scaled_videos...\n");

try {
  // 1. Удаляем старую таблицу
  console.log("1. Удаляю старую таблицу scaled_videos...");
  db.exec("DROP TABLE IF EXISTS scaled_videos");
  console.log("   ✅ Удалено\n");
  
  // 2. Создаём новую
  console.log("2. Создаю новую таблицу scaled_videos...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS scaled_videos (
      scaled_id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      master_video_id TEXT NOT NULL,
      format TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      video_path TEXT,
      file_size INTEGER,
      duration REAL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);
  console.log("   ✅ Создано\n");
  
  // 3. Создаём индексы
  console.log("3. Создаю индексы...");
  db.exec("CREATE INDEX IF NOT EXISTS idx_scaled_videos_job_id ON scaled_videos(job_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_scaled_videos_project_id ON scaled_videos(project_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_scaled_videos_master_video_id ON scaled_videos(master_video_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_scaled_videos_status ON scaled_videos(status)");
  console.log("   ✅ Готово\n");
  
  // 4. Показываем схему
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name=?").get("scaled_videos");
  console.log("📝 Новая схема scaled_videos:");
  console.log(schema.sql);
  
  console.log("\n✅ Миграция завершена успешно!");
  
} catch (error) {
  console.error("\n❌ Ошибка:", error.message);
  console.error(error.stack);
  process.exit(1);
}

db.close();
