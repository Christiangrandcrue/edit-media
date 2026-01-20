/**
 * Synthnova VPS Backend Server
 * Express-based REST API + WebSocket for video generation system
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';

// Routes
import shotsRouter from './routes/shots.js';
import jobsRouter from './routes/jobs.js';
import shareRouter from './routes/share.js';
import adminRouter from './routes/admin.js';
import projectsRouter from './routes/projects-router.js';

// Services
import jobQueue from './services/job-queue.js';
import { checkFFmpeg } from './services/generator.js';

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// =============================================
// MIDDLEWARE
// =============================================

// CORS - allow frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// JSON body parser
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Key validation (optional, for internal endpoints)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// =============================================
// ROUTES
// =============================================

// Health check with extended info
app.get('/status', async (req, res) => {
  const ffmpegStatus = await checkFFmpeg();
  const queueStatus = jobQueue.getQueueStatus();
  
  res.json({
    status: 'online',
    service: 'synthnova-vps-backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ffmpeg: ffmpegStatus,
    queue: queueStatus,
    websocket: {
      port: WS_PORT,
      url: `ws://${req.hostname}:${WS_PORT}`
    }
  });
});

// Public routes
app.use('/shots', shotsRouter);
app.use('/jobs', jobsRouter);
app.use('/share', shareRouter);
app.use('/projects', projectsRouter);
app.use('/admin', adminRouter);

// Queue status endpoint
app.get('/queue', (req, res) => {
  res.json(jobQueue.getQueueStatus());
});

// Static file serving for /data directory
app.use('/data', express.static(process.env.DATA_DIR || '/data'));

// Download endpoint (alias for convenience)
app.get('/download/:jobId', async (req, res) => {
  res.redirect(`/jobs/${req.params.jobId}/archive`);
});

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// =============================================
// HTTP SERVER
// =============================================

const httpServer = http.createServer(app);

// =============================================
// WEBSOCKET SERVER
// =============================================

const wss = new WebSocketServer({ port: WS_PORT });

// Set WSS reference in job queue
jobQueue.setWebSocketServer(wss);

wss.on('connection', (ws, req) => {
  console.log(`[WS] Client connected from ${req.socket.remoteAddress}`);
  
  // Initialize client state
  ws.subscribedJobs = new Set();
  ws.isAlive = true;
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Synthnova WebSocket',
    timestamp: Date.now()
  }));
  
  // Handle messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          // Subscribe to specific job updates
          if (message.job_id) {
            ws.subscribedJobs.add(message.job_id);
            ws.send(JSON.stringify({
              type: 'subscribed',
              job_id: message.job_id
            }));
          }
          break;
          
        case 'unsubscribe':
          // Unsubscribe from job
          if (message.job_id) {
            ws.subscribedJobs.delete(message.job_id);
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              job_id: message.job_id
            }));
          }
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'get_queue':
          ws.send(JSON.stringify({
            type: 'queue_status',
            ...jobQueue.getQueueStatus()
          }));
          break;
          
        default:
          console.log('[WS] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[WS] Message parse error:', error.message);
    }
  });
  
  // Handle pong for heartbeat
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Handle disconnect
  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('[WS] Client error:', error.message);
  });
});

// Heartbeat interval to detect dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// =============================================
// SERVER START
// =============================================

httpServer.listen(PORT, '0.0.0.0', async () => {
  // Initialize job queue
  const queueInit = await jobQueue.initQueue();
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎬 Synthnova VPS Backend v2.0                               ║
║                                                               ║
║   HTTP Server:  http://0.0.0.0:${PORT}                          ║
║   WebSocket:    ws://0.0.0.0:${WS_PORT}                          ║
║   Status:       http://localhost:${PORT}/status                 ║
║                                                               ║
║   API Endpoints:                                              ║
║   • GET  /shots           - List shots                        ║
║   • POST /shots/upload    - Upload shots                      ║
║   • POST /jobs            - Create job (auto-queued)          ║
║   • GET  /jobs/:id        - Job status                        ║
║   • GET  /jobs/:id/archive - Download archive                 ║
║   • GET  /queue           - Queue status                      ║
║   • GET  /share/:token    - Public share link                 ║
║   • GET  /admin/*         - Admin panel API                   ║
║                                                               ║
║   WebSocket Events:                                           ║
║   • job_queued, job_started, job_progress                     ║
║   • video_complete, job_completed, job_failed                 ║
║                                                               ║
║   FFmpeg: ${queueInit.ffmpeg?.available ? `✓ ${queueInit.ffmpeg.version}` : '✗ Not available'}                                  ║
║   Queue:  ${queueInit.initialized ? '✓ Initialized' : '✗ Failed'}                                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export { app, wss };
