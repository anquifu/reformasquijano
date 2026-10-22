import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createToken, validToken, validateLead, classification } from '../src/lib/forms.mjs';
import { database, saveLead, allowedRate, cleanup } from '../src/lib/leads.mjs';
const sample = () => ({ name:'Prueba Técnica', phone:'600 000 000',email:'prueba@example.test',municipality:'A Coruña',service:'banos',budget:'',urgency:'sin-fecha',startDate:'',description:'Solicitud ficticia para comprobar el formulario.',privacy:'accepted',source:'/',requestId:randomUUID() });

test('csrf requiere firma válida, cookie correspondiente y token vigente',()=>{
  const now=Date.now();const token=createToken(now);
  assert.equal(validToken(token,token,now+2000),true);
  assert.equal(validToken(token,createToken(now),now+2000),false);
  assert.equal(validToken(token+'0',token+'0',now+2000),false);
  assert.equal(validToken(token,token,now+3600001),false);
  assert.equal(validToken(token,token,now-1),false);
});
test('validación rechaza datos incompletos, email mal formado y municipios ajenos',()=>{
  const good=validateLead(sample());assert.equal(good.valid,true);assert.equal(good.data.phone,'600000000');
  const bad=validateLead({...sample(),name:'x',phone:'abc',email:'x\r\nBcc: someone@example.test',municipality:'Inventado',service:'locales',privacy:'',description:'a'});
  assert.equal(bad.valid,false);
  for(const key of ['name','phone','email','municipality','service','privacy','description'])assert.ok(bad.errors[key]);
});
test('fecha y clasificación no crean prioridades comerciales inexistentes',()=>{
  assert.equal(validateLead({...sample(),urgency:'fecha-prevista',startDate:''}).valid,false);
  assert.equal(validateLead({...sample(),startDate:'2030-02-31'}).valid,false);
  assert.equal(validateLead({...sample(),startDate:'2020-01-01'}).valid,false);
  assert.deepEqual(classification({...sample(),service:'cerrajeria',budget:''}),{category:'incidencia',service:'cerrajeria',budget:'sin-definir',urgency:'sin-fecha'});
});
test('persistencia real, idempotencia, límite de intentos, limpieza y permisos privados',()=>{
  const dir=mkdtempSync(join(tmpdir(),'quijano-db-'));const file=join(dir,'test.sqlite');const db=database(file);
  try {
    const data=validateLead(sample()).data;const first=saveLead(data,db);assert.equal(first.created,true);
    const second=saveLead(data,db);assert.equal(second.created,false);assert.equal(first.id,second.id);
    assert.throws(()=>saveLead({...data,description:'Mismo id con contenido diferente.'},db),/IDEMPOTENCY_CONFLICT/);
    assert.equal(db.prepare('SELECT count(*) AS n FROM leads').get().n,1);
    assert.equal(statSync(file).mode & 0o777,0o600);
    for(let i=0;i<12;i++)assert.equal(allowedRate('test',db,1000000),true);
    assert.equal(allowedRate('test',db,1000000),false);
    assert.equal(allowedRate('different',db,1000000),true);
    assert.equal(allowedRate('test',db,1600001),true);
    db.prepare('UPDATE leads SET created_at=0').run();cleanup(db);
    assert.equal(db.prepare('SELECT count(*) AS n FROM leads').get().n,0);
  } finally {db.close();rmSync(dir,{recursive:true,force:true});}
});
