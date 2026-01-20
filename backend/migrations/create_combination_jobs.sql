-- Таблица для заданий комбинаторики
CREATE TABLE IF NOT EXISTS combination_jobs (
  job_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  hook_ids TEXT NOT NULL,
  mid_ids TEXT NOT NULL,
  cta_ids TEXT NOT NULL,
  total_combinations INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_combination_jobs_project_id ON combination_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_combination_jobs_status ON combination_jobs(status);
CREATE INDEX IF NOT EXISTS idx_combination_jobs_created_at ON combination_jobs(created_at DESC);

-- Таблица для отслеживания созданных master-видео из комбинаций
CREATE TABLE IF NOT EXISTS combination_masters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  master_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  hook_id TEXT NOT NULL,
  mid_id TEXT NOT NULL,
  cta_id TEXT NOT NULL,
  combination_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, combination_index)
);

-- Индексы для combination_masters
CREATE INDEX IF NOT EXISTS idx_combination_masters_job_id ON combination_masters(job_id);
CREATE INDEX IF NOT EXISTS idx_combination_masters_master_id ON combination_masters(master_id);
CREATE INDEX IF NOT EXISTS idx_combination_masters_project_id ON combination_masters(project_id);
