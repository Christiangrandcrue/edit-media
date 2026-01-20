-- Migration: Create project-oriented tables
-- Date: 2026-01-18

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'archived')),
  settings TEXT DEFAULT '{}' -- JSON as TEXT for SQLite
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- 2. Project assets (shots, target videos, audio)
CREATE TABLE IF NOT EXISTS project_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('shot', 'target_video', 'audio')),
  category TEXT CHECK(category IN ('hook', 'mid', 'cta', NULL)),
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  duration REAL,
  resolution TEXT,
  fps INTEGER,
  file_size INTEGER,
  checksum TEXT,
  metadata TEXT DEFAULT '{}', -- JSON as TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_type ON project_assets(type);
CREATE INDEX IF NOT EXISTS idx_project_assets_category ON project_assets(category);

-- 3. Master videos
CREATE TABLE IF NOT EXISTS master_videos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('from_shots', 'from_cut')),
  source_type TEXT CHECK(source_type IN ('manual', 'auto_cut')),
  
  -- Shots composition (if from_shots)
  shots_used TEXT DEFAULT '{}', -- JSON: {hook_ids: [], mid_ids: [], cta_ids: []}
  shots_timeline TEXT DEFAULT '[]', -- JSON: [{type, id, start, duration}]
  
  -- Cut info (if from_cut)
  source_video_id INTEGER,
  cut_start REAL,
  cut_end REAL,
  
  -- Processing status
  status TEXT DEFAULT 'creating' CHECK(status IN ('creating', 'generating', 'extracting_audio', 'merging_audio', 'ready', 'failed')),
  error_message TEXT,
  
  -- Video files
  video_path TEXT, -- Беззвучное видео
  audio_path TEXT, -- Извлечённое аудио
  final_path TEXT, -- Финальное видео с аудио
  
  -- Sync correction
  sync_markers TEXT DEFAULT '[]', -- JSON array
  approved BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  duration REAL,
  resolution TEXT,
  fps INTEGER,
  file_size INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (source_video_id) REFERENCES project_assets(id)
);

CREATE INDEX IF NOT EXISTS idx_master_videos_project_id ON master_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_master_videos_status ON master_videos(status);
CREATE INDEX IF NOT EXISTS idx_master_videos_approved ON master_videos(approved);

-- 4. Scaled videos (uniquify/mashup batches)
CREATE TABLE IF NOT EXISTS scaled_videos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  master_video_id TEXT,
  batch_name TEXT,
  batch_id TEXT, -- Group videos by batch
  
  type TEXT NOT NULL CHECK(type IN ('uniquify', 'mashup')),
  video_index INTEGER,
  
  -- Processing
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Paths
  video_path TEXT,
  
  -- Applied effects
  filters_applied TEXT DEFAULT '[]', -- JSON array
  variations TEXT DEFAULT '{}', -- JSON object
  
  -- For mashup: shots used
  shots_used TEXT DEFAULT '{}', -- JSON: {hook_ids, mid_ids, cta_ids}
  
  -- Metadata
  duration REAL,
  file_size INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (master_video_id) REFERENCES master_videos(id)
);

CREATE INDEX IF NOT EXISTS idx_scaled_videos_project_id ON scaled_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_scaled_videos_batch_id ON scaled_videos(batch_id);
CREATE INDEX IF NOT EXISTS idx_scaled_videos_status ON scaled_videos(status);
CREATE INDEX IF NOT EXISTS idx_scaled_videos_master_video_id ON scaled_videos(master_video_id);

-- 5. Migration metadata
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (name) VALUES ('001_create_project_tables')
ON CONFLICT(name) DO NOTHING;
