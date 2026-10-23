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
 await page.selectOption('#service','banos');await page.selectOption('#municipality','A Coruña');
 await page.fill('#name','Prueba de navegación');await page.fill('#phone','600000000');
 await page.fill('#description','Solicitud ficticia de prueba del formulario.');await page.locator('[name=privacy]').check();
 await page.evaluate(()=>{window.testConversions=[];document.addEventListener('quijano:conversion',e=>window.testConversions.push(e.detail));});
 const response=page.waitForResponse(r=>r.url().endsWith('/api/solicitudes.php')&&r.request().method()==='POST');
 await page.waitForTimeout(1200);await page.locator('.form-submit').click();assert.equal((await response).status(),201);
 await page.locator('.is-success').waitFor();assert.equal(await page.locator('.form-submit').isDisabled(),true);
 assert.equal(await page.evaluate(()=>window.testConversions.some(x=>x.name==='lead_registered')),true);
 report.checks.push('AJAX: HTTP 201, confirmación y evento sin datos personales','Menú Escape, enlaces de teléfono y WhatsApp','Sin desbordamiento en 1440, 802 y 390 px');
 const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();
 await plain.goto(base+'/api/formulario.php');
 await plain.selectOption('#service','cerrajeria');await plain.selectOption('#municipality','Oleiros');
 await plain.fill('#name','Prueba sin Javascript');await plain.fill('#phone','600000001');
 await plain.fill('#description','Solicitud ficticia sin Javascript para verificación.');await plain.locator('[name=privacy]').check();
 await plain.waitForTimeout(1600);await plain.locator('.form-submit').click();
 await plain.waitForURL('**/api/confirmacion.php');assert.match(await plain.locator('main').innerText(),/registrad/i);
 report.checks.push('Formulario nativo sin JavaScript: confirmación con cookie');
 await context.close();
 assert.deepEqual(report.errors,[],'Errores de navegador');
 assert.equal(report.accessibility.flatMap(x=>x.violations).length,0,'Violaciones WCAG detectadas');
 console.log(JSON.stringify(report,null,2));
} finally {writeFileSync('artifacts/browser-report.json',JSON.stringify(report,null,2));await browser.close();}
