const Database = require("better-sqlite3");

const db = new Database("/data/db/synthnova.sqlite");

console.log("🔧 Создаю индексы...\n");

const indexes = [
  {name: "idx_scale_jobs_project_id", sql: "CREATE INDEX IF NOT EXISTS idx_scale_jobs_project_id ON scale_jobs(project_id)"},
  {name: "idx_scale_jobs_master_video_id", sql: "CREATE INDEX IF NOT EXISTS idx_scale_jobs_master_video_id ON scale_jobs(master_video_id)"},
  {name: "idx_scale_jobs_status", sql: "CREATE INDEX IF NOT EXISTS idx_scale_jobs_status ON scale_jobs(status)"},
  {name: "idx_scale_jobs_created_at", sql: "CREATE INDEX IF NOT EXISTS idx_scale_jobs_created_at ON scale_jobs(created_at)"},
  {name: "idx_scaled_videos_job_id", sql: "CREATE INDEX IF NOT EXISTS idx_scaled_videos_job_id ON scaled_videos(job_id)"},
  {name: "idx_scaled_videos_project_id", sql: "CREATE INDEX IF NOT EXISTS idx_scaled_videos_project_id ON scaled_videos(project_id)"},
  {name: "idx_scaled_videos_master_video_id", sql: "CREATE INDEX IF NOT EXISTS idx_scaled_videos_master_video_id ON scaled_videos(master_video_id)"},
  {name: "idx_scaled_videos_status", sql: "CREATE INDEX IF NOT EXISTS idx_scaled_videos_status ON scaled_videos(status)"}
];

try {
  indexes.forEach((idx, i) => {
    try {
      db.exec(idx.sql);
      console.log(`${i+1}. ✅ ${idx.name}`);
    } catch (e) {
      console.log(`${i+1}. ⚠️  ${idx.name} - ${e.message}`);
    }
  });
  
  console.log("\n✅ Индексы готовы!");
} catch (error) {
  console.error("❌ Ошибка:", error.message);
  process.exit(1);
}

db.close();
