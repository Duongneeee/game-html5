module.exports = {
  apps : [
    {
      name: "crossy-road-game",
      script: "serve",
      env: {
        PM2_SERVE_PATH: './crossy-road-game',
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: './index.html'
      }
    },
    {
      name: "flappy-bird",
      script: "serve",
      env: {
        PM2_SERVE_PATH: './flappy-bird',
        PM2_SERVE_PORT: 8081,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: './index.html'
      }
    },
    {
      name: "stick-hero",
      script: "serve",
      env: {
        PM2_SERVE_PATH: './stick-hero',
        PM2_SERVE_PORT: 8082,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: './index.html'
      }
    }
  ]
}
