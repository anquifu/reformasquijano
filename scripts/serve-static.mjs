// Vista previa local del ZIP. El hosting sirve directamente index.html.
import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { redirects } from '../src/data/site.mjs';

const root = await realpath(resolve('dist'));
const htaccess = await readFile(resolve(root, '.htaccess'), 'utf8');
const headers = Object.fromEntries([...htaccess.matchAll(/^Header always set ([\w-]+) "([^"]*)"$/gm)].map(m => [m[1], m[2]]));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.json':'application/json; charset=utf-8' };

createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, { ...headers, Allow:'GET, HEAD' }); res.end(); return; }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.split('/').some(part => part.startsWith('.')) || pathname.includes('\\') || pathname.includes('\0')) throw new Error('Invalid path');
    const redirect = redirects[pathname] || redirects[pathname + '/'];
    if (redirect) { res.writeHead(301, { ...headers, Location:redirect + url.search }); res.end(); return; }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Outside root');
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { ...headers, Location:pathname + '/' + url.search }); res.end(); return; }
      file = resolve(file, 'index.html');
    }
    file = await realpath(file);
    if (!file.startsWith(root + sep)) throw new Error('Outside root');
    const body = await readFile(file);
    res.writeHead(200, { ...headers, 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Content-Length':body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    const body = await readFile(resolve(root, '404.html'));
    res.writeHead(404, { ...headers, 'Content-Type':'text/html; charset=utf-8', 'X-Robots-Tag':'noindex', 'Content-Length':body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  }
}).listen(Number(process.env.PORT || 4321), process.env.HOST || '127.0.0.1', () => {
  console.log(`Vista previa HTML: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 4321}`);
});
