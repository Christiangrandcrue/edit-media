# 🎬 Scale Video — Инструкция по использованию

## 📊 Что сделано

✅ **Backend полностью работает!**
- Scale Video Worker запущен и обрабатывает видео
- API endpoints доступны
- Все тесты пройдены успешно

## 🚀 Как использовать прямо сейчас

### Вариант 1: Через API (curl)

```bash
# 1. Создать scale job
curl -X POST "https://edit.synthnova.me/api/projects/PROJECT_ID/master-videos/MASTER_ID/scale" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 10,
    "formats": ["16:9", "9:16", "1:1", "4:5"]
  }'

# 2. Проверить статус
curl "https://edit.synthnova.me/api/projects/PROJECT_ID/scale-jobs/JOB_ID"

# 3. Получить список видео
curl "https://edit.synthnova.me/api/projects/PROJECT_ID/scale-jobs/JOB_ID"
```

### Вариант 2: Прямые ссылки на тестовые видео

Уже созданные и готовые к просмотру:

**Формат 16:9 (Landscape — YouTube):**
1. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807186041_m5s49tarm/video
2. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807193835_t64n5zf9q/video
3. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807205662_sas6h0fmo/video
4. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807218018_w0b6g49cj/video
5. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807227042_4iibt1tnl/video

**Формат 9:16 (Vertical — TikTok, Reels):**
1. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807236638_gqmgzz3fy/video
2. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807250863_fj1yw530n/video
3. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807266350_xyc132dfu/video
4. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807281651_eyoufisys/video
5. https://edit.synthnova.me/api/projects/project_1768734645863_ldx0s1mv/scaled-videos/scaled_1768807296289_hdchdexa9/video

## 📋 Параметры Scale Job

### count (обязательно)
- **Описание**: Количество версий на каждый формат
- **Диапазон**: 1-100
- **Пример**: `"count": 10` → 10 версий каждого формата

### formats (обязательно)
- **Описание**: Массив форматов видео
- **Доступные**: `["16:9", "9:16", "1:1", "4:5"]`
- **Примеры**:
  - Только YouTube: `["16:9"]`
  - TikTok + Reels: `["9:16"]`
  - Все форматы: `["16:9", "9:16", "1:1", "4:5"]`

### Примеры запросов

**Минимальный (10 видео 16:9):**
```json
{
  "count": 10,
  "formats": ["16:9"]
}
```

**Средний (20 видео: 10x16:9 + 10x9:16):**
```json
{
  "count": 10,
  "formats": ["16:9", "9:16"]
}
```

**Максимальный (400 видео: 100 на каждый формат):**
```json
{
  "count": 100,
  "formats": ["16:9", "9:16", "1:1", "4:5"]
}
```

## ⚙️ Технические детали

### Производительность
- **Скорость**: ~13 секунд на одно видео
- **Размеры**:
  - 16:9: ~2.4 MB
  - 9:16: ~6.8 MB
  - 1:1: ~4 MB
  - 4:5: ~5 MB

### Что делает Worker
1. Берёт master-видео (уже склеенное из материалов)
2. Нарезает случайные фрагменты 15-30 секунд
3. Масштабирует в нужный формат (с чёрными полосами)
4. Сохраняет результат в `/data/scaled-videos/`
5. Обновляет БД с путями к файлам

### Статусы Job
- `queued` — ожидает обработки
- `processing` — обрабатывается
- `completed` — завершено успешно
- `failed` — ошибка обработки

## 🎯 Примеры использования

### Сценарий 1: Массовая нарезка для соцсетей
```bash
# Создаём 50 видео для разных платформ
curl -X POST "https://edit.synthnova.me/api/projects/PROJECT_ID/master-videos/MASTER_ID/scale" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 50,
    "formats": ["16:9", "9:16"]
  }'
# Итого: 100 видео (50 для YouTube, 50 для TikTok)
```

### Сценарий 2: Тестирование
```bash
# Создаём несколько видео для проверки
curl -X POST "https://edit.synthnova.me/api/projects/PROJECT_ID/master-videos/MASTER_ID/scale" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 3,
    "formats": ["16:9"]
  }'
# Итого: 3 видео для быстрой проверки
```

## 📊 Мониторинг

### Проверить статус job
```bash
curl "https://edit.synthnova.me/api/projects/PROJECT_ID/scale-jobs/JOB_ID" | jq '{
  status: .job.status,
  progress: .job.progress,
  videos: {
    total: .videos.total,
    completed: .videos.completed,
    failed: .videos.failed
  }
}'
```

### Получить список всех jobs проекта
```bash
curl "https://edit.synthnova.me/api/projects/PROJECT_ID/scale-jobs"
```

## 🎬 Просмотр результатов

### Через браузер
Открой ссылку вида:
```
https://edit.synthnova.me/api/projects/PROJECT_ID/scaled-videos/SCALED_ID/video
```

### Скачивание
```bash
curl -O "https://edit.synthnova.me/api/projects/PROJECT_ID/scaled-videos/SCALED_ID/download"
```

## ✅ Готово к production!

Система полностью работает и протестирована. Frontend UI (модальное окно на dashboard) 
можно добавить позже — сейчас всё доступно через API.

---

**Автор**: Claude  
**Дата**: 2026-01-19  
**Статус**: Production Ready ✅
