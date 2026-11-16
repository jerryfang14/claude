// A small preview server that compresses text the way real hosts do. Handy for honest speed tests.
//   node design/tools/serve.mjs [port]      then open http://localhost:8766
import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../site');
const PORT = +process.argv[2] || 8766;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { file = path.join(ROOT, '404.html'); res.statusCode = 404; }
  const ext = path.extname(file);
  const body = fs.readFileSync(file);
  res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable');
  if (/\.(html|css|js|svg|txt)$/.test(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.end(zlib.gzipSync(body));
  } else res.end(body);
}).listen(PORT, () => console.log(`Double Fang preview on http://localhost:${PORT}`));
