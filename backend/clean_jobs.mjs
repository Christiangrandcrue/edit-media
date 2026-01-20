import Database from 'better-sqlite3';

const db = new Database('/data/synthnova.db');

console.log('📊 Текущие задачи:');
const jobs = db.prepare('SELECT id, status, num_videos FROM jobs LIMIT 10').all();
jobs.forEach(j => console.log(`  ${j.id}: ${j.status} (${j.num_videos} videos)`));

console.log('');
console.log('🗑️ Удаляем старые задачи (queued, processing, failed)...');
const result = db.prepare('DELETE FROM jobs WHERE status IN (?, ?, ?)').run('queued', 'processing', 'failed');
console.log(`✅ Удалено: ${result.changes} задач`);

console.log('');
console.log('📊 Осталось задач:');
const remaining = db.prepare('SELECT COUNT(*) as total FROM jobs').get();
console.log(`  Всего: ${remaining.total}`);

db.close();
