import type { APIRoute } from 'astro';
import { pages } from '../data/site.mjs';
import { indexingEnabled, siteUrl } from '../lib/config.mjs';
export const GET: APIRoute = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexingEnabled ? pages.filter(p=>p.indexable).map(p=>`<url><loc>${siteUrl}${p.path}</loc></url>`).join('') : ''}</urlset>`, { headers: { 'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-cache' } });
