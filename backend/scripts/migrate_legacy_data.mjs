import Database from 'better-sqlite3';

const DB_PATH = '/data/db/synthnova.sqlite';
const db = new Database(DB_PATH);

// Создать Legacy проект
const project_id = `project_legacy_${Date.now()}`;
const created_at = new Date().toISOString();

db.prepare(`
  INSERT INTO projects (project_id, name, description, status, created_at, updated_at)
  VALUES (?, ?, ?, 'active', ?, ?)
`).run(project_id, 'Legacy', 'Миграция старых шотов', created_at, created_at);

console.log(`✅ Legacy проект создан: ${project_id}`);

// Мигрировать shots в project_assets
const shots = db.prepare('SELECT * FROM shots').all();
console.log(`Найдено ${shots.length} шотов`);

let migrated = 0;
for (const shot of shots) {
  const asset_id = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  db.prepare(`
    INSERT INTO project_assets (
      asset_id, project_id, asset_type, file_path,
      original_filename, file_size, metadata, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    asset_id,
    project_id,
    shot.type,  // Используем type вместо shot_type
    shot.path,  // Используем path вместо file_path
    shot.filename,  // Используем filename вместо original_filename
    shot.file_size,
    JSON.stringify({ 
      shot_id: shot.id,
      duration: shot.duration,
      resolution: shot.resolution,
      fps: shot.fps
    }),
    shot.created_at
  );
  
  migrated++;
}

console.log(`✅ Мигрировано ${migrated} шотов`);

// Статистика
const stats = db.prepare(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN asset_type = 'hook' THEN 1 ELSE 0 END) as hooks,
    SUM(CASE WHEN asset_type = 'mid' THEN 1 ELSE 0 END) as mids,
    SUM(CASE WHEN asset_type = 'cta' THEN 1 ELSE 0 END) as ctas
  FROM project_assets WHERE project_id = ?
`).get(project_id);

console.log(`\nСтатистика проекта ${project_id}:`);
console.log(`  Проектов: 1`);
console.log(`  Материалов: ${stats.total}`);
console.log(`  - Hooks: ${stats.hooks}`);
console.log(`  - Mids: ${stats.mids}`);
console.log(`  - CTAs: ${stats.ctas}`);

db.close();
