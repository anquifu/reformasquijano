import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4321';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const report={screens:[],errors:[],accessibility:[],checks:[]};
mkdirSync('artifacts/screenshots',{recursive:true});
try {
 const mainContext=await browser.newContext();const page=await mainContext.newPage();
 const apiRequests=[];page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))apiRequests.push(request.url());});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
 for(const width of [1440,802,390]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow ${width}`);
  const screenshot=`artifacts/screenshots/home-${width}.png`;await page.screenshot({path:screenshot,fullPage:true});report.screens.push(screenshot);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  report.accessibility.push({width,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 }
 assert.equal(await page.locator('a[href="tel:+34602089887"]').count()>0,true);
 assert.equal(await page.locator('a[href="https://wa.me/34602089887"]').count()>0,true);
 await page.locator('.menu summary').click();assert.equal(await page.locator('.menu').getAttribute('open'),'');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.menu').getAttribute('open'),null);
 const faq=page.locator('.faq-list details').first();if(await faq.count()){const wasOpen=await faq.getAttribute('open');await faq.locator('summary').click();assert.notEqual(await faq.getAttribute('open'),wasOpen);}
 const contact=page.locator('#presupuesto');await contact.scrollIntoViewIfNeeded();
 assert.equal(await contact.locator('a[href^="https://wa.me/"]').isVisible(),true);
 assert.equal(await contact.locator('a.button[href="tel:+34602089887"]').isVisible(),true);
 assert.equal(await page.locator('form,input,textarea').count(),0);
 await page.goto(base+'/cerrajeria/');
 const whatsapp=new URL(await page.locator('#presupuesto a[href^="https://wa.me/"]').getAttribute('href'));
 assert.equal(whatsapp.pathname,'/34602089887');assert.match(whatsapp.searchParams.get('text'),/cerrajería/i);
 assert.deepEqual(apiRequests,[]);assert.deepEqual(await mainContext.cookies(),[]);
 report.checks.push('Contacto por teléfono y WhatsApp, con mensaje editable por servicio','Sin llamadas a API, formularios ni cookies en la navegación probada','Menú Escape y preguntas frecuentes','Sin desbordamiento en 1440, 802 y 390 px');
 const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();
 await plain.goto(base+'/presupuesto-reformas-a-coruna/');
 assert.equal(await plain.locator('h1').innerText(),'Presupuesto de reformas en A Coruña');
 await plain.locator('#presupuesto').scrollIntoViewIfNeeded();
 assert.equal(await plain.locator('#presupuesto a[href^="https://wa.me/"]').isVisible(),true);
 assert.equal(await plain.locator('#presupuesto a.button[href="tel:+34602089887"]').isVisible(),true);
 report.checks.push('Contenido y contacto disponibles sin JavaScript');
 await context.close();
 assert.deepEqual(report.errors,[],'Errores de navegador');
 assert.equal(report.accessibility.flatMap(x=>x.violations).length,0,'Violaciones WCAG detectadas');
 console.log(JSON.stringify(report,null,2));
} finally {writeFileSync('artifacts/browser-report.json',JSON.stringify(report,null,2));await browser.close();}
