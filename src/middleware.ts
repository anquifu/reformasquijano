import { defineMiddleware } from 'astro:middleware';
import { randomBytes } from 'node:crypto';
import { redirects } from './data/site.mjs';
import { indexingEnabled } from './lib/config.mjs';
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.nonce = randomBytes(18).toString('base64');
  const path = context.url.pathname;
  if (['GET','HEAD'].includes(context.request.method) && !path.includes('.') && !path.startsWith('/api/')) {
    const normalized = path.endsWith('/') ? path : `${path}/`;
    const destination = redirects[normalized as keyof typeof redirects];
    if (destination) return context.redirect(destination, 301);
    if (normalized !== path) return context.redirect(normalized, 301);
  }
  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options','DENY');
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if (!indexingEnabled) response.headers.set('X-Robots-Tag','noindex, nofollow');
  if (response.headers.get('content-type')?.includes('text/html') || path.startsWith('/api/')) response.headers.set('Cache-Control','no-store');
  if (!import.meta.env.DEV) response.headers.set('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${context.locals.nonce}'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`);
  return response;
});
