# 🎬 EDIT — Новая архитектура проекта

## 📊 Структура БД

### **Таблица: projects**
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'draft', -- draft, active, archived
  settings JSON -- Настройки проекта
);
```

### **Таблица: project_assets**
```sql
CREATE TABLE project_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL, -- shot, target_video, audio
  category TEXT, -- hook, mid, cta (для shots)
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  duration REAL,
  resolution TEXT,
  fps INTEGER,
  file_size INTEGER,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### **Таблица: master_videos**
```sql
CREATE TABLE master_videos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- from_shots, from_cut
  source_type TEXT, -- manual, auto_cut
  
  -- Shots composition (if from_shots)
  shots_used JSON, -- {hook_ids: [], mid_ids: [], cta_ids: []}
  shots_timeline JSON, -- [{type, id, start, duration}]
  
  -- Cut info (if from_cut)
  source_video_id INTEGER,
  cut_start REAL,
  cut_end REAL,
  
  -- Video files
  video_path TEXT, -- Беззвучное видео
  audio_path TEXT, -- Извлечённое аудио
  final_path TEXT, -- Финальное видео с аудио
  
  -- Sync correction
  sync_markers JSON, -- Маркеры синхронизации
  approved BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  duration REAL,
  resolution TEXT,
  fps INTEGER,
  file_size INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (source_video_id) REFERENCES project_assets(id)
);
```

### **Таблица: scaled_videos**
```sql
CREATE TABLE scaled_videos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  master_video_id TEXT NOT NULL,
  batch_name TEXT, -- Название пакета генерации
  
  type TEXT NOT NULL, -- uniquify, mashup
  video_index INTEGER,
  
  -- Processing
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0,
  
  -- Paths
  video_path TEXT,
  
  -- Applied effects
  filters_applied JSON,
  variations JSON,
  
  -- Metadata
  duration REAL,
  file_size INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (master_video_id) REFERENCES master_videos(id)
);
```

---

## 🔄 API Endpoints

### **1️⃣ Шаг 1: Управление проектами и загрузка**

#### **Проекты**
```
POST   /api/projects                    # Создать проект
GET    /api/projects                    # Список проектов
GET    /api/projects/:id                # Детали проекта
PATCH  /api/projects/:id                # Обновить проект
DELETE /api/projects/:id                # Удалить проект
```

#### **Загрузка материалов**
```
POST   /api/projects/:id/assets/shots           # Загрузить шоты (hook/mid/cta)
POST   /api/projects/:id/assets/target-videos   # Загрузить целевой ролик для нарезки
POST   /api/projects/:id/assets/audio           # Загрузить аудио дорожку
GET    /api/projects/:id/assets                 # Список всех материалов
DELETE /api/projects/:id/assets/:assetId        # Удалить материал
```

### **2️⃣ Шаг 2: Создание мастер-роликов**

#### **Создание из шотов**
```
POST   /api/projects/:id/master-videos/from-shots
Body: {
  name: "Master Video 1",
  shots_config: {
    hook_ids: [1],
    mid_ids: [2, 3],
    cta_ids: [4]
  },
  profile: "moderate"
}
```

#### **Нарезка целевого ролика**
```
POST   /api/projects/:id/master-videos/from-cut
Body: {
  name: "Cut Video 1",
  source_video_id: 123,
  cuts: [
    { start: 0, end: 10, name: "Intro" },
    { start: 10, end: 25, name: "Main" }
  ]
}
```

#### **Наложение аудио**
```
POST   /api/projects/:id/master-videos/:masterId/extract-audio
POST   /api/projects/:id/master-videos/:masterId/merge-audio
```

#### **Синхронизация**
```
GET    /api/projects/:id/master-videos/:masterId/sync-editor
POST   /api/projects/:id/master-videos/:masterId/sync-markers
Body: {
  markers: [
    { type: "delay", time: 5.234, shift: 50, comment: "..." }
  ]
}
PATCH  /api/projects/:id/master-videos/:masterId/approve
```

### **3️⃣ Шаг 3: Масштабирование**

#### **Уникализация (фильтры/эффекты)**
```
POST   /api/projects/:id/scale/uniquify
Body: {
  master_video_id: "master_123",
  batch_name: "Batch 1",
  num_videos: 50,
  filters: {
    color: true,
    noise: true,
    speed: false
  }
}
```

#### **Мешап (смешивание шотов)**
```
POST   /api/projects/:id/scale/mashup
Body: {
  batch_name: "Mashup Batch 1",
  num_videos: 100,
  profile: "moderate",
  use_approved_masters: true
}
```

#### **Статус генерации**
```
GET    /api/projects/:id/scale/batches
GET    /api/projects/:id/scale/batches/:batchId
```

### **4️⃣ Шаг 4: Экспорт**
```
GET    /api/projects/:id/export/archive
GET    /api/projects/:id/export/videos/:videoId
```

---

## 📁 Структура файловой системы

```
/data/projects/
├── project_abc123/
│   ├── assets/
│   │   ├── shots/
│   │   │   ├── hook/
│   │   │   ├── mid/
│   │   │   └── cta/
│   │   ├── target_videos/
│   │   └── audio/
│   │
│   ├── master_videos/
│   │   ├── master_001/
│   │   │   ├── video.mp4          # Беззвучное
│   │   │   ├── audio.mp3          # Аудио
│   │   │   ├── final.mp4          # С аудио
│   │   │   └── metadata.json      # Shots used + markers
│   │   └── master_002/
│   │
│   └── scaled_videos/
│       ├── batch_uniquify_001/
│       │   ├── video_0001.mp4
│       │   ├── video_0002.mp4
│       │   └── ...
│       └── batch_mashup_001/
│           ├── video_0001.mp4
│           └── ...
│
└── project_xyz789/
    └── ...
```

---

## 🖥️ UI Workflow

### **1️⃣ Шаг 1: Загрузка материалов**

**Страница:** `/projects/new` или `/projects/:id/assets`

```
┌─────────────────────────────────────────────────────────┐
│ 📁 Новый проект                                         │
├─────────────────────────────────────────────────────────┤
│ Название: [________________]                            │
│ Описание: [________________]                            │
│                                                          │
│ 📤 Загрузка материалов:                                 │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 🎬 Шоты                                         │    │
│ │ Hook (0)  [Загрузить]                           │    │
│ │ Mid (0)   [Загрузить]                           │    │
│ │ CTA (0)   [Загрузить]                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 🎥 Целевые ролики (для нарезки)                │    │
│ │ [Загрузить большой ролик]                       │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Создать проект] [Отмена]                               │
└─────────────────────────────────────────────────────────┘
```

### **2️⃣ Шаг 2: Создание мастер-роликов**

**Страница:** `/projects/:id/master-videos`

**Два режима:**

**А) Из шотов:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎬 Создать мастер-ролик из шотов                        │
├─────────────────────────────────────────────────────────┤
│ Название: [________________]                            │
│                                                          │
│ Выбрать шоты:                                           │
│ Hook: [▼ Выбрать] (9 доступно)                         │
│ Mid:  [▼ Выбрать] [+ Добавить ещё] (6 доступно)       │
│ CTA:  [▼ Выбрать] (1 доступно)                         │
│                                                          │
│ [Создать мастер-ролик]                                  │
└─────────────────────────────────────────────────────────┘
```

**Б) Нарезка большого ролика:**
```
┌─────────────────────────────────────────────────────────┐
│ ✂️ Нарезать целевой ролик на мастер-ролики              │
├─────────────────────────────────────────────────────────┤
│ Выбрать ролик: [▼ target_video_001.mp4]                │
│                                                          │
│ 📹 Видеоплеер с таймлайном                              │
│ [=========================>                        ]     │
│ 00:00 ────────────────────────────────────── 10:00     │
│                                                          │
│ Отметки для нарезки:                                    │
│ 1. [00:00 - 00:15] "Intro"           [× Удалить]       │
│ 2. [00:15 - 00:45] "Main content"    [× Удалить]       │
│ 3. [00:45 - 01:00] "CTA"             [× Удалить]       │
│                                                          │
│ [+ Добавить отметку]  [Нарезать]                        │
└─────────────────────────────────────────────────────────┘
```

**После создания мастер-ролика:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎬 Мастер-ролик: "Master Video 1"                       │
├─────────────────────────────────────────────────────────┤
│ Статус: ⚙️ Обработка...                                  │
│                                                          │
│ Этапы:                                                   │
│ ✅ 1. Генерация беззвучного видео                       │
│ ⚙️ 2. Извлечение аудио...                               │
│ ⏳ 3. Наложение аудио                                    │
│ ⏳ 4. Проверка синхронизации                            │
│                                                          │
│ [Отменить]                                               │
└─────────────────────────────────────────────────────────┘
```

**Когда готов:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎬 Мастер-ролик: "Master Video 1"                       │
├─────────────────────────────────────────────────────────┤
│ Статус: ✅ Готов к проверке                              │
│                                                          │
│ 📹 Видео: 16 сек, 1080x1920, 30 FPS, 8.5 MB            │
│ 🎵 Аудио: AAC, 128 kbps                                 │
│                                                          │
│ [▶️ Просмотреть] [🔧 Редактор синхронизации]             │
│ [✅ Одобрить как мастер] [❌ Удалить]                    │
└─────────────────────────────────────────────────────────┘
```

### **3️⃣ Шаг 3: Масштабирование**

**Страница:** `/projects/:id/scale`

```
┌─────────────────────────────────────────────────────────┐
│ 🚀 Масштабирование                                       │
├─────────────────────────────────────────────────────────┤
│ Одобренные мастер-ролики: 2                             │
│                                                          │
│ Выбрать тип:                                            │
│ ○ Уникализация (фильтры/эффекты на основе мастера)     │
│ ● Мешап (смешивание шотов для новых комбинаций)        │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Настройки мешапа:                               │    │
│ │ Количество: [100] роликов                       │    │
│ │ Профиль: [▼ Moderate]                           │    │
│ │ Шоты: Hook (9), Mid (6), CTA (1)               │    │
│ │ Возможных комбинаций: 54                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Начать генерацию] [Отмена]                             │
└─────────────────────────────────────────────────────────┘
```

**Мониторинг:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Генерация: Batch Mashup 1                            │
├─────────────────────────────────────────────────────────┤
│ Прогресс: [==============>              ] 45/100        │
│ ETA: ~5 минут                                           │
│                                                          │
│ Последние созданные:                                    │
│ • video_0045.mp4 (8.3 MB) ✅                            │
│ • video_0044.mp4(8.1 MB) ✅                            │
│ • video_0043.mp4(FAILED) ❌                            │
│                                                          │
│ [Пауза] [Отменить]                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Миграция текущего кода

### **Что сохранить:**
- ✅ `generator.js` — генерация беззвучного видео
- ✅ `extract_and_merge_audio.cjs` — извлечение аудио
- ✅ `merge_video_audio.cjs` — наложение аудио
- ✅ `sync-editor.html` — редактор синхронизации

### **Что переделать:**
- 🔄 API endpoints → проектно-ориентированные
- 🔄 БД структура → добавить projects, master_videos, scaled_videos
- 🔄 Frontend → новые страницы с workflow
- 🔄 Файловая структура → `/data/projects/`

### **Что добавить:**
- ➕ Нарезка целевого ролика
- ➕ Уникализация (фильтры/эффекты)
- ➕ Проектный менеджер
- ➕ Batch управление

---

Дата создания: **2026-01-18**
