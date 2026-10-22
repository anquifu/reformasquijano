import test from 'node:test';
import assert from 'node:assert/strict';
import { SMTPServer } from 'smtp-server';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { database,saveLead } from '../src/lib/leads.mjs';
import { notifyLead } from '../src/lib/mail.mjs';
test('notificación SMTP local, persistencia del estado y reintento tras fallo',async()=>{
 const received=[];
 const server=new SMTPServer({authOptional:true,disabledCommands:['AUTH','STARTTLS'],onData(stream,session,cb){let text='';stream.on('data',chunk=>text+=chunk);stream.on('end',()=>{received.push(text);cb();});}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const dir=mkdtempSync(join(tmpdir(),'quijano-mail-'));const db=database(join(dir,'leads.sqlite'));
 Object.assign(process.env,{SMTP_HOST:'127.0.0.1',SMTP_PORT:String(server.server.address().port),SMTP_SECURE:'false',MAIL_FROM:'web@example.test',LEAD_EMAIL:'recipient@example.test'});
 const data={requestId:randomUUID(),name:'Prueba SMTP',phone:'600000000',email:'sender@example.test',municipality:'A Coruña',service:'banos',budget:'',urgency:'sin-fecha',description:'Prueba ficticia, sin destinatarios externos.',source:'/'};
 try {
  const lead=saveLead(data,db);assert.equal(await notifyLead(lead.id,db),true);assert.equal(received.length,1);
  assert.match(received[0],/recipient@example.test/);assert.equal(db.prepare('SELECT mail_state FROM leads WHERE id=?').get(lead.id).mail_state,'sent');
  assert.equal(await notifyLead(lead.id,db),false);assert.equal(received.length,1);
  const retry=saveLead({...data,requestId:randomUUID()},db);const port=process.env.SMTP_PORT;process.env.SMTP_PORT='1';
  assert.equal(await notifyLead(retry.id,db),false);assert.equal(db.prepare('SELECT mail_state FROM leads WHERE id=?').get(retry.id).mail_state,'failed');
  process.env.SMTP_PORT=port;assert.equal(await notifyLead(retry.id,db),true);assert.equal(received.length,2);
 } finally {db.close();await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});}
});
