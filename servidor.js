//servidor local para probar la demo: npm run dev
//solo usa lo que trae node; vercel no lo necesita porque sirve los archivos estaticos directo
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));
const puerto = Number(process.env.PORT) || 5173;
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.mp4': 'video/mp4', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  //normalize evita que pidan archivos fuera de la carpeta con ../
  const archivo = join(raiz, normalize(ruta).replace(/^([/\\])+/, ''));
  if (!archivo.startsWith(raiz)) { res.writeHead(403).end(); return; }

  let info;
  try { info = statSync(archivo); } catch { res.writeHead(404).end('No encontrado'); return; }
  if (!info.isFile()) { res.writeHead(404).end('No encontrado'); return; }

  const tipo = tipos[extname(archivo)] || 'application/octet-stream';
  //el video necesita respuestas por rangos para poder adelantarlo
  const rango = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (rango) {
    const inicio = rango[1] ? Number(rango[1]) : 0;
    const fin = rango[2] ? Number(rango[2]) : info.size - 1;
    res.writeHead(206, {
      'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Content-Length': fin - inicio + 1,
      'Content-Range': `bytes ${inicio}-${fin}/${info.size}`,
    });
    createReadStream(archivo, { start: inicio, end: fin }).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': info.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  createReadStream(archivo).pipe(res);
}).listen(puerto, () => {
  console.log(`Demo lista en http://localhost:${puerto}  (Ctrl+C para detener)`);
});
