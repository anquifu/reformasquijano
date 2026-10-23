import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';
import { pages, business } from '../src/data/site.mjs';

test('El paquete no contiene backend, datos privados ni dependencias del servidor', () => {
  const files = readdirSync('dist', { recursive:true });
  assert.ok(files.includes('index.html'));
  assert.ok(files.includes('.htaccess'));
  assert.deepEqual(files.filter(f => /(^|\/)(api|node_modules|server|\.env|\.quijano-private)(\/|$)|\.(php|sqlite|log)$/.test(f)), []);
  assert.equal(JSON.parse(readFileSync('dist/deployment-info.json')).format, 'static-html-direct-contact');
});

test('Todas las páginas ofrecen contacto sin formulario ni confirmaciones de envío', () => {
  for (const page of pages) {
    const $ = load(readFileSync(`dist${page.path}index.html`, 'utf8'));
    assert.equal($('form,input,textarea,select').length, 0, page.path);
    assert.ok($(`a[href="${business.tel}"]`).length > 0, page.path);
    assert.ok($(`a[href^="${business.whatsapp}"]`).length > 0, page.path);
    for (const link of $('a[href*="wa.me"]').toArray()) {
      const url = new URL($(link).attr('href'));
      assert.equal(url.origin + url.pathname, business.whatsapp);
      assert.deepEqual([...url.searchParams.keys()].filter(k => k !== 'text'), []);
    }
    assert.equal($('a[href^="/api/"]').length, 0, page.path);
  }
});
