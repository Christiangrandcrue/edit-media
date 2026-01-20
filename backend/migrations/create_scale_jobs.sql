-- Создание таблицы scale_jobs для хранения заданий нарезки видео
CREATE TABLE IF NOT EXISTS scale_jobs (
  job_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  master_video_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 10,
  formats TEXT NOT NULL DEFAULT '["16:9"]',
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_scale_jobs_project_id ON scale_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_scale_jobs_master_video_id ON scale_jobs(master_video_id);
CREATE INDEX IF NOT EXISTS idx_scale_jobs_status ON scale_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scale_jobs_created_at ON scale_jobs(created_at DESC);

-- Создание таблицы для хранения результатов нарезки
CREATE TABLE IF NOT EXISTS scaled_videos (
  scaled_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  master_video_id TEXT NOT NULL,
  format TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  video_path TEXT,
  file_size INTEGER,
  duration REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Индексы для scaled_videos
CREATE INDEX IF NOT EXISTS idx_scaled_videos_job_id ON scaled_videos(job_id);
CREATE INDEX IF NOT EXISTS idx_scaled_videos_project_id ON scaled_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_scaled_videos_master_video_id ON scaled_videos(master_video_id);
CREATE INDEX IF NOT EXISTS idx_scaled_videos_status ON scaled_videos(status);
