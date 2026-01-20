#!/usr/bin/env node

/**
 * Script: Merge Video and Audio
 * 
 * Usage: node merge_video_audio.cjs <job_id> <video_index>
 * 
 * Example: node merge_video_audio.cjs job_1768725682222_010da99c 1
 * 
 * What it does:
 * 1. Takes silent video (video_0001.mp4)
 * 2. Takes extracted audio (video_0001_audio.mp3)
 * 3. Merges them into final video with audio (video_0001_final.mp4)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';

// Parse arguments
const [,, jobId, videoIndexStr] = process.argv;

if (!jobId || !videoIndexStr) {
  console.error('Usage: node merge_video_audio.cjs <job_id> <video_index>');
  console.error('Example: node merge_video_audio.cjs job_1768725682222_010da99c 1');
  process.exit(1);
}

const videoIndex = parseInt(videoIndexStr);
const videoNumber = String(videoIndex).padStart(4, '0');

// Paths
const videoDir = path.join(JOBS_DIR, jobId, 'videos');
const silentVideoPath = path.join(videoDir, `video_${videoNumber}.mp4`);
const audioPath = path.join(videoDir, `video_${videoNumber}_audio.mp3`);
const finalVideoPath = path.join(videoDir, `video_${videoNumber}_final.mp4`);

console.log(`\n🎬 Наложение аудио на видео: ${jobId} / video ${videoIndex}\n`);

// 1. Check files exist
if (!fs.existsSync(silentVideoPath)) {
  console.error(`❌ Silent video not found: ${silentVideoPath}`);
  process.exit(1);
}

if (!fs.existsSync(audioPath)) {
  console.error(`❌ Audio file not found: ${audioPath}`);
  process.exit(1);
}

console.log(`📁 Входные файлы:`);
console.log(`   Видео (без звука): ${silentVideoPath}`);
console.log(`   Аудио: ${audioPath}`);

// 2. Get durations
const videoDuration = parseFloat(
  execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${silentVideoPath}"`).toString().trim()
);

const audioDuration = parseFloat(
  execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`).toString().trim()
);

console.log(`\n⏱️  Длительность:`);
console.log(`   Видео: ${videoDuration.toFixed(3)}s`);
console.log(`   Аудио: ${audioDuration.toFixed(3)}s`);
console.log(`   Разница: ${Math.abs(videoDuration - audioDuration).toFixed(3)}s`);

// 3. Merge video and audio
console.log(`\n🔧 Наложение аудио на видео...`);

try {
  // Use shortest duration to avoid sync issues
  const ffmpegCmd = `ffmpeg -i "${silentVideoPath}" -i "${audioPath}" ` +
    `-c:v copy -c:a aac -b:a 128k -shortest "${finalVideoPath}" -y`;
  
  execSync(ffmpegCmd, { stdio: 'ignore' });
  
  const finalSize = fs.statSync(finalVideoPath).size;
  const finalDuration = parseFloat(
    execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${finalVideoPath}"`).toString().trim()
  );
  
  console.log(`   ✅ Создано финальное видео:`);
  console.log(`      Путь: ${finalVideoPath}`);
  console.log(`      Размер: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`      Длительность: ${finalDuration.toFixed(3)}s`);
  
  // Check audio stream
  const audioStreams = execSync(`ffprobe -v quiet -show_streams -select_streams a "${finalVideoPath}"`).toString();
  
  if (audioStreams.includes('codec_name=aac')) {
    console.log(`      Аудио: AAC ✅`);
  } else {
    console.log(`      Аудио: не найдено ❌`);
  }
  
} catch (error) {
  console.error(`   ❌ Failed to merge video and audio: ${error.message}`);
  process.exit(1);
}

console.log(`\n✅ Готово! Финальное видео с аудио: ${finalVideoPath}\n`);
