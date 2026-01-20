# Synthnova VPS Backend

Node.js backend для Видео-Уникализатора. Устанавливается на Timeweb VPS.

## Требования

- Node.js 18+
- FFmpeg 6.1+
- SQLite 3

## Установка

```bash
# 1. Клонировать или скопировать
scp -r vps-backend/ root@185.178.46.187:/home/synthnova/backend/

# 2. На сервере
cd /home/synthnova/backend
npm install

# 3. Создать директории
mkdir -p /data/{shots/{hook,mid,cta},jobs,archives,db}
mkdir -p /var/log/synthnova

# 4. Настроить окружение
cp .env.example .env
nano .env

# 5. Запустить
pm2 start ecosystem.config.cjs
pm2 save
```

## API

### Shots

```bash
# Список шотов
curl http://localhost:3001/shots?type=hook

# Загрузка
curl -X POST http://localhost:3001/shots/upload \
  -F "type=mid" \
  -F "tags=product,demo" \
  -F "files=@video1.mp4" \
  -F "files=@video2.mp4"

# Статистика
curl http://localhost:3001/shots/stats
```

### Jobs

```bash
# Создать задачу
curl -X POST http://localhost:3001/jobs \
  -H "Content-Type: application/json" \
  -d '{"num_videos": 10, "profile": "moderate"}'

# Статус
curl http://localhost:3001/jobs/{job_id}

# Скачать архив
curl -O http://localhost:3001/jobs/{job_id}/archive
```

### Share

```bash
# Информация по токену
curl http://localhost:3001/share/{token}

# Скачать
curl -O http://localhost:3001/share/{token}/download
```

## Nginx конфиг

```nginx
server {
    listen 80;
    server_name 185.178.46.187;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /data/ {
        alias /data/;
        autoindex off;
    }
}
```

## PM2 команды

```bash
pm2 status
pm2 logs synthnova-backend
pm2 restart synthnova-backend
pm2 stop synthnova-backend
```

## Структура /data

```
/data/
├── shots/
│   ├── hook/           # 3-5 сек хуки
│   ├── mid/            # 5-15 сек контент
│   └── cta/            # 3-5 сек CTA
├── jobs/
│   └── job_123/
│       ├── videos/
│       └── meta/job.json
├── archives/
│   └── job_123.zip
└── db/
    └── synthnova.sqlite
```
