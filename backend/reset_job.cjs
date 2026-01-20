const Database = require("better-sqlite3");
const db = new Database("/data/db/synthnova.sqlite");

db.prepare(`
  UPDATE combination_jobs 
  SET status = ?, error = NULL, progress = 0
  WHERE job_id = ?
`).run("queued", "job_1768899790027_ek1dxoqep");

console.log("✅ Задание возвращено в очередь");
