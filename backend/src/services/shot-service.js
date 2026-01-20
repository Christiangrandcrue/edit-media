/**
 * Shot Service
 * Handles video shot management: upload, storage, retrieval
 */
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import { shots } from '../db/database.js';
import { normalizeVideo, STANDARD_FORMAT } from './normalize-shot.js';

const execAsync = promisify(exec);

const SHOTS_DIR = process.env.SHOTS_DIR || '/data/shots';
const FFPROBE_PATH = process.env.FFPROBE_PATH || 'ffprobe';

// Ensure shot directories exist
['hook', 'mid', 'cta'].forEach(type => {
  const dir = path.join(SHOTS_DIR, type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Get video metadata using ffprobe
 */
async function getVideoMetadata(filePath) {
  try {
    const cmd = `${FFPROBE_PATH} -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    const { stdout } = await execAsync(cmd);
    const data = JSON.parse(stdout);
    
    const videoStream = data.streams?.find(s => s.codec_type === 'video');
    
    return {
      duration: parseFloat(data.format?.duration) || 0,
      resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : '1080x1920',
      fps: videoStream?.r_frame_rate ? Math.round(eval(videoStream.r_frame_rate)) : 30,
      file_size: parseInt(data.format?.size) || 0
    };
  } catch (error) {
    console.error('FFprobe error:', error.message);
    return { duration: 0, resolution: '1080x1920', fps: 30, file_size: 0 };
  }
}

/**
 * Calculate file checksum
 */
function getChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * Process uploaded shot file
 */
export async function processShotUpload(file, type, tags = []) {
  const timestamp = Date.now();
  const tempPath = file.path; // Temporary uploaded file
  const normalizedFilename = `${type}_${timestamp}.mp4`; // Always MP4
  const destPath = path.join(SHOTS_DIR, type, normalizedFilename);
  
  console.log(`[Normalize] Processing ${file.originalname} -> ${normalizedFilename}`);
  
  try {
    // Normalize video to standard format
    console.log(`[Normalize] Normalizing to ${STANDARD_FORMAT.width}x${STANDARD_FORMAT.height} @ ${STANDARD_FORMAT.fps} FPS`);
    await normalizeVideo(tempPath, destPath);
    
    // Delete temp file after normalization
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    // Get metadata from normalized video
    const metadata = await getVideoMetadata(destPath);
    const checksum = getChecksum(destPath);
    
    console.log(`[Normalize] ✅ Normalized: ${metadata.resolution} @ ${metadata.fps} FPS, ${(metadata.file_size / 1024 / 1024).toFixed(2)} MB`);
    
    // Save to database with normalized flag
    const shot = shots.create({
      type,
      filename: normalizedFilename,
      path: destPath,
      duration: metadata.duration,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      resolution: `${STANDARD_FORMAT.width}x${STANDARD_FORMAT.height}`,
      fps: STANDARD_FORMAT.fps,
      file_size: metadata.file_size,
      checksum,
      normalized: true,
      original_filename: file.originalname
    });
    
    return shot;
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    throw error;
  }
}

/**
 * Process batch upload
 */
export async function processBatchUpload(files, type, tags = []) {
  const results = [];
  
  for (const file of files) {
    try {
      const shot = await processShotUpload(file, type, tags);
      results.push({ success: true, shot });
    } catch (error) {
      results.push({ 
        success: false, 
        filename: file.originalname,
        error: error.message 
      });
    }
  }
  
  return results;
}

/**
 * List shots with filters
 */
export function listShots(filters = {}) {
  return shots.list(filters);
}

/**
 * Get shot by ID
 */
export function getShotById(id) {
  return shots.getById(id);
}

/**
 * Delete shot
 */
export function deleteShot(id) {
  const shot = shots.getById(id);
  if (!shot) {
    throw new Error('Shot not found');
  }
  
  // Delete file
  if (fs.existsSync(shot.path)) {
    fs.unlinkSync(shot.path);
  }
  
  // Delete from database
  shots.delete(id);
  
  return { deleted: true, id };
}

/**
 * Get random shots for generation
 */
export function getRandomShots(hookCount = 1, midCount = 3, ctaCount = 1) {
  return {
    hooks: shots.getRandom('hook', hookCount),
    mids: shots.getRandom('mid', midCount),
    ctas: shots.getRandom('cta', ctaCount)
  };
}

/**
 * Get shot statistics
 */
export function getStats() {
  const counts = shots.countByType();
  const stats = { hook: 0, mid: 0, cta: 0, total: 0 };
  
  counts.forEach(row => {
    stats[row.type] = row.count;
    stats.total += row.count;
  });
  
  return stats;
}

export default {
  processShotUpload,
  processBatchUpload,
  listShots,
  getShotById,
  deleteShot,
  getRandomShots,
  getStats
};
