const Database = require('better-sqlite3');
const db = new Database('/data/db/synthnova.sqlite');

console.log('📊 Таблицы в БД:');
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`).all();

tables.forEach(t => console.log(`   - ${t.name}`));

db.close();
