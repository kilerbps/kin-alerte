module.exports = {
  apps: [
    {
      name: 'kin-alerte',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/kin-alerte',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: '/var/log/kin-alerte/err.log',
      out_file: '/var/log/kin-alerte/out.log',
      log_file: '/var/log/kin-alerte/combined.log',
      time: true,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  deploy: {
    production: {
      user: 'www-data',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/kin-alerte.git',
      path: '/var/www/kin-alerte',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 