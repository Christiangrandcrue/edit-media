-- 002_fix_project_schema.sql - Исправление схемы проектов
-- Дата: 2026-01-18

-- Удалить старые таблицы
DROP TABLE IF EXISTS scaled_videos;
DROP TABLE IF EXISTS master_videos;
DROP TABLE IF EXISTS project_assets;
DROP TABLE IF EXISTS projects;

-- Создать таблицу projects с правильными полями
CREATE TABLE projects (
  project_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Создать таблицу project_assets
CREATE TABLE project_assets (
  asset_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  asset_type TEXT NOT NULL,  -- 'hook', 'mid', 'cta', 'target_video'
  file_path TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  metadata TEXT,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Создать таблицу master_videos
CREATE TABLE master_videos (
  master_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'created',  -- 'created', 'generating', 'ready', 'failed'
  file_path TEXT,
  video_path TEXT,   -- без звука
  audio_path TEXT,   -- только звук
  shots_config TEXT,  -- JSON: { hook_ids: [], mid_ids: [], cta_ids: [] }
  sync_markers TEXT,  -- JSON: [{ id, type, time, shift, comment }]
  approved INTEGER DEFAULT 0,
  metadata TEXT,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Создать таблицу scaled_videos
CREATE TABLE scaled_videos (
  scaled_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  master_id TEXT,
  name TEXT NOT NULL,
  file_path TEXT,
  profile TEXT,  -- 'light', 'moderate', 'heavy'
  filters_applied TEXT,  -- JSON
  metadata TEXT,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (master_id) REFERENCES master_videos(master_id) ON DELETE SET NULL
);

-- Создать индексы
CREATE INDEX idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_project_assets_type ON project_assets(asset_type);
CREATE INDEX idx_master_videos_project_id ON master_videos(project_id);
CREATE INDEX idx_master_videos_approved ON master_videos(approved);
CREATE INDEX idx_scaled_videos_project_id ON scaled_videos(project_id);
CREATE INDEX idx_scaled_videos_master_id ON scaled_videos(master_id);

-- Записать миграцию
INSERT INTO migrations (version, name, applied_at) VALUES 
  ('002', 'fix_project_schema', datetime('now'));
