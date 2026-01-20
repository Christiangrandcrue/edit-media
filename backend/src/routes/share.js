/**
 * Share Routes
 * Public share link handling
 */
import { Router } from 'express';
import fs from 'fs';
import jobService from '../services/job-service.js';

const router = Router();

/**
 * GET /share/:token
 * Access shared job via token
 * - If Accept: text/html -> render download page
 * - Otherwise -> return JSON with download info
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Validate token and get job
    const job = jobService.getJobByShareToken(token);
    
    if (!job) {
      // Check if it's HTML request
      if (req.accepts('html')) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ссылка недействительна</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gradient-to-br from-red-500 to-orange-500 min-h-screen flex items-center justify-center p-4">
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center max-w-md">
              <div class="text-6xl mb-4">❌</div>
              <h1 class="text-2xl font-bold mb-2">Ссылка недействительна</h1>
              <p class="opacity-90">Срок действия ссылки истёк или достигнут лимит скачиваний.</p>
            </div>
          </body>
          </html>
        `);
      }
      
      return res.status(404).json({ 
        error: 'Invalid or expired share token' 
      });
    }
    
    // Record download attempt
    jobService.recordShareDownload(token);
    
    // Check if HTML request -> render download page
    if (req.accepts('html')) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Скачать видео | Synthnova</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        </head>
        <body class="bg-gradient-to-br from-purple-600 to-blue-600 min-h-screen flex items-center justify-center p-4">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center max-w-md">
            <div class="text-6xl mb-4"><i class="fas fa-video"></i></div>
            <h1 class="text-2xl font-bold mb-2">Ваши видео готовы!</h1>
            <p class="opacity-90 mb-6">
              ${job.num_videos} уникальных роликов<br>
              Профиль: ${job.profile}
            </p>
            
            <a href="/share/${token}/download" 
               class="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-8 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 mb-4">
              <i class="fas fa-download mr-2"></i>
              Скачать архив
            </a>
            
            <p class="text-sm opacity-75 mt-4">
              <i class="fas fa-clock mr-1"></i>
              Ссылка действительна до ${new Date(job.share_expires_at).toLocaleDateString('ru-RU')}
            </p>
            
            <div class="mt-6 text-xs opacity-50">
              Job ID: ${job.id}
            </div>
          </div>
        </body>
        </html>
      `);
    }
    
    // JSON response
    res.json({
      success: true,
      job_id: job.id,
      status: job.status,
      num_videos: job.num_videos,
      profile: job.profile,
      download_url: `/share/${token}/download`,
      expires_at: job.share_expires_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /share/:token/download
 * Direct download via share token
 */
router.get('/:token/download', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Validate token and get job
    const job = jobService.getJobByShareToken(token);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Invalid or expired share token' 
      });
    }
    
    if (job.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Job not completed yet',
        status: job.status
      });
    }
    
    // Get archive
    const archivePath = await jobService.getOrCreateArchive(job.id);
    
    if (!fs.existsSync(archivePath)) {
      return res.status(500).json({ error: 'Archive not found' });
    }
    
    const stats = fs.statSync(archivePath);
    const filename = `synthnova_${job.num_videos}videos.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    
    const stream = fs.createReadStream(archivePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /share/:token/videos
 * List individual videos for direct download
 */
router.get('/:token/videos', (req, res) => {
  try {
    const { token } = req.params;
    
    const job = jobService.getJobByShareToken(token);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Invalid or expired share token' 
      });
    }
    
    const jobDir = `/data/jobs/${job.id}/videos`;
    
    if (!fs.existsSync(jobDir)) {
      return res.status(404).json({ error: 'Videos not found' });
    }
    
    const videos = fs.readdirSync(jobDir)
      .filter(f => f.endsWith('.mp4'))
      .sort()
      .map((filename, index) => ({
        index: index + 1,
        filename,
        download_url: `/share/${token}/video/${filename}`
      }));
    
    res.json({
      success: true,
      job_id: job.id,
      count: videos.length,
      videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /share/:token/video/:filename
 * Download individual video
 */
router.get('/:token/video/:filename', (req, res) => {
  try {
    const { token, filename } = req.params;
    
    const job = jobService.getJobByShareToken(token);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Invalid or expired share token' 
      });
    }
    
    const videoPath = `/data/jobs/${job.id}/videos/${filename}`;
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const stats = fs.statSync(videoPath);
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    
    const stream = fs.createReadStream(videoPath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
