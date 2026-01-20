/**
 * Admin Routes
 * API для админ-панели: управление шотами, мониторинг, статистика
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { shots, jobs, shareTokens } from '../db/database.js';
import shotService from '../services/shot-service.js';
import jobQueue from '../services/job-queue.js';

const router = Router();

// Simple auth middleware (можно заменить на JWT)
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
  const expectedKey = process.env.ADMIN_KEY || 'synthnova-admin-2026';
  
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply auth to all admin routes
router.use(adminAuth);

// =============================================
// DASHBOARD
// =============================================

/**
 * GET /admin/dashboard
 * Общая статистика системы
 */
router.get('/dashboard', (req, res) => {
  try {
    // Shots stats
    const shotsStats = shotService.getStats();
    
    // Jobs stats
    const allJobs = jobs.list({});
    const jobsStats = {
      total: allJobs.length,
      queued: allJobs.filter(j => j.status === 'queued').length,
      processing: allJobs.filter(j => j.status === 'processing').length,
      completed: allJobs.filter(j => j.status === 'completed').length,
      failed: allJobs.filter(j => j.status === 'failed').length,
      cancelled: allJobs.filter(j => j.status === 'cancelled').length
    };
    
    // Videos generated
    const completedJobs = allJobs.filter(j => j.status === 'completed');
    const totalVideos = completedJobs.reduce((sum, j) => sum + j.num_videos, 0);
    
    // Queue status
    const queueStatus = jobQueue.getQueueStatus();
    
    // Disk usage (approximate)
    const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';
    const ARCHIVES_DIR = process.env.ARCHIVES_DIR || '/data/archives';
    let diskUsage = { jobs: 0, archives: 0 };
    
    try {
      if (fs.existsSync(JOBS_DIR)) {
        diskUsage.jobs = getDirSize(JOBS_DIR);
      }
      if (fs.existsSync(ARCHIVES_DIR)) {
        diskUsage.archives = getDirSize(ARCHIVES_DIR);
      }
    } catch (e) {
      // Ignore disk errors
    }
    
    res.json({
      success: true,
      dashboard: {
        shots: shotsStats,
        jobs: jobsStats,
        videos_generated: totalVideos,
        queue: queueStatus,
        disk_usage: {
          jobs_mb: Math.round(diskUsage.jobs / 1024 / 1024),
          archives_mb: Math.round(diskUsage.archives / 1024 / 1024),
          total_mb: Math.round((diskUsage.jobs + diskUsage.archives) / 1024 / 1024)
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get directory size
function getDirSize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return size;
}

// =============================================
// SHOTS MANAGEMENT
// =============================================

/**
 * GET /admin/shots
 * Список всех шотов с детальной информацией
 */
router.get('/shots', (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    
    const allShots = shotService.listShots(filters);
    
    // Pagination
    const offset = (page - 1) * limit;
    const paginatedShots = allShots.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      total: allShots.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(allShots.length / limit),
      shots: paginatedShots.map(s => ({
        ...s,
        tags: JSON.parse(s.tags || '[]'),
        preview_url: `/data/shots/${s.type}/${s.filename}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /admin/shots/:id
 * Удаление шота
 */
router.delete('/shots/:id', (req, res) => {
  try {
    const result = shotService.deleteShot(parseInt(req.params.id));
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'Shot not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /admin/shots/:id
 * Обновление тегов шота
 */
router.patch('/shots/:id', (req, res) => {
  try {
    const { tags } = req.body;
    const shot = shots.getById(parseInt(req.params.id));
    
    if (!shot) {
      return res.status(404).json({ error: 'Shot not found' });
    }
    
    // Update tags in database (direct SQL since we don't have update method)
    const db = shots.db || require('../db/database.js').default;
    db.prepare('UPDATE shots SET tags = ?, updated_at = datetime("now") WHERE id = ?')
      .run(JSON.stringify(tags || []), req.params.id);
    
    res.json({ success: true, id: parseInt(req.params.id), tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /admin/shots/batch
 * Массовое удаление шотов
 */
router.delete('/shots/batch', (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids array required' });
    }
    
    const results = { deleted: 0, failed: 0, errors: [] };
    
    for (const id of ids) {
      try {
        shotService.deleteShot(id);
        results.deleted++;
      } catch (error) {
        results.failed++;
        results.errors.push({ id, error: error.message });
      }
    }
    
    res.json({ success: true, ...results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// JOBS MANAGEMENT
// =============================================

/**
 * GET /admin/jobs
 * Список всех задач
 */
router.get('/jobs', (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    
    const allJobs = jobs.list(filters);
    
    // Pagination
    const offset = (page - 1) * limit;
    const paginatedJobs = allJobs.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      total: allJobs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(allJobs.length / limit),
      jobs: paginatedJobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /admin/jobs/:id
 * Удаление задачи и её файлов
 */
router.delete('/jobs/:id', (req, res) => {
  try {
    const jobId = req.params.id;
    const job = jobs.getById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Can only delete completed/failed/cancelled jobs
    if (job.status === 'processing' || job.status === 'queued') {
      return res.status(400).json({ 
        error: 'Cannot delete job in queue or processing' 
      });
    }
    
    // Delete job files
    const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';
    const ARCHIVES_DIR = process.env.ARCHIVES_DIR || '/data/archives';
    const jobDir = path.join(JOBS_DIR, jobId);
    const archivePath = path.join(ARCHIVES_DIR, `${jobId}.zip`);
    
    if (fs.existsSync(jobDir)) {
      fs.rmSync(jobDir, { recursive: true, force: true });
    }
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }
    
    // Delete from database (via direct SQL)
    const db = require('../db/database.js').default;
    db.prepare('DELETE FROM share_tokens WHERE job_id = ?').run(jobId);
    db.prepare('DELETE FROM jobs WHERE id = ?').run(jobId);
    
    res.json({ success: true, deleted: jobId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin/jobs/:id/retry
 * Повторный запуск упавшей задачи
 */
router.post('/jobs/:id/retry', (req, res) => {
  try {
    const jobId = req.params.id;
    const job = jobs.getById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'failed' && job.status !== 'cancelled') {
      return res.status(400).json({ 
        error: 'Can only retry failed or cancelled jobs' 
      });
    }
    
    // Reset job to queued
    jobs.updateStatus(jobId, 'queued', {
      error_message: null,
      progress: 0,
      videos_completed: 0
    });
    
    // Re-enqueue
    jobQueue.enqueueJob(jobId);
    
    res.json({ success: true, job_id: jobId, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin/jobs/:id/cancel
 * Отмена задачи
 */
router.post('/jobs/:id/cancel', (req, res) => {
  try {
    const result = jobQueue.cancelJob(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =============================================
// QUEUE MANAGEMENT
// =============================================

/**
 * GET /admin/queue
 * Детальный статус очереди
 */
router.get('/queue', (req, res) => {
  try {
    const status = jobQueue.getQueueStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin/queue/clear
 * Очистка очереди (отмена всех queued)
 */
router.post('/queue/clear', (req, res) => {
  try {
    const queuedJobs = jobs.list({ status: 'queued' });
    let cancelled = 0;
    
    for (const job of queuedJobs) {
      jobs.updateStatus(job.id, 'cancelled');
      cancelled++;
    }
    
    res.json({ success: true, cancelled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// CLEANUP
// =============================================

/**
 * POST /admin/cleanup
 * Очистка старых данных
 */
router.post('/cleanup', (req, res) => {
  try {
    const { older_than_days = 30, delete_archives = true } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - older_than_days);
    
    // Get old completed jobs
    const allJobs = jobs.list({ status: 'completed' });
    const oldJobs = allJobs.filter(j => new Date(j.completed_at) < cutoffDate);
    
    const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';
    const ARCHIVES_DIR = process.env.ARCHIVES_DIR || '/data/archives';
    
    let cleaned = { jobs: 0, archives: 0, size_freed_mb: 0 };
    
    for (const job of oldJobs) {
      const jobDir = path.join(JOBS_DIR, job.id);
      const archivePath = path.join(ARCHIVES_DIR, `${job.id}.zip`);
      
      // Get sizes before deletion
      let jobSize = 0;
      if (fs.existsSync(jobDir)) {
        jobSize = getDirSize(jobDir);
        fs.rmSync(jobDir, { recursive: true, force: true });
        cleaned.jobs++;
      }
      
      if (delete_archives && fs.existsSync(archivePath)) {
        const archiveStats = fs.statSync(archivePath);
        jobSize += archiveStats.size;
        fs.unlinkSync(archivePath);
        cleaned.archives++;
      }
      
      cleaned.size_freed_mb += jobSize / 1024 / 1024;
    }
    
    cleaned.size_freed_mb = Math.round(cleaned.size_freed_mb);
    
    res.json({ 
      success: true, 
      older_than_days,
      jobs_cleaned: oldJobs.length,
      ...cleaned 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
