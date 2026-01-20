const Database = require('better-sqlite3');
const db = new Database('/data/db/synthnova.sqlite');

const projectId = 'project_1768734645863_ldx0s1mv';
const assetId = 'asset_1768734647520_6hwak123';

console.log('Проверка таблицы project_assets:');

// Проверка asset
const asset = db.prepare(`
  SELECT asset_id, asset_type FROM project_assets 
  WHERE project_id = ? AND asset_id = ?
`).get(projectId, assetId);

console.log('Asset:', asset);

// Проверка всех хуков
const hooks = db.prepare(`
  SELECT asset_id, asset_type FROM project_assets 
  WHERE project_id = ? AND asset_type = 'hook'
`).all(projectId);

console.log(`\nВсего хуков: ${hooks.length}`);
hooks.forEach(h => console.log(`  - ${h.asset_id}`));

db.close();
