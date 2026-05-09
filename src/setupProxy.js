/* CRA proxy. Forwards /api/v1/* to the FastAPI backend at localhost:8011.
   The backend's CORS middleware restricts origins to localhost:3000. */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8011',
      changeOrigin: true,
      logLevel: 'warn',
    }),
  );
};
