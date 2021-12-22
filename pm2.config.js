module.exports = {
  apps: [
    {
      name: 'crm-company',
      script: './dist/main.js',
      watch: false,
      wait_ready: true,
      stop_exit_codes: [0],
      env: {
        PORT: 5015,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
