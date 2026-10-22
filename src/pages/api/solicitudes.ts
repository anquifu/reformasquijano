import type { APIRoute } from 'astro';
import { siteUrl, indexingEnabled } from '../../lib/config.mjs';
import { validateLead, validToken, tokenAge, privateIpKey } from '../../lib/forms.mjs';
import { database, allowedRate, cleanup, saveLead } from '../../lib/leads.mjs';
import { notifyLead } from '../../lib/mail.mjs';

export const POST: APIRoute = async ({ request, cookies, clientAddress, redirect }) => {
  const json = request.headers.get('accept')?.includes('application/json');
  const reply = (status: number, message: string, errors: Record<string,string> = {}, id?: string) => {
    if (!json && status === 201) {
      cookies.set('rq_received', '1', { httpOnly: true, sameSite: 'strict', secure: new URL(request.url).protocol === 'https:', path: '/', maxAge: 180 });
      return redirect('/solicitud-recibida/', 303);
    }
    if (!json) return new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Revisa tu solicitud</title><h1>${message}</h1><p>Vuelve al formulario para revisar los campos o llama al 602 089 887.</p><a href="/presupuesto-reformas-a-coruna/">Volver al formulario</a></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    return new Response(JSON.stringify({ ok: status === 201, message, errors, ...(id ? { reference: id } : {}) }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '600' } : {}) } });
  };
  const origin = request.headers.get('origin');
  const allowedOrigins = [new URL(request.url).origin, siteUrl];
  // El adaptador SSR puede reconstruir la URL usando el dominio canónico.
  // La vista previa admite únicamente los dos hosts de loopback y su puerto configurado.
  if (!indexingEnabled) {
    const port = process.env.PORT || '4321';
    allowedOrigins.push(`http://localhost:${port}`, `http://127.0.0.1:${port}`);
  }
  if (!origin || !allowedOrigins.includes(origin)) return reply(403, 'No se pudo verificar el origen del formulario.');
  if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return reply(415, 'Formato de solicitud no admitido.');
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 16000) return reply(413, 'La solicitud es demasiado larga.');
  let body = '';
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, 'Solicitud vacía.');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const {done, value} = await reader.read(); if (done) break; size += value.byteLength; if (size > 16000) { await reader.cancel(); return reply(413, 'La solicitud es demasiado larga.'); } chunks.push(value); }
    body = Buffer.concat(chunks).toString('utf8');
  } catch { return reply(400, 'No se pudo leer la solicitud.'); }
  const fields = new URLSearchParams(body);
  const raw = Object.fromEntries(fields.entries());
  if (!validToken(raw.csrf, cookies.get('rq_form')?.value)) return reply(403, 'El formulario ha caducado. Recarga la página y vuelve a intentarlo.');
  if (raw.website || tokenAge(raw.csrf) < 1500) return reply(422, 'Revisa los datos antes de enviar la solicitud.');
  try {
    const db = database(); cleanup(db);
    const forwarded = process.env.TRUST_PROXY === '1' ? request.headers.get('x-forwarded-for')?.split(',')[0].trim() : undefined;
    if (!allowedRate(privateIpKey(forwarded || clientAddress || 'unknown'), db)) return reply(429, 'Has realizado varios intentos. Espera unos minutos o contacta por teléfono.');
    const { valid, data, errors } = validateLead(raw);
    if (!valid) return reply(422, 'Revisa los campos indicados.', { ...errors });
    const saved = saveLead(data, db);
    if (saved.created) await notifyLead(saved.id, db);
    return reply(201, 'Tu solicitud ha quedado registrada. El envío no confirma una cita ni una intervención.', {}, saved.id);
  } catch (error) {
    if (error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT') return reply(409, 'Esta solicitud ya se registró con otros datos. Recarga la página para enviar otra.');
    return reply(503, 'No se ha podido registrar la solicitud. Conserva tus datos y vuelve a intentarlo o llama al 602 089 887.');
  }
};
export const ALL: APIRoute = () => new Response('Método no permitido', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
