/**
 * Shots Routes
 * REST API for shot management
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import shotService from '../services/shot-service.js';

const router = Router();

// Multer config for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  }
});

/**
 * GET /shots
 * List shots with optional filters
 * Query params: type, tags (comma-separated), limit
 */
router.get('/', (req, res) => {
  try {
    const { type, tags, limit } = req.query;
    
    const filters = {};
    if (type && ['hook', 'mid', 'cta'].includes(type)) {
      filters.type = type;
    }
    if (tags) {
      filters.tags = tags.split(',').map(t => t.trim());
    }
    if (limit) {
      filters.limit = parseInt(limit);
    }
    
    const shots = shotService.listShots(filters);
    
    res.json({
      success: true,
      count: shots.length,
      shots: shots.map(s => ({
        ...s,
        tags: JSON.parse(s.tags || '[]'),
        url: `/data/shots/${s.type}/${s.filename}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /shots/stats
 * Get shot statistics by type
 */
router.get('/stats', (req, res) => {
  try {
    const stats = shotService.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /shots/:id
 * Get shot by ID
 */
router.get('/:id', (req, res) => {
  try {
    const shot = shotService.getShotById(parseInt(req.params.id));
    
    if (!shot) {
      return res.status(404).json({ error: 'Shot not found' });
    }
    
    res.json({
      success: true,
      shot: {
        ...shot,
        tags: JSON.parse(shot.tags || '[]'),
        url: `/data/shots/${shot.type}/${shot.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /shots/upload
 * Upload shot(s)
 * Body (multipart/form-data):
 *   - type: hook | mid | cta (required)
 *   - tags: comma-separated or array
 *   - files: one or multiple video files
 */
router.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    const { type, tags } = req.body;
    
    // Validate type
    if (!type || !['hook', 'mid', 'cta'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be: hook, mid, or cta' 
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Parse tags
    const parsedTags = tags 
      ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags)
      : [];
    
    // Process batch upload
    const results = await shotService.processBatchUpload(
      req.files, 
      type, 
      parsedTags
    );
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    res.json({
      success: true,
      uploaded: successful.length,
      failed: failed.length,
      results: results.map(r => {
        if (r.success) {
          return {
            shot_id: r.shot.id,
            type: r.shot.type,
            url_or_path: `/data/shots/${r.shot.type}/${r.shot.filename}`,
            duration: r.shot.duration
          };
        }
        return {
          error: r.error,
          filename: r.filename
        };
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /shots/:id
 * Delete shot by ID
 */
router.delete('/:id', (req, res) => {
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
 * GET /shots/random/:type
 * Get random shots by type (for generator)
 */
router.get('/random/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { count } = req.query;
    
    if (!['hook', 'mid', 'cta'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    const shots = shotService.getRandomShots(
      type === 'hook' ? parseInt(count) || 1 : 1,
      type === 'mid' ? parseInt(count) || 3 : 3,
      type === 'cta' ? parseInt(count) || 1 : 1
    );
    
    res.json({ success: true, shots: shots[`${type}s`] || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
