/**
 * SQLite Database Layer
 * better-sqlite3 for synchronous, fast operations
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database path from env or default
const DB_PATH = process.env.DB_PATH || '/data/db/synthnova.sqlite';

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// =============================================
// SCHEMA INITIALIZATION
// =============================================

db.exec(`
  -- Shots table: исходные видео-фрагменты
  CREATE TABLE IF NOT EXISTS shots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('hook', 'mid', 'cta')),
    filename TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    duration REAL NOT NULL DEFAULT 0,
    tags TEXT DEFAULT '[]',
    resolution TEXT DEFAULT '1080x1920',
    fps INTEGER DEFAULT 30,
    file_size INTEGER DEFAULT 0,
    checksum TEXT,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_shots_type ON shots(type);

  -- Jobs table: задачи генерации
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    num_videos INTEGER NOT NULL,
    profile TEXT DEFAULT 'moderate',
    progress INTEGER DEFAULT 0,
    videos_completed INTEGER DEFAULT 0,
    error_message TEXT,
    share_token TEXT UNIQUE,
    share_expires_at DATETIME,
    archive_path TEXT,
    archive_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_share_token ON jobs(share_token);

  -- Share tokens table: публичные ссылки
  CREATE TABLE IF NOT EXISTS share_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    job_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    downloads_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT NULL,
    ip_whitelist TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_share_tokens_job ON share_tokens(job_id);
`);

// =============================================
// SHOTS OPERATIONS
// =============================================

export const shots = {
  // Get all shots with optional filters
  list: (filters = {}) => {
    let query = 'SELECT * FROM shots WHERE 1=1';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      // JSON array search
      filters.tags.forEach(tag => {
        query += ' AND tags LIKE ?';
        params.push(`%"${tag}"%`);
      });
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return db.prepare(query).all(...params);
  },

  // Get shot by ID
  getById: (id) => {
    return db.prepare('SELECT * FROM shots WHERE id = ?').get(id);
  },

  // Get random shots by type
  getRandom: (type, count = 1) => {
    return db.prepare(`
      SELECT * FROM shots 
      WHERE type = ? 
      ORDER BY RANDOM() 
      LIMIT ?
    `).all(type, count);
  },

  // Create new shot
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO shots (type, filename, path, duration, tags, resolution, fps, file_size, checksum)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.type,
      data.filename,
      data.path,
      data.duration || 0,
      JSON.stringify(data.tags || []),
      data.resolution || '1080x1920',
      data.fps || 30,
      data.file_size || 0,
      data.checksum || null
    );
    
    return { id: result.lastInsertRowid, ...data };
  },

  // Delete shot
  delete: (id) => {
    return db.prepare('DELETE FROM shots WHERE id = ?').run(id);
  },

  // Count shots by type
  countByType: () => {
    return db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM shots 
      GROUP BY type
    `).all();
  }
};

// =============================================
// JOBS OPERATIONS
// =============================================

export const jobs = {
  // Create new job
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO jobs (id, status, num_videos, profile)
      VALUES (?, 'queued', ?, ?)
    `);
    
    stmt.run(data.id, data.num_videos, data.profile || 'moderate');
    return jobs.getById(data.id);
  },

  // Get job by ID
  getById: (id) => {
    return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  },

  // Get job by share token
  getByShareToken: (token) => {
    return db.prepare(`
      SELECT j.* FROM jobs j
      INNER JOIN share_tokens st ON j.id = st.job_id
      WHERE st.token = ? AND st.is_active = 1 AND st.expires_at > datetime('now')
    `).get(token);
  },

  // Update job status
  updateStatus: (id, status, extra = {}) => {
    let query = 'UPDATE jobs SET status = ?';
    const params = [status];

    if (status === 'processing') {
      query += ", started_at = datetime('now')";
    }
    if (status === 'completed') {
      query += ", completed_at = datetime('now'), progress = 100";
    }
    if (extra.progress !== undefined) {
      query += ', progress = ?';
      params.push(extra.progress);
    }
    if (extra.videos_completed !== undefined) {
      query += ', videos_completed = ?';
      params.push(extra.videos_completed);
    }
    if (extra.error_message) {
      query += ', error_message = ?';
      params.push(extra.error_message);
    }
    if (extra.share_token) {
      query += ', share_token = ?';
      params.push(extra.share_token);
    }
    if (extra.share_expires_at) {
      query += ', share_expires_at = ?';
      params.push(extra.share_expires_at);
    }
    if (extra.archive_path) {
      query += ', archive_path = ?';
      params.push(extra.archive_path);
    }
    if (extra.archive_size) {
      query += ', archive_size = ?';
      params.push(extra.archive_size);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    return jobs.getById(id);
  },

  // List jobs
  list: (filters = {}) => {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return db.prepare(query).all(...params);
  }
};

// =============================================
// SHARE TOKENS OPERATIONS
// =============================================

export const shareTokens = {
  // Create share token
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO share_tokens (token, job_id, expires_at, max_downloads)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(
      data.token,
      data.job_id,
      data.expires_at,
      data.max_downloads || null
    );
    
    return shareTokens.getByToken(data.token);
  },

  // Get by token
  getByToken: (token) => {
    return db.prepare(`
      SELECT * FROM share_tokens 
      WHERE token = ? AND is_active = 1
    `).get(token);
  },

  // Validate token (check expiry and download limit)
  validate: (token) => {
    const record = db.prepare(`
      SELECT * FROM share_tokens 
      WHERE token = ? 
        AND is_active = 1 
        AND expires_at > datetime('now')
        AND (max_downloads IS NULL OR downloads_count < max_downloads)
    `).get(token);
    
    return record || null;
  },

  // Increment download count
  incrementDownloads: (token) => {
    return db.prepare(`
      UPDATE share_tokens 
      SET downloads_count = downloads_count + 1 
      WHERE token = ?
    `).run(token);
  },

  // Deactivate token
  deactivate: (token) => {
    return db.prepare(`
      UPDATE share_tokens SET is_active = 0 WHERE token = ?
    `).run(token);
  }
};

export default db;
