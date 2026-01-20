/**
 * Нормализация видео в стандартный формат
 * Цель: 1080x1920, 30 FPS, H264, AAC
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const FFMPEG_PATH = 'ffmpeg';

// Стандартные параметры для всех шотов
export const STANDARD_FORMAT = {
  width: 1080,
  height: 1920,
  fps: 30,
  video_codec: 'libx264',
  video_preset: 'fast',
  video_crf: 23,  // Качество (18-28, меньше = лучше)
  audio_codec: 'aac',
  audio_bitrate: '128k',
  audio_samplerate: 48000
};

/**
 * Нормализовать видео в стандартный формат
 * @param {string} inputPath - путь к исходному файлу
 * @param {string} outputPath - путь для нормализованного файла
 * @returns {Promise<object>} - метаданные нормализованного видео
 */
export async function normalizeVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-i', inputPath,
      
      // Видео обработка
      '-vf', `scale=${STANDARD_FORMAT.width}:${STANDARD_FORMAT.height}:force_original_aspect_ratio=decrease,pad=${STANDARD_FORMAT.width}:${STANDARD_FORMAT.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${STANDARD_FORMAT.fps}`,
      '-c:v', STANDARD_FORMAT.video_codec,
      '-preset', STANDARD_FORMAT.video_preset,
      '-crf', STANDARD_FORMAT.video_crf.toString(),
      
      // Аудио обработка
      '-c:a', STANDARD_FORMAT.audio_codec,
      '-b:a', STANDARD_FORMAT.audio_bitrate,
      '-ar', STANDARD_FORMAT.audio_samplerate.toString(),
      
      // Дополнительные опции
      '-movflags', '+faststart',  // Быстрый старт для веба
      '-y',  // Перезаписать если существует
      
      outputPath
    ];
    
    console.log(`[Normalize] Processing: ${path.basename(inputPath)}`);
    
    const process = spawn(FFMPEG_PATH, ffmpegArgs);
    
    let stderr = '';
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`[Normalize] ✓ Success: ${path.basename(outputPath)}`);
        
        // Получить метаданные нормализованного файла
        const stats = fs.statSync(outputPath);
        
        resolve({
          success: true,
          input_path: inputPath,
          output_path: outputPath,
          file_size: stats.size,
          format: STANDARD_FORMAT
        });
      } else {
        console.error(`[Normalize] ✗ Failed: ${path.basename(inputPath)} (code ${code})`);
        console.error(stderr);
        
        reject(new Error(`FFmpeg normalization failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(new Error(`FFmpeg process error: ${err.message}`));
    });
  });
}

/**
 * Обработка загруженного шота с нормализацией
 */
export async function processShotWithNormalization(file, type, tags = []) {
  const timestamp = Date.now();
  const originalExt = path.extname(file.originalname);
  
  // Пути для оригинала и нормализованного
  const originalFilename = `${type}_${timestamp}_original${originalExt}`;
  const normalizedFilename = `${type}_${timestamp}.mp4`;
  
  const originalPath = path.join(SHOTS_DIR, type, originalFilename);
  const normalizedPath = path.join(SHOTS_DIR, type, normalizedFilename);
  
  // 1. Переместить оригинал
  fs.renameSync(file.path, originalPath);
  
  try {
    // 2. Нормализовать
    await normalizeVideo(originalPath, normalizedPath);
    
    // 3. Удалить оригинал (опционально, можно оставить)
    // fs.unlinkSync(originalPath);
    
    // 4. Получить метаданные нормализованного файла
    const metadata = await getVideoMetadata(normalizedPath);
    const checksum = getChecksum(normalizedPath);
    
    // 5. Сохранить в базу данных
    const shot = shots.create({
      type,
      filename: normalizedFilename,
      path: normalizedPath,
      duration: metadata.duration,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      resolution: `${STANDARD_FORMAT.width}x${STANDARD_FORMAT.height}`,
      fps: STANDARD_FORMAT.fps,
      file_size: metadata.file_size,
      checksum,
      normalized: true,
      original_filename: originalFilename
    });
    
    return shot;
    
  } catch (error) {
    // Откатить изменения если нормализация провалилась
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
    }
    
    throw new Error(`Shot normalization failed: ${error.message}`);
  }
}

export default {
  normalizeVideo,
  processShotWithNormalization,
  STANDARD_FORMAT
};
