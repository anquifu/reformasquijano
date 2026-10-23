import {readFileSync,writeFileSync,copyFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {load} from 'cheerio';
import {pages,redirects} from '../src/data/site.mjs';
import {indexingEnabled,siteUrl} from '../src/lib/config.mjs';
copyFileSync('dist/404/index.html','dist/404.html');
const hashes=new Set();
function inspect(dir){for(const name of readdirSync(dir)){const path=join(dir,name);if(statSync(path).isDirectory())inspect(path);else if(name.endsWith('.html')){const $=load(readFileSync(path,'utf8'));$('script:not([src])').each((_,el)=>hashes.add(`'sha256-${createHash('sha256').update($(el).html()||'').digest('base64')}'`));}}}
inspect('dist');
const csp=`default-src 'self'; script-src 'self' ${[...hashes].join(' ')}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`;
const rules=Object.entries(redirects).map(([from,to])=>`RewriteRule ^${from.slice(1).replace(/\/$/,'')}/?$ ${to} [R=301,L]`).join('\n');
writeFileSync('dist/.htaccess',`# HTML estático. Apache/LiteSpeed (Hostinger hosting web).\nDirectoryIndex index.html\nOptions -Indexes -MultiViews\nErrorDocument 404 /404.html\n<IfModule mod_rewrite.c>\nRewriteEngine On\n${rules}\n</IfModule>\n<FilesMatch "^(?:\\.env|package(?:-lock)?\\.json)$">\nRequire all denied\n</FilesMatch>\n<IfModule mod_headers.c>\nHeader always set X-Content-Type-Options "nosniff"\nHeader always set Referrer-Policy "strict-origin-when-cross-origin"\nHeader always set X-Frame-Options "DENY"\nHeader always set Content-Security-Policy "${csp}"\n${indexingEnabled?'':'Header always set X-Robots-Tag "noindex, nofollow"\n'}</IfModule>\n`);
writeFileSync('dist/deployment-info.json',JSON.stringify({format:'static-html-direct-contact',indexing:indexingEnabled,canonicalOrigin:siteUrl,pages:pages.length},null,2));
console.log(`HTML preparado: ${pages.length} páginas y .htaccess. Contacto por llamada y WhatsApp. index.html en la raíz. Indexación: ${indexingEnabled}.`);
