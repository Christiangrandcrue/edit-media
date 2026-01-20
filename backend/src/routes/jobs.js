/**
 * Jobs Routes
 * REST API for job management
 */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import jobService from '../services/job-service.js';
import jobQueue from '../services/job-queue.js';

const router = Router();

const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';

/**
 * GET /jobs
 * List all jobs with optional filters
 */
router.get('/', (req, res) => {
  try {
    const { status, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);
    
    const jobs = jobService.listJobs(filters);
    
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /jobs
 * Create new generation job
 */
router.post('/', (req, res) => {
  try {
    const { num_videos, profile } = req.body;
    
    // Validate
    if (!num_videos || num_videos < 1 || num_videos > 1000) {
      return res.status(400).json({ 
        error: 'num_videos must be between 1 and 1000' 
      });
    }
    
    const validProfiles = ['conservative', 'moderate', 'aggressive'];
    if (profile && !validProfiles.includes(profile)) {
      return res.status(400).json({ 
        error: `profile must be one of: ${validProfiles.join(', ')}` 
      });
    }
    
    const job = jobService.createJob({
      num_videos,
      profile: profile || 'moderate'
    });
    
    // Enqueue job for processing
    jobQueue.enqueueJob(job.id);
    
    // Get queue position
    const queueStatus = jobQueue.getQueueStatus();
    const queuePosition = queueStatus.queued_jobs.findIndex(j => j.id === job.id) + 1;
    
    res.status(201).json({
      success: true,
      job_id: job.id,
      status: job.status,
      num_videos: job.num_videos,
      profile: job.profile,
      estimated_time: Math.ceil(job.num_videos * 30 / 60),
      queue_position: queuePosition,
      websocket_url: `ws://${req.hostname}:${process.env.WS_PORT || 3002}`,
      message: 'Job created and queued for processing'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /jobs/:id
 * Get job status
 */
router.get('/:id', (req, res) => {
  try {
    const job = jobService.getJobStatus(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const response = {
      success: true,
      job_id: job.id,
      status: job.status,
      progress: job.progress,
      videos_completed: job.videos_completed,
      videos_total: job.num_videos,
      profile: job.profile,
      created_at: job.created_at,
      started_at: job.started_at,
      completed_at: job.completed_at
    };
    
    // Add download info for completed jobs
    if (job.status === 'completed') {
      response.download_url = `/jobs/${job.id}/archive`;
      response.share_token = job.share_token;
      response.share_expires_at = job.share_expires_at;
    }
    
    // Add ETA for processing jobs
    if (job.status === 'processing') {
      const remaining = job.num_videos - job.videos_completed;
      response.eta_minutes = Math.ceil(remaining * 30 / 60);
    }
    
    // Add error message if failed
    if (job.status === 'failed' && job.error_message) {
      response.error = job.error_message;
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /jobs/:id/archive
 * Get or create archive, stream to client
 */
router.get('/:id/archive', async (req, res) => {
  try {
    const job = jobService.getJobStatus(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Job not completed yet',
        status: job.status,
        progress: job.progress
      });
    }
    
    // Get or create archive
    const archivePath = await jobService.getOrCreateArchive(req.params.id);
    
    if (!fs.existsSync(archivePath)) {
      return res.status(500).json({ error: 'Archive creation failed' });
    }
    
    const stats = fs.statSync(archivePath);
    const filename = `export_${req.params.id}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    
    const stream = fs.createReadStream(archivePath);
    stream.pipe(res);
  } catch (error) {
    if (error.message === 'Job not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /jobs/:id/progress
 * Update job progress (internal, called by generator)
 */
router.patch('/:id/progress', (req, res) => {
  try {
    const { percent, videos_completed, shots_used } = req.body;
    
    const job = jobService.updateJobProgress(req.params.id, {
      percent: percent || 0,
      videos_completed: videos_completed || 0,
      shots_used
    });
    
    res.json({ success: true, job_id: job.id, status: job.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /jobs/:id/complete
 * Mark job as completed (internal, called by generator)
 */
router.post('/:id/complete', async (req, res) => {
  try {
    const job = await jobService.completeJob(req.params.id);
    
    res.json({
      success: true,
      job_id: job.id,
      status: job.status,
      share_token: job.share_token,
      download_url: `/jobs/${job.id}/archive`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /jobs/:id
 * Cancel job
 */
router.delete('/:id', (req, res) => {
  try {
    const job = jobService.cancelJob(req.params.id);
    res.json({ success: true, job_id: job.id, status: job.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /jobs/:id/videos
 * List videos in job
 */
router.get('/:id/videos', (req, res) => {
  try {
    const jobDir = path.join(JOBS_DIR, req.params.id, 'videos');
    
    if (!fs.existsSync(jobDir)) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const videos = fs.readdirSync(jobDir)
      .filter(f => f.endsWith('.mp4'))
      .sort()
      .map((filename, index) => ({
        index: index + 1,
        filename,
        url: `/data/jobs/${req.params.id}/videos/${filename}`
      }));
    
    res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
