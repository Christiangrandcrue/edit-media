/**
 * Job Queue Worker
 * Обработка очереди генерации с WebSocket уведомлениями
 */
import { jobs } from '../db/database.js';
import { runGeneratorJob, checkFFmpeg } from './generator.js';
import jobService from './job-service.js';

// Queue state
let isProcessing = false;
let currentJob = null;
let wsServer = null;

/**
 * Set WebSocket server reference for broadcasting
 */
export function setWebSocketServer(wss) {
  wsServer = wss;
}

/**
 * Broadcast message to all connected WebSocket clients
 */
function broadcast(type, data) {
  if (!wsServer) return;
  
  const message = JSON.stringify({ type, ...data, timestamp: Date.now() });
  
  wsServer.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

/**
 * Broadcast to specific job subscribers
 */
function broadcastToJob(jobId, type, data) {
  if (!wsServer) return;
  
  const message = JSON.stringify({ type, job_id: jobId, ...data, timestamp: Date.now() });
  
  wsServer.clients.forEach(client => {
    // Check if client is subscribed to this job
    if (client.readyState === 1 && (!client.subscribedJobs || client.subscribedJobs.has(jobId))) {
      client.send(message);
    }
  });
}

/**
 * Process next job in queue
 */
async function processNextJob() {
  if (isProcessing) return;
  
  // Get next queued job
  const queuedJobs = jobs.list({ status: 'queued', limit: 1 });
  if (queuedJobs.length === 0) {
    console.log('[Queue] No jobs in queue');
    return;
  }
  
  const job = queuedJobs[0];
  currentJob = job;
  isProcessing = true;
  
  console.log(`[Queue] Processing job ${job.id}`);
  
  // Update job status to processing
  jobs.updateStatus(job.id, 'processing');
  
  // Broadcast job started
  broadcast('job_started', {
    job_id: job.id,
    num_videos: job.num_videos,
    profile: job.profile
  });
  
  try {
    // Run generator
    const result = await runGeneratorJob(job.id, job.num_videos, job.profile, {
      onProgress: (progress) => {
        // Update database
        jobs.updateStatus(job.id, 'processing', {
          progress: progress.percent,
          videos_completed: progress.videos_completed
        });
        
        // Broadcast progress
        broadcastToJob(job.id, 'job_progress', progress);
      },
      
      onVideoComplete: (data) => {
        broadcastToJob(job.id, 'video_complete', data);
      },
      
      onError: (error) => {
        broadcastToJob(job.id, 'video_error', error);
      },
      
      onComplete: async (result) => {
        // Complete job and create archive
        await jobService.completeJob(job.id);
        
        broadcast('job_completed', {
          job_id: job.id,
          successful: result.successful,
          failed: result.failed,
          download_url: `/jobs/${job.id}/archive`
        });
      }
    });
    
  } catch (error) {
    console.error(`[Queue] Job ${job.id} failed:`, error.message);
    
    // Update job status to failed
    jobs.updateStatus(job.id, 'failed', {
      error_message: error.message
    });
    
    // Broadcast failure
    broadcast('job_failed', {
      job_id: job.id,
      error: error.message
    });
  } finally {
    isProcessing = false;
    currentJob = null;
    
    // Process next job
    setImmediate(processNextJob);
  }
}

/**
 * Add job to queue and start processing
 */
export function enqueueJob(jobId) {
  console.log(`[Queue] Job ${jobId} enqueued`);
  
  // Broadcast
  broadcast('job_queued', { job_id: jobId });
  
  // Start processing if not already
  if (!isProcessing) {
    setImmediate(processNextJob);
  }
}

/**
 * Get queue status
 */
export function getQueueStatus() {
  const queued = jobs.list({ status: 'queued' });
  const processing = jobs.list({ status: 'processing' });
  
  return {
    is_processing: isProcessing,
    current_job: currentJob ? {
      id: currentJob.id,
      progress: currentJob.progress,
      videos_completed: currentJob.videos_completed,
      num_videos: currentJob.num_videos
    } : null,
    queued_count: queued.length,
    queued_jobs: queued.map(j => ({
      id: j.id,
      num_videos: j.num_videos,
      created_at: j.created_at
    })),
    processing_count: processing.length
  };
}

/**
 * Cancel job (if queued)
 */
export function cancelJob(jobId) {
  const job = jobs.getById(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  if (job.status === 'queued') {
    jobs.updateStatus(jobId, 'cancelled');
    broadcast('job_cancelled', { job_id: jobId });
    return { cancelled: true };
  }
  
  if (job.status === 'processing' && currentJob?.id === jobId) {
    // TODO: Implement graceful stop
    throw new Error('Cannot cancel job in progress (feature coming soon)');
  }
  
  throw new Error(`Cannot cancel job with status: ${job.status}`);
}

/**
 * Initialize queue worker
 */
export async function initQueue() {
  // Check FFmpeg availability
  const ffmpegStatus = await checkFFmpeg();
  
  if (!ffmpegStatus.available) {
    console.error('[Queue] FFmpeg not available:', ffmpegStatus.error);
    return { initialized: false, error: 'FFmpeg not available' };
  }
  
  console.log(`[Queue] Initialized with FFmpeg ${ffmpegStatus.version}`);
  
  // Resume any interrupted jobs
  const processingJobs = jobs.list({ status: 'processing' });
  for (const job of processingJobs) {
    console.log(`[Queue] Resetting interrupted job ${job.id} to queued`);
    jobs.updateStatus(job.id, 'queued');
  }
  
  // Start processing
  setImmediate(processNextJob);
  
  return {
    initialized: true,
    ffmpeg: ffmpegStatus
  };
}

export default {
  setWebSocketServer,
  enqueueJob,
  getQueueStatus,
  cancelJob,
  initQueue
};
