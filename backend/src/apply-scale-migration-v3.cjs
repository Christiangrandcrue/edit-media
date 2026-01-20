const Database = require("better-sqlite3");

const DB_PATH = "/data/db/synthnova.sqlite";
console.log("📊 Применяю миграцию scale_jobs...\n");

const db = new Database(DB_PATH);

try {
  // 1. Создаём scale_jobs (без DEFAULT для formats — установим через INSERT)
  console.log("1️⃣ Создаю таблицу scale_jobs...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS scale_jobs (
      job_id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      master_video_id TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 10,
      formats TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
      progress INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);
  console.log("   ✅ Таблица scale_jobs создана\n");
  
  // 2. Создаём scaled_videos
  console.log("2️⃣ Создаю таблицу scaled_videos...");
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
  console.log("   ✅ Таблица scaled_videos создана\n");
  
  // 3. Создаём индексы
  console.log("3️⃣ Создаю индексы...");
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scale_jobs_project_id ON scale_jobs(project_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scale_jobs_master_video_id ON scale_jobs(master_video_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scale_jobs_status ON scale_jobs(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scale_jobs_created_at ON scale_jobs(created_at DESC)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scaled_videos_job_id ON scaled_videos(job_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scaled_videos_project_id ON scaled_videos(project_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scaled_videos_master_video_id ON scaled_videos(master_video_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scaled_videos_status ON scaled_videos(status)`);
  console.log("   ✅ Индексы созданы\n");
  
  // 4. Проверяем
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('scale_jobs', 'scaled_videos')
  `).all();
  
  console.log("📋 Созданные таблицы:");
  tables.forEach(t => console.log(`  - ${t.name}`));
  
  // Показываем схему
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name=?").get("scale_jobs");
  console.log("\n📝 Схема scale_jobs:");
  console.log(schema.sql);
  
  console.log("\n✅ Миграция успешно применена!");
  
} catch (error) {
  console.error("\n❌ Ошибка:", error.message);
  console.error(error.stack);
  process.exit(1);
}

db.close();
