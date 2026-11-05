const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Normalize URL to prevent directory traversal
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(path.join(BASE_DIR, reqPath));

  // Security check: ensure path is within BASE_DIR
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found');
      return;
    }

    let filePathToRead = safePath;
    if (stats.isDirectory()) {
      filePathToRead = path.join(safePath, 'index.html');
    }

    fs.readFile(filePathToRead, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePathToRead).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Centro de Formación Somorrostro - Servidor Web Activo`);
  console.log(` URL Local:     http://localhost:${PORT}`);
  console.log(` URL Red Local: http://127.0.0.1:${PORT}`);
  console.log(` Sirviendo:     ${BASE_DIR}`);
  console.log(`=======================================================`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Puerto ${PORT} en uso, reintentando en puerto 8080...`);
    server.listen(8080, '0.0.0.0', () => {
      console.log(`Servidor activo en http://localhost:8080`);
    });
  } else {
    console.error('Error en el servidor:', e);
  }
});
