import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function createServer() {
  return http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
    const pathname = decodeURIComponent(reqUrl.pathname);

    if (pathname === '/api/config' || pathname === '/api/health') {
      const apiFile = path.join(ROOT_DIR, `${pathname.slice(1)}.js`);
      try {
        const handler = require(apiFile);
        const wrappedRes = {
          status(code) {
            res.statusCode = code;
            return wrappedRes;
          },
          json(payload) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.end(JSON.stringify(payload));
          }
        };
        handler(req, wrappedRes);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    let relPath = pathname === '/' ? '/index.html' : pathname;
    if (!path.extname(relPath)) {
      relPath += '.html';
    }

    const safeTarget = path.normalize(path.join(PUBLIC_DIR, relPath));
    if (!safeTarget.startsWith(PUBLIC_DIR) || !fs.existsSync(safeTarget) || fs.statSync(safeTarget).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safeTarget).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(safeTarget).pipe(res);
  });
}

const server = createServer();
server.listen(PORT, '127.0.0.1', () => {
  console.log(`WebTN local demo server running at http://localhost:${PORT}`);
});
