import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { load } from 'cheerio';
import { pages, redirects, business } from '../src/data/site.mjs';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4321';
const origin = process.env.PUBLIC_SITE_URL || business.site;
const expectedIndex = process.env.EXPECT_INDEXING === 'true';
const failures = [], warnings = [], results = [];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(t=>t&&!['de','en','la','el','los','las','y','para'].includes(t)).join(' ');
const record=(condition,message)=>{if(!condition)failures.push(message)};
for (const key of ['path','title','h1']) {
 const values=pages.map(p=>p[key]);record(new Set(values).size===values.length,`Duplicados en ${key}`);
}
const intentions=new Set();
for(const p of pages.filter(p=>p.keyword)){
 const key=`${norm(p.keyword)}|${p.intent}`;record(!intentions.has(key),`Keyword/intención duplicada ${p.path}`);intentions.add(key);
}
const docs=new Map(),incoming=new Map(pages.map(p=>[p.path,new Set()]));
for(const p of pages){
 const response=await fetch(base+p.path);record(response.status===200,`${p.path}: HTTP ${response.status}`);
 const html=await response.text();const $=load(html);docs.set(p.path,$);
 record($('h1').length===1,`${p.path}: H1 ausente o múltiple`);
 record($('title').text()===p.title,`${p.path}: title incorrecto`);
 record($('meta[name=description]').attr('content')===p.description,`${p.path}: descripción incorrecta`);
 record($('link[rel=canonical]').attr('href')===origin+p.path,`${p.path}: canonical incorrecto`);
 for(const selector of ['meta[property="og:title"]','meta[property="og:description"]','meta[property="og:image"]','meta[name="twitter:card"]'])record(Boolean($(selector).attr('content')),`${p.path}: falta ${selector}`);
 record($('html').attr('lang')==='es',`${p.path}: idioma ausente`);
 const index=Boolean(p.indexable&&expectedIndex);const robots=$('meta[name=robots]').attr('content');
 record(index ? robots?.startsWith('index,') : robots?.includes('noindex'),`${p.path}: robots incorrecto`);
 if(p.type==='service'||p.id==='home'||p.id==='contact'){
  record(norm(p.h1).includes(norm(p.keyword)),`${p.path}: keyword ausente en H1`);
  record(norm(p.title).includes(norm(p.keyword)),`${p.path}: keyword ausente en title`);
  if(!p.slugException)record(norm(p.path).includes(norm(p.keyword)),`${p.path}: keyword ausente en slug`);
  const intro=$('main p').first().text();record(norm(intro).includes(norm(p.keyword)),`${p.path}: keyword ausente en primer párrafo`);
 }
 if(p.title.length<45||p.title.length>60)warnings.push(`${p.path}: title ${p.title.length} caracteres (guía editorial)`);
 if(p.description.length<140||p.description.length>155)warnings.push(`${p.path}: descripción ${p.description.length} caracteres (guía editorial)`);
 for(const img of $('img').toArray()){
  const el=$(img);record(el.attr('alt')!==undefined,`${p.path}: imagen sin alt`);
  if(!el.hasClass('icon'))record((el.attr('alt')||'').length>=15,`${p.path}: imagen importante sin alt adecuado`);
  record(Boolean(el.attr('width')&&el.attr('height')),`${p.path}: imagen sin dimensiones`);
 }
 const schemaElements=$('script[type="application/ld+json"]').toArray();record(schemaElements.length>0,`${p.path}: sin JSON-LD`);
 for(const el of schemaElements){
  try{
   const schema=JSON.parse($(el).text());record(schema['@context']==='https://schema.org',`${p.path}: contexto JSON-LD`);
   const org=schema['@graph'].find(x=>x['@type']==='Organization');record(org?.telephone===business.telephone&&org?.name===business.name,`${p.path}: NAP estructurado inconsistente`);
   record(!org?.address,`${p.path}: dirección no facilitada`);
   if(p.type==='service')record(schema['@graph'].some(x=>x['@type']==='Service'&&x.url===origin+p.path),`${p.path}: falta Service`);
   if(p.path!=='/')record(schema['@graph'].some(x=>x['@type']==='BreadcrumbList'),`${p.path}: faltan breadcrumbs`);
  }catch{failures.push(`${p.path}: JSON-LD inválido`)}
 }
 results.push({path:p.path,status:response.status,titleLength:p.title.length,descriptionLength:p.description.length,indexable:index,htmlBytes:Buffer.byteLength(html)});
}
const checked=new Set();
for(const [path,$]of docs){
 for(const el of $('a[href]').toArray()){
  const href=$(el).attr('href');if(!href.startsWith('/'))continue;
  const url=new URL(href,base),target=url.pathname;
  if(target!==path&&incoming.has(target))incoming.get(target).add(path);
  if(url.hash&&docs.has(target))record(Boolean(docs.get(target)(`[id="${url.hash.slice(1)}"]`).length),`${path}: ancla rota ${href}`);
  if(!checked.has(target)) {checked.add(target);const response=await fetch(base+target,{redirect:'manual'});record(response.status>=200&&response.status<400,`${path}: enlace roto ${href} (${response.status})`);}
 }
 for(const src of [...$('img[src]').map((_,e)=>$(e).attr('src')).get(),...$('link[rel=stylesheet]').map((_,e)=>$(e).attr('href')).get()]){
  if(!src.startsWith('/')||checked.has(src))continue;checked.add(src);record((await fetch(base+src)).status===200,`${path}: asset ausente ${src}`);
 }
}
for(const p of pages.filter(p=>p.indexable&&p.path!=='/'))record(incoming.get(p.path).size>0,`${p.path}: página huérfana`);
const sitemap=await(await fetch(base+'/sitemap.xml')).text();const $xml=load(sitemap,{xmlMode:true});
const urls=$xml('loc').map((_,el)=>$xml(el).text()).get();
const expected=pages.filter(p=>p.indexable&&expectedIndex).map(p=>origin+p.path);
record(JSON.stringify([...urls].sort())===JSON.stringify(expected.sort()),'Sitemap no coincide con URLs canónicas indexables');
const robots=await(await fetch(base+'/robots.txt')).text();record(expectedIndex ? robots.includes(`Sitemap: ${origin}/sitemap.xml`)&&!robots.includes('Disallow: /\n') : robots.includes('Disallow: /\n'),'robots.txt incoherente');
const missing=await fetch(base+'/pagina-inexistente/');record(missing.status===404,'404 devuelve un estado diferente de 404');record((await missing.text()).includes('noindex'),'404 sin noindex');
for(const[from,to]of Object.entries(redirects)){const response=await fetch(base+from,{redirect:'manual'});record(response.status===301&&response.headers.get('location')===to,`Redirección incorrecta ${from}`);}
mkdirSync('artifacts',{recursive:true});writeFileSync(`artifacts/seo-${expectedIndex?'indexable':'preview'}.json`,JSON.stringify({base,expectedIndex,results,failures,warnings,internalTargets:checked.size},null,2));
console.log(JSON.stringify({pages:results.length,failures,warnings,internalTargets:checked.size},null,2));
assert.equal(failures.length,0,'Validación SEO fallida');
