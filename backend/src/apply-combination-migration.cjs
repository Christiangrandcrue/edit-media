const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = '/data/db/synthnova.sqlite';
const MIGRATION_PATH = '/home/synthnova/backend/migrations/create_combination_jobs.sql';

console.log('📂 DB:', DB_PATH);
console.log('📄 Migration:', MIGRATION_PATH);

const db = new Database(DB_PATH);

try {
  const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  
  console.log(`\n🔧 Применяю ${statements.length} операций...\n`);
  
  statements.forEach((statement, index) => {
    const trimmed = statement.trim();
    if (trimmed) {
      console.log(`${index + 1}. ${trimmed.substring(0, 60)}...`);
      db.exec(trimmed);
    }
  });
  
  console.log('\n✅ Миграция применена успешно!');
  
  // Проверка созданных таблиц
  const jobs = db.prepare("SELECT COUNT(*) as count FROM combination_jobs").get();
  const masters = db.prepare("SELECT COUNT(*) as count FROM combination_masters").get();
  
  console.log(`\n📊 Таблицы созданы:`);
  console.log(`   - combination_jobs: ${jobs.count} записей`);
  console.log(`   - combination_masters: ${masters.count} записей`);
  
} catch (error) {
  console.error('❌ Ошибка миграции:', error.message);
  process.exit(1);
} finally {
  db.close();
}
