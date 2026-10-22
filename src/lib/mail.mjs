import nodemailer from 'nodemailer';
import { database, cleanup } from './leads.mjs';
import { mailEnabled } from './config.mjs';
import { business, serviceById } from '../data/site.mjs';

export async function notifyLead(id, db = database()) {
  if (!mailEnabled()) return false;
  const claimed = db.prepare("UPDATE leads SET mail_state='sending', mail_attempts=mail_attempts+1 WHERE id=? AND mail_state IN ('pending','failed')").run(id);
  if (!claimed.changes) return false;
  const row = db.prepare('SELECT data, classification FROM leads WHERE id=?').get(id);
  if (!row) return false;
  const d = JSON.parse(row.data);
  const service = serviceById(d.service)?.label || d.service;
  const options = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
    ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}),
    // Plain SMTP solo con el receptor de pruebas en loopback.
    ...(['127.0.0.1','localhost'].includes(process.env.SMTP_HOST || '') ? {} : { requireTLS: true }),
  };
  const transport = nodemailer.createTransport(options);
  try {
    const result = await transport.sendMail({
      from: process.env.MAIL_FROM, to: process.env.LEAD_EMAIL,
      subject: `${business.name}: solicitud de ${service}`,
      messageId: `<${id}@reformasquijano.online>`,
      ...(d.email ? { replyTo: d.email } : {}),
      text: [`Referencia: ${id}`, `Nombre: ${d.name}`, `Teléfono: ${d.phone}`, `Correo: ${d.email || 'No indicado'}`, `Municipio: ${d.municipality}`, `Servicio: ${service}`, `Presupuesto orientativo del cliente: ${d.budget || 'Sin definir'}`, `Necesidad: ${d.urgency}`, `Fecha deseada: ${d.startDate || 'Sin definir'}`, '', d.description, '', `Página de origen: ${d.source}`, 'La solicitud no confirma una intervención.'].join('\n'),
    });
    if (!result.accepted?.length) throw new Error('MAIL_NOT_ACCEPTED');
    db.prepare("UPDATE leads SET mail_state='sent' WHERE id=?").run(id);
    return true;
  } catch {
    db.prepare("UPDATE leads SET mail_state='failed' WHERE id=?").run(id);
    return false; // No exponer mensajes del proveedor ni datos de la solicitud.
  } finally { transport.close(); }
}
export async function retryPending(db = database()) {
  cleanup(db);
  // Recuperar envíos interrumpidos por un reinicio; Message-ID estable para deduplicación del destinatario.
  db.prepare("UPDATE leads SET mail_state='failed' WHERE mail_state='sending'").run();
  const rows = db.prepare("SELECT id FROM leads WHERE mail_state IN ('pending','failed') AND mail_attempts<5 ORDER BY created_at LIMIT 20").all();
  let sent = 0;
  for (const row of rows) if (await notifyLead(row.id, db)) sent++;
  return { reviewed: rows.length, sent };
}
