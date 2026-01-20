import Database from 'better-sqlite3';

const db = new Database('/data/synthnova.db');

console.log('📋 Список таблиц в БД:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log(`  - ${t.name}`));

db.close();
