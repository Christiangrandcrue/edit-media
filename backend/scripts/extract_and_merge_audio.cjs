#!/usr/bin/env node

/**
 * Script: Extract and Merge Audio from Shots
 * 
 * Usage: node extract_and_merge_audio.js <job_id> <video_index>
 * 
 * Example: node extract_and_merge_audio.js job_1768725682222_010da99c 1
 * 
 * What it does:
 * 1. Reads video metadata (shots_used)
 * 2. Extracts audio from each shot
 * 3. Merges audio tracks in order (Hook -> Mid1 -> Mid2 -> CTA)
 * 4. Saves merged audio as MP3
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

// Configuration
const DB_PATH = process.env.DB_PATH || '/data/db/synthnova.sqlite';
const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';
const SHOTS_DIR = process.env.SHOTS_DIR || '/data/shots';

// Parse arguments
const [,, jobId, videoIndexStr] = process.argv;

if (!jobId || !videoIndexStr) {
  console.error('Usage: node extract_and_merge_audio.js <job_id> <video_index>');
  console.error('Example: node extract_and_merge_audio.js job_1768725682222_010da99c 1');
  process.exit(1);
}

const videoIndex = parseInt(videoIndexStr);
const videoNumber = String(videoIndex).padStart(4, '0');

// Paths
const metadataPath = path.join(JOBS_DIR, jobId, 'videos', `video_${videoNumber}_metadata.json`);
const audioOutputPath = path.join(JOBS_DIR, jobId, 'videos', `video_${videoNumber}_audio.mp3`);

console.log(`\n🎵 Извлечение и объединение аудио для ${jobId} / video ${videoIndex}\n`);

// 1. Read metadata
if (!fs.existsSync(metadataPath)) {
  console.error(`❌ Metadata not found: ${metadataPath}`);
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const { shots_used } = metadata;

console.log(`📋 Шоты использованы:`);
console.log(`   Hook: ${shots_used.hook_ids.join(', ')}`);
console.log(`   Mid: ${shots_used.mid_ids.join(', ')}`);
console.log(`   CTA: ${shots_used.cta_ids.join(', ')}\n`);

// 2. Get shot paths from database
const db = new Database(DB_PATH, { readonly: true });

function getShotPath(shotId) {
  const shot = db.prepare('SELECT path FROM shots WHERE id = ?').get(shotId);
  if (!shot) {
    throw new Error(`Shot not found in database: ${shotId}`);
  }
  return shot.path;
}

const shotPaths = [];

// Add hooks
shots_used.hook_ids.forEach(id => {
  shotPaths.push({ id, path: getShotPath(id), type: 'hook' });
});

// Add mids
shots_used.mid_ids.forEach(id => {
  shotPaths.push({ id, path: getShotPath(id), type: 'mid' });
});

// Add ctas
shots_used.cta_ids.forEach(id => {
  shotPaths.push({ id, path: getShotPath(id), type: 'cta' });
});

db.close();

console.log(`📁 Пути к шотам:`);
shotPaths.forEach(shot => {
  console.log(`   ${shot.type.toUpperCase()} #${shot.id}: ${shot.path}`);
});

// 3. Extract audio from each shot
const tempDir = path.join('/tmp', `audio_${jobId}_${videoIndex}`);
if (fs.existsSync(tempDir)) {
  execSync(`rm -rf ${tempDir}`);
}
fs.mkdirSync(tempDir, { recursive: true });

console.log(`\n🔧 Извлечение аудио из шотов...`);

const audioFiles = [];

shotPaths.forEach((shot, index) => {
  const audioPath = path.join(tempDir, `audio_${index + 1}.mp3`);
  
  try {
    // Extract audio using FFmpeg
    execSync(
      `ffmpeg -i "${shot.path}" -vn -acodec libmp3lame -q:a 2 "${audioPath}" -y 2>/dev/null`,
      { stdio: 'ignore' }
    );
    
    const size = fs.statSync(audioPath).size;
    console.log(`   ✅ ${shot.type.toUpperCase()} #${shot.id} -> audio_${index + 1}.mp3 (${(size / 1024).toFixed(1)} KB)`);
    
    audioFiles.push(audioPath);
  } catch (error) {
    console.error(`   ❌ Failed to extract audio from ${shot.path}: ${error.message}`);
  }
});

// 4. Create concat file
const concatFilePath = path.join(tempDir, 'concat_list.txt');
const concatContent = audioFiles.map(f => `file '${f}'`).join('\n');
fs.writeFileSync(concatFilePath, concatContent);

console.log(`\n🔗 Объединение аудио дорожек...`);

// 5. Merge audio files
try {
  execSync(
    `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c:a libmp3lame -q:a 2 "${audioOutputPath}" -y 2>/dev/null`,
    { stdio: 'ignore' }
  );
  
  const finalSize = fs.statSync(audioOutputPath).size;
  console.log(`   ✅ Объединено аудио: ${audioOutputPath} (${(finalSize / 1024).toFixed(1)} KB)`);
} catch (error) {
  console.error(`   ❌ Failed to merge audio: ${error.message}`);
  process.exit(1);
}

// 6. Cleanup
execSync(`rm -rf ${tempDir}`);

console.log(`\n✅ Готово! Аудио файл: ${audioOutputPath}\n`);
