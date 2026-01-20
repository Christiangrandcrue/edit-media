const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DB_PATH = "/data/db/synthnova.sqlite";
const MIGRATION_PATH = path.join(__dirname, "../migrations/create_scale_jobs.sql");

console.log("📊 Применяю миграцию scale_jobs...");
console.log(`   DB: ${DB_PATH}`);
console.log(`   Migration: ${MIGRATION_PATH}`);

const db = new Database(DB_PATH);
const migration = fs.readFileSync(MIGRATION_PATH, "utf8");

// Применяем миграцию
try {
  db.exec(migration);
  console.log("✅ Миграция успешно применена");
  
  // Проверяем созданные таблицы
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type=? AND (name=? OR name=?)
  `).all("table", "scale_jobs", "scaled_videos");
  
  console.log("\n📋 Созданные таблицы:");
  tables.forEach(t => console.log(`  - ${t.name}`));
  
  // Показываем схему scale_jobs
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name=?").get("scale_jobs");
  console.log("\n📝 Схема scale_jobs:");
  console.log(schema.sql);
  
} catch (error) {
  console.error("❌ Ошибка:", error.message);
  process.exit(1);
}

db.close();
console.log("\n✅ Готово!");
