module.exports = {
  apps: [
    {
      name: 'astitva-api',
      script: 'server.js',
      cwd: '/www/wwwroot/astitva-api',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      }
    }
  ]
};
