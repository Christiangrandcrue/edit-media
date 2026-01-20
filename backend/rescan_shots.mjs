import Database from 'better-sqlite3';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const db = new Database(process.env.DB_PATH || '/data/db/synthnova.sqlite');
const SHOTS_DIR = '/data/shots';

console.log('📂 Сканируем шоты...');

['hook', 'mid', 'cta'].forEach(type => {
  const dir = path.join(SHOTS_DIR, type);
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4') || f.endsWith('.MOV'));
  
  console.log(`\n${type.toUpperCase()}: ${files.length} файлов`);
  
  files.forEach(filename => {
    const filePath = path.join(dir, filename);
    
    // Получаем метаданные через ffprobe
    try {
      const probe = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`).toString();
      const meta = JSON.parse(probe);
      
      const video = meta.streams.find(s => s.codec_type === 'video');
      const duration = parseFloat(meta.format.duration);
      const size = parseInt(meta.format.size);
      const fps = eval(video.r_frame_rate);
      
      // Вставляем в БД
      db.prepare(`
        INSERT OR IGNORE INTO shots (type, filename, path, duration, resolution, fps, file_size, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, '[]')
      `).run(type, filename, filePath, duration, `${video.width}x${video.height}`, Math.round(fps), size);
      
      console.log(`  ✅ ${filename}`);
    } catch (err) {
      console.log(`  ❌ ${filename}: ${err.message}`);
    }
  });
});

console.log('\n📊 Финальная статистика:');
const stats = db.prepare('SELECT type, COUNT(*) as count FROM shots GROUP BY type').all();
stats.forEach(s => console.log(`  ${s.type}: ${s.count}`));

db.close();
