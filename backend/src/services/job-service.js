/**
 * Job Service
 * Handles video generation jobs: creation, tracking, archiving
 */
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import crypto from 'crypto';
import { jobs, shareTokens } from '../db/database.js';
import shotService from './shot-service.js';

const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';
const ARCHIVES_DIR = process.env.ARCHIVES_DIR || '/data/archives';
const SHARE_EXPIRY_DAYS = parseInt(process.env.SHARE_TOKEN_EXPIRY_DAYS) || 7;

// Ensure directories exist
[JOBS_DIR, ARCHIVES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate unique job ID
 */
function generateJobId() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `job_${timestamp}_${random}`;
}

/**
 * Generate share token
 */
function generateShareToken() {
  return crypto.randomBytes(8).toString('base64url');
}

/**
 * Create new generation job
 */
export function createJob(data) {
  const jobId = generateJobId();
  
  // Create job directory structure
  const jobDir = path.join(JOBS_DIR, jobId);
  const videosDir = path.join(jobDir, 'videos');
  const metaDir = path.join(jobDir, 'meta');
  
  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(metaDir, { recursive: true });
  
  // Create job in database
  const job = jobs.create({
    id: jobId,
    num_videos: data.num_videos,
    profile: data.profile || 'moderate'
  });
  
  // Initialize job.json
  const jobMeta = {
    job_id: jobId,
    status: 'queued',
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    params: {
      num_videos: data.num_videos,
      profile: data.profile || 'moderate',
      resolution: '1080x1920',
      fps: 30
    },
    progress: {
      videos_completed: 0,
      videos_total: data.num_videos,
      eta_seconds: data.num_videos * 30
    },
    shots_used: [],
    output: {
      total_videos: 0,
      total_size_bytes: 0
    },
    archive: null,
    share_token: null
  };
  
  fs.writeFileSync(
    path.join(metaDir, 'job.json'),
    JSON.stringify(jobMeta, null, 2)
  );
  
  return job;
}

/**
 * Get job status
 */
export function getJobStatus(jobId) {
  const job = jobs.getById(jobId);
  if (!job) return null;
  
  // Read job.json for detailed info
  const metaPath = path.join(JOBS_DIR, jobId, 'meta', 'job.json');
  let meta = null;
  
  if (fs.existsSync(metaPath)) {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  }
  
  return {
    ...job,
    meta,
    estimated_time: Math.ceil(job.num_videos * 30 / 60)
  };
}

/**
 * Update job progress (called by generator)
 */
export function updateJobProgress(jobId, progress) {
  const job = jobs.updateStatus(jobId, 'processing', {
    progress: progress.percent,
    videos_completed: progress.videos_completed
  });
  
  // Update job.json
  const metaPath = path.join(JOBS_DIR, jobId, 'meta', 'job.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    meta.status = 'processing';
    meta.started_at = meta.started_at || new Date().toISOString();
    meta.progress = {
      videos_completed: progress.videos_completed,
      videos_total: job.num_videos,
      eta_seconds: (job.num_videos - progress.videos_completed) * 30
    };
    
    if (progress.shots_used) {
      meta.shots_used = progress.shots_used;
    }
    
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  }
  
  return job;
}

/**
 * Complete job and create archive
 */
export async function completeJob(jobId) {
  const job = jobs.getById(jobId);
  if (!job) throw new Error('Job not found');
  
  // Generate share token
  const shareToken = generateShareToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SHARE_EXPIRY_DAYS);
  
  // Create archive
  const archivePath = await createArchive(jobId);
  const archiveStats = fs.statSync(archivePath);
  
  // Update job
  const updatedJob = jobs.updateStatus(jobId, 'completed', {
    share_token: shareToken,
    share_expires_at: expiresAt.toISOString(),
    archive_path: archivePath,
    archive_size: archiveStats.size,
    videos_completed: job.num_videos
  });
  
  // Create share token record
  shareTokens.create({
    token: shareToken,
    job_id: jobId,
    expires_at: expiresAt.toISOString(),
    max_downloads: 100
  });
  
  // Update job.json
  const metaPath = path.join(JOBS_DIR, jobId, 'meta', 'job.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    meta.status = 'completed';
    meta.completed_at = new Date().toISOString();
    meta.progress.videos_completed = job.num_videos;
    meta.progress.eta_seconds = 0;
    meta.archive = {
      path: archivePath,
      size_bytes: archiveStats.size,
      created_at: new Date().toISOString()
    };
    meta.share_token = shareToken;
    meta.share_expires_at = expiresAt.toISOString();
    
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  }
  
  return updatedJob;
}

/**
 * Create ZIP archive from job results
 */
export function createArchive(jobId) {
  return new Promise((resolve, reject) => {
    const jobDir = path.join(JOBS_DIR, jobId);
    const videosDir = path.join(jobDir, 'videos');
    const metaPath = path.join(jobDir, 'meta', 'job.json');
    const archivePath = path.join(ARCHIVES_DIR, `${jobId}.zip`);
    
    // Check if archive already exists
    if (fs.existsSync(archivePath)) {
      return resolve(archivePath);
    }
    
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => resolve(archivePath));
    archive.on('error', reject);
    
    archive.pipe(output);
    
    // Add videos
    if (fs.existsSync(videosDir)) {
      archive.directory(videosDir, 'videos');
    }
    
    // Add job.json
    if (fs.existsSync(metaPath)) {
      archive.file(metaPath, { name: 'meta/job.json' });
    }
    
    archive.finalize();
  });
}

/**
 * Get archive path, create if doesn't exist
 */
export async function getOrCreateArchive(jobId) {
  const job = jobs.getById(jobId);
  if (!job) throw new Error('Job not found');
  
  if (job.status !== 'completed') {
    throw new Error('Job not completed yet');
  }
  
  let archivePath = job.archive_path;
  
  // Create archive if it doesn't exist
  if (!archivePath || !fs.existsSync(archivePath)) {
    archivePath = await createArchive(jobId);
    jobs.updateStatus(jobId, 'completed', { archive_path: archivePath });
  }
  
  return archivePath;
}

/**
 * Get job by share token
 */
export function getJobByShareToken(token) {
  // Validate token
  const tokenRecord = shareTokens.validate(token);
  if (!tokenRecord) return null;
  
  const job = jobs.getById(tokenRecord.job_id);
  return job;
}

/**
 * Record download via share token
 */
export function recordShareDownload(token) {
  shareTokens.incrementDownloads(token);
}

/**
 * List all jobs
 */
export function listJobs(filters = {}) {
  return jobs.list(filters);
}

/**
 * Cancel job
 */
export function cancelJob(jobId) {
  return jobs.updateStatus(jobId, 'cancelled');
}

export default {
  createJob,
  getJobStatus,
  updateJobProgress,
  completeJob,
  createArchive,
  getOrCreateArchive,
  getJobByShareToken,
  recordShareDownload,
  listJobs,
  cancelJob
};
