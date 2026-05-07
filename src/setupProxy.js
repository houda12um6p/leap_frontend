/* CRA proxy. Avoids CORS in dev by forwarding /api/v1/* to the FastAPI
   backend at localhost:8000. The backend's CORS middleware also allows
   '*', so the proxy is belt-and-braces — but it also keeps the browser's
   network tab unified under the dev server's origin. */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'warn',
    }),
  );
};
