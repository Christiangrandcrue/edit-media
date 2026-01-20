const Database = require("better-sqlite3");
const db = new Database("/data/db/synthnova.sqlite");

console.log("📋 Scale таблицы:\n");

const tables = db.prepare(`
  SELECT name, sql FROM sqlite_master 
  WHERE type = 'table' AND name LIKE 'scale%'
`).all();

if (tables.length === 0) {
  console.log("❌ Scale таблицы не найдены!");
} else {
  tables.forEach(t => {
    console.log(`\n=== ${t.name} ===`);
    console.log(t.sql);
  });
}

db.close();
