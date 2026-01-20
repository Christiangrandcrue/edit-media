# Synthnova EDIT - Video Combinatorics Platform

**Production URL**: https://edit.synthnova.me

## 📋 Overview

Synthnova EDIT is a powerful video combinatorics platform that generates thousands of unique video combinations from master components. It uses **permutation-based** combinatorics to create order-sensitive video sequences from Hooks, Mids, and CTAs.

### Key Features

- 🎬 **Permutation-based Combinatorics**: Order-sensitive video generation (Hook → Mids → CTA)
- 📊 **Master Video Generation**: Automated creation of base combinations
- 🎯 **Multi-format Scaling**: Export to 4 formats (16:9, 9:16, 1:1, 4:5) × 10 variations = 40 versions per master
- 📦 **Bulk Archive Download**: Download all master videos as a single ZIP archive with progress indicator
- 🔄 **Real-time Job Status**: Live polling of combination and scaling jobs
- 💾 **SQLite Database**: Persistent storage with D1-compatible schema
- 🎨 **Modern Responsive UI**: Built with Tailwind CSS
- 🚀 **PM2 Process Management**: Production-ready worker processes
- 📝 **Comprehensive API**: RESTful endpoints for all operations

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express
- SQLite database
- FFmpeg for video processing
- PM2 for process management

**Frontend:**
- Vanilla JavaScript
- Tailwind CSS
- Responsive design

**Workers:**
- `combinations-worker`: Processes combination job queue
- `master-video-worker`: Generates master videos from combinations
- `scale-video-worker`: Scales master videos to target formats

### Project Structure

```
synthnova/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database connection
│   │   ├── combinations-worker.cjs
│   │   ├── master-video-worker.cjs
│   │   └── scale-video-worker.cjs
│   ├── migrations/          # Database migrations
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── combinations.html
│   ├── project-dashboard.html
│   └── static/
└── README.md
```

## 🎯 Combinatorics Process

### 1. Asset Upload

Upload video assets with categorization:
- **Hook**: Opening segments (Hook_A, Hook_B, Hook_C)
- **Mid**: Middle segments (Mid_1, Mid_2, Mid_3, Mid_4)
- **CTA**: Call-to-action segments (CTA_X)

### 2. Combination Generation

The system calculates **permutations** (order matters):

For each Hook:
- Select 1-4 Mids in specific order
- Add CTA at the end

**Formula**: 
```
Total Combinations = Hooks × [P(4,1) + P(4,2) + P(4,3) + P(4,4)] × CTAs
                   = 3 × [4 + 12 + 24 + 24] × 1
                   = 3 × 64 × 1
                   = 192 base master videos
```

### 3. Master Video Creation

Each combination is rendered as a ~12-second master video:
- Concatenate: Hook → Mid(s) → CTA
- Maintain original quality
- Size: ~22-31 MB per video

### 4. Multi-format Scaling

Each master video is scaled to 40 versions:
- **4 formats**: 16:9, 9:16, 1:1, 4:5
- **10 variations** per format
- **Total**: 192 masters × 40 = **7,680 final videos**

## 📡 API Endpoints

### Projects

```
GET    /api/projects                    # List all projects
POST   /api/projects                    # Create new project
GET    /api/projects/:id                # Get project details
DELETE /api/projects/:id                # Delete project
```

### Assets

```
GET    /api/projects/:id/assets         # List project assets
POST   /api/projects/:id/assets         # Upload new asset
DELETE /api/projects/:id/assets/:aid    # Delete asset
```

### Combinations

```
POST   /api/projects/:id/generate-combinations    # Create combinations job
GET    /api/projects/:id/combination-jobs         # List jobs with status
```

### Master Videos

```
GET    /api/projects/:id/master-videos                      # List all masters
GET    /api/projects/:id/master-videos/:master_id           # Get master details
POST   /api/projects/:project_id/master-videos-archive/download  # Download archive
```

### Scaling

```
POST   /api/projects/:id/master-videos/:mid/scale  # Create scale job
GET    /api/projects/:id/scale-jobs                # List scale jobs
GET    /api/projects/:id/scaled-videos/:sid        # Get scaled video
```

## 🚀 Deployment

### Server Setup

The application is deployed on **185.178.46.187** with:

- **Nginx**: Reverse proxy on port 443 (HTTPS)
- **Backend**: Node.js on port 3001
- **PM2**: Process manager for all services
- **SSL**: Let's Encrypt certificate

### PM2 Processes

```bash
pm2 list
# synthnova-backend       - Main API server
# combinations-worker     - Combination job processor
# master-video-worker     - Master video generator
# scale-video-worker      - Video scaling processor
```

### Database

Location: `/data/db/synthnova.sqlite`

Tables:
- `projects` - Project metadata
- `assets` - Uploaded video components
- `combination_jobs` - Combination generation queue
- `master_videos` - Generated master videos
- `scale_jobs` - Scaling job queue
- `scaled_videos` - Scaled video outputs

### File Storage

```
/data/
├── uploads/          # Uploaded assets
├── master-videos/    # Generated masters
└── scaled-videos/    # Scaled outputs
```

## 📊 Current Status

### Test Project: "Василий1 (русская версия)"

- **Project ID**: `project_1768734645863_ldx0s1mv`
- **Assets**: 1 Hook, 2-4 Mids, 1 CTA
- **Master Videos Generated**: 219 videos
- **Status**: ✅ Production ready
- **Archive Download**: ✅ Working (~6.5 GB)

### Features Implemented

- ✅ Permutation-based combinatorics calculation
- ✅ Master video generation pipeline
- ✅ Multi-format scaling (16:9, 9:16, 1:1, 4:5)
- ✅ Real-time job status polling
- ✅ Bulk archive download with progress indicator
- ✅ Video preview in-browser
- ✅ Responsive UI with Tailwind CSS
- ✅ Nginx reverse proxy setup
- ✅ PM2 production deployment

## 🔧 Development

### Prerequisites

- Node.js v18+ (upgrade recommended - current v18.19.1 is deprecated)
- FFmpeg
- PM2
- SQLite3

### Installation

```bash
# Backend setup
cd backend
npm install

# Run migrations
node src/apply-combination-migration.cjs
node src/apply-scale-migration-v3.cjs

# Start services
pm2 start ecosystem.config.cjs
```

### Testing

```bash
# Check backend status
curl http://localhost:3001/api/projects

# Test archive download
curl -X POST http://localhost:3001/api/projects/PROJECT_ID/master-videos-archive/download \
  -H "Content-Type: application/json" \
  -d '{"master_ids": ["master_xxx", "master_yyy"]}' \
  --output archive.zip
```

## 📝 Next Steps

### Planned Improvements

1. **Node.js Upgrade**: Update from v18.19.1 to latest LTS
2. **Error Handling**: Enhanced error recovery and logging
3. **S3 Integration**: Cloud storage for video files
4. **Queue Management**: Redis-based job queue for scalability
5. **Progress Tracking**: Real-time progress bars during generation
6. **Video Preview**: In-browser video player improvements
7. **Batch Operations**: Multi-project bulk operations

### Known Issues

- Node.js v18.19.1 deprecation warnings (upgrade needed)
- Large archive downloads may timeout (use streaming)
- Video metadata extraction occasional failures

## 📄 License

Proprietary - Synthnova Project

## 👤 Author

**Christian** (Christiangrandcrue)

---

**Last Updated**: 2026-01-20
**Version**: 2.0.0
**Status**: 🟢 Production Ready
