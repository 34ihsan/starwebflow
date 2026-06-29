module.exports = {
  apps: [
    {
      name: "starwebflow",
      cwd: "c:\\Users\\sinan\\Desktop\\projeler\\starwebflow",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
  ],
};
