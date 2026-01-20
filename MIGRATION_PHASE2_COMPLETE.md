# ЭТАП 2: Backend API endpoints - ЗАВЕРШЁН ✅

Дата: 2026-01-18 10:01

## Что создано

### 1. Сервисы backend

Созданы три основных сервиса в `/home/synthnova/backend/src/services/`:

#### project-service.js
- `createProject({ name, description })` - создать проект
- `getProject(project_id)` - получить проект с статистикой
- `getAllProjects()` - получить все проекты
- `updateProject(project_id, updates)` - обновить проект
- `deleteProject(project_id)` - удалить проект

#### asset-service.js
- `addAsset({ project_id, asset_type, file_path, original_filename, metadata })` - добавить материал
- `getAsset(asset_id)` - получить материал
- `getProjectAssets(project_id, asset_type)` - получить материалы проекта
- `deleteAsset(asset_id)` - удалить материал
- `updateAssetMetadata(asset_id, metadata)` - обновить metadata

#### master-video-service.js
- `createMasterVideo({ project_id, name, shots_config, metadata })` - создать мастер-ролик
- `getMasterVideo(master_id)` - получить мастер-ролик
- `getProjectMasterVideos(project_id)` - получить все мастер-ролики проекта
- `updateMasterVideoStatus(master_id, status)` - обновить статус
- `updateMasterVideoPath(master_id, file_path, video_path, audio_path)` - обновить пути к файлам
- `saveSyncMarkers(master_id, markers)` - сохранить маркеры синхронизации
- `approveMasterVideo(master_id)` - одобрить мастер-ролик
- `deleteMasterVideo(master_id)` - удалить мастер-ролик

### 2. API роутеры

Создан роутер `/home/synthnova/backend/src/routes/projects-router.js` с endpoints:

#### Проекты
- `GET /api/projects` - получить все проекты
- `GET /api/projects/:project_id` - получить проект
- `POST /api/projects` - создать проект
- `PATCH /api/projects/:project_id` - обновить проект
- `DELETE /api/projects/:project_id` - удалить проект

#### Материалы
- `GET /api/projects/:project_id/assets` - получить материалы (query: asset_type)
- `POST /api/projects/:project_id/assets` - добавить материал (multipart/form-data)
- `DELETE /api/projects/:project_id/assets/:asset_id` - удалить материал

#### Мастер-ролики
- `GET /api/projects/:project_id/master-videos` - получить мастер-ролики
- `GET /api/projects/:project_id/master-videos/:master_id` - получить мастер-ролик
- `POST /api/projects/:project_id/master-videos` - создать мастер-ролик
- `PATCH /api/projects/:project_id/master-videos/:master_id/status` - обновить статус
- `POST /api/projects/:project_id/master-videos/:master_id/markers` - сохранить маркеры
- `POST /api/projects/:project_id/master-videos/:master_id/approve` - одобрить мастер-ролик
- `DELETE /api/projects/:project_id/master-videos/:master_id` - удалить мастер-ролик

### 3. База данных

#### Миграция 002: fix_project_schema
Пересозданы таблицы с правильными полями:

**projects**
- project_id TEXT PRIMARY KEY
- name TEXT NOT NULL
- description TEXT
- status TEXT DEFAULT 'active'
- created_at DATETIME
- updated_at DATETIME

**project_assets**
- asset_id TEXT PRIMARY KEY
- project_id TEXT NOT NULL (FK -> projects)
- asset_type TEXT NOT NULL (hook, mid, cta, target_video)
- file_path TEXT NOT NULL
- original_filename TEXT
- file_size INTEGER
- metadata TEXT (JSON)
- created_at DATETIME

**master_videos**
- master_id TEXT PRIMARY KEY
- project_id TEXT NOT NULL (FK -> projects)
- name TEXT NOT NULL
- status TEXT DEFAULT 'created'
- file_path TEXT
- video_path TEXT (без звука)
- audio_path TEXT (только звук)
- shots_config TEXT (JSON: { hook_ids, mid_ids, cta_ids })
- sync_markers TEXT (JSON: [{ id, type, time, shift, comment }])
- approved INTEGER DEFAULT 0
- metadata TEXT (JSON)
- created_at DATETIME
- updated_at DATETIME

**scaled_videos**
- scaled_id TEXT PRIMARY KEY
- project_id TEXT NOT NULL (FK -> projects)
- master_id TEXT (FK -> master_videos)
- name TEXT NOT NULL
- file_path TEXT
- profile TEXT (light, moderate, heavy)
- filters_applied TEXT (JSON)
- metadata TEXT (JSON)
- created_at DATETIME

#### Индексы созданы
- idx_project_assets_project_id
- idx_project_assets_type
- idx_master_videos_project_id
- idx_master_videos_approved
- idx_scaled_videos_project_id
- idx_scaled_videos_master_id

### 4. Миграция данных

Скрипт `/home/synthnova/backend/scripts/migrate_legacy_data.mjs`:
- Создал проект "Legacy" (`project_legacy_1768730426955`)
- Мигрировал 16 шотов из таблицы `shots` в `project_assets`
  - 9 Hooks
  - 6 Mids
  - 1 CTA

## Тестирование

### Тест 1: GET /api/projects ✅
```bash
curl https://edit.synthnova.me/api/projects
```
Результат: 3 проекта (2 Legacy + 1 Тестовый)

### Тест 2: POST /api/projects ✅
```bash
curl -X POST https://edit.synthnova.me/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Тестовый проект", "description": "Проверка API"}'
```
Результат: Проект создан с `project_id` и статистикой

### Тест 3: GET /api/projects/:project_id ✅
Проект Legacy (`project_legacy_1768730426955`) показывает:
- 16 материалов
- 9 Hooks
- 6 Mids
- 1 CTA

## Что дальше

### ✅ Завершено
- ✅ Этап 1: БД и миграции
- ✅ Этап 2: Backend API

### 🚧 В работе
- **Этап 3: Новый UI (MVP)**
  - Страница /projects (список проектов)
  - Страница /projects/new (создание проекта + загрузка материалов)
  - Страница /projects/:id (дашборд проекта с вкладками Assets, Master Videos, Scale)
  - Интеграция sync-editor с master_videos

### ⏳ Ожидает
- Этап 4: Мастер-ролики (генерация, аудио, наложение)
- Этап 5: Масштабирование (batch-генерация)
- Этап 6: Опциональные функции (нарезка, фильтры)

## Технические детали

- **Backend**: Express.js + better-sqlite3
- **URL**: https://edit.synthnova.me
- **БД**: /data/db/synthnova.sqlite
- **Директория проектов**: /data/projects/{project_id}/
- **Статус backend**: online (pm2)
- **Обратная совместимость**: старые endpoints /api/jobs, /api/shots работают

## Следующий шаг

Переходим к **Этапу 3: Новый UI (MVP)**
- Создать страницы для управления проектами
- Интегрировать API проектов
- Добавить загрузку материалов

---
Автор: AI Developer  
Дата: 2026-01-18 10:01 UTC
