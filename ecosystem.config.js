module.exports = {
  apps: [{
    name: 'jmichi',
    script: 'server/dist/index.js',
    cwd: '/var/www/jmichi',
    env_file: '/var/www/jmichi/.env',
    instances: 1,
    exec_mode: 'fork'
  }]
};
