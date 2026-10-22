import { randomBytes, createHmac, timingSafeEqual, createHash } from 'node:crypto';
import { services, business } from '../data/site.mjs';
import './config.mjs';

const secret = process.env.FORM_SECRET || randomBytes(32).toString('hex');
if (process.env.NODE_ENV === 'production' && process.env.SITE_INDEXING === 'true' && (process.env.FORM_SECRET || '').length < 32) {
  throw new Error('FORM_SECRET de al menos 32 caracteres es obligatorio al activar indexación.');
}
export function createToken(now = Date.now()) {
  const payload = `${randomBytes(24).toString('hex')}.${now}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}
function equal(a, b) { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); }
export function validToken(value, cookie, now = Date.now()) {
  if (typeof value !== 'string' || value.length > 200 || !equal(value, cookie || '')) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [nonce, issued, signature] = parts;
  if (!/^[a-f0-9]{48}$/.test(nonce) || !/^\d{13}$/.test(issued)) return false;
  const age = now - Number(issued);
  return age >= 0 && age < 3_600_000 && equal(signature, createHmac('sha256', secret).update(`${nonce}.${issued}`).digest('hex'));
}
export function tokenAge(token) { return Date.now() - Number(String(token).split('.')[1]); }
export function privateIpKey(ip) { return createHmac('sha256', secret).update(String(ip)).digest('hex'); }
export function classification(data) {
  return { category: ['cerrajeria', 'desatascos'].includes(data.service) ? 'incidencia' : 'reforma', service: data.service, budget: data.budget || 'sin-definir', urgency: data.urgency };
}
export const budgets = ['', 'por-definir', 'menos-3000', '3000-10000', '10000-30000', 'mas-30000'];
export const urgencies = ['sin-fecha', 'proximamente', 'fecha-prevista', 'consultar-disponibilidad'];
const clean = (value) => typeof value === 'string' ? value.trim() : '';
export function validateLead(raw) {
  const data = Object.fromEntries(['name','phone','email','municipality','service','budget','startDate','urgency','description','source','requestId'].map(k => [k, clean(raw[k])]));
  const errors = {};
  if (data.name.length < 2 || data.name.length > 100 || /[\r\n<>]/.test(data.name)) errors.name = 'Escribe un nombre de entre 2 y 100 caracteres.';
  const phone = data.phone.replace(/[\s().-]/g, '');
  if (!/^\+?\d{9,15}$/.test(phone)) errors.phone = 'Escribe un teléfono válido con al menos 9 cifras.';
  data.phone = phone;
  if (data.email && (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(data.email) || data.email.length > 254)) errors.email = 'Revisa el correo electrónico.';
  if (!business.areas.includes(data.municipality)) errors.municipality = 'Selecciona uno de los municipios atendidos.';
  if (!services.some(s => s.id === data.service)) errors.service = 'Selecciona el servicio que necesitas.';
  if (!budgets.includes(data.budget)) errors.budget = 'Selecciona una opción de presupuesto.';
  if (!urgencies.includes(data.urgency)) errors.urgency = 'Selecciona cuándo necesitas el trabajo.';
  if (data.startDate) {
    const parsed = new Date(`${data.startDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.startDate) || !Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0,10) !== data.startDate || data.startDate < new Date().toISOString().slice(0,10)) errors.startDate = 'Indica una fecha válida de hoy en adelante.';
  }
  if (data.urgency === 'fecha-prevista' && !data.startDate) errors.startDate = 'Indica la fecha aproximada o elige otra opción.';
  if (data.description.length < 15 || data.description.length > 2500) errors.description = 'Describe el trabajo con entre 15 y 2500 caracteres.';
  if (raw.privacy !== 'accepted') errors.privacy = 'Lee y acepta la información de privacidad para enviar.';
  if (!/^[a-f0-9-]{36}$/.test(data.requestId)) errors.requestId = 'Recarga la página para iniciar una solicitud.';
  // Solo rutas internas conocidas, nunca query strings con datos personales.
  if (!/^\/[a-z0-9/-]*$/.test(data.source) || data.source.length > 150) data.source = '/';
  return { valid: !Object.keys(errors).length, data, errors };
}
export function fingerprint(data) {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
