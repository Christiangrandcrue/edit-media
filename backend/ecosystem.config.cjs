/**
 * PM2 Configuration for Synthnova VPS Backend
 * Usage: pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [{
    name: 'synthnova-backend',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATA_DIR: '/data',
      SHOTS_DIR: '/data/shots',
      JOBS_DIR: '/data/jobs',
      ARCHIVES_DIR: '/data/archives',
      DB_PATH: '/data/db/synthnova.sqlite',
      SHARE_TOKEN_EXPIRY_DAYS: 7,
      FRONTEND_URL: 'https://edit.synthnova.me'
    },
    
    // Logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/synthnova/error.log',
    out_file: '/var/log/synthnova/out.log',
    merge_logs: true,
    
    // Restart policy
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 5000,
    max_restarts: 10,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
