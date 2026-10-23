import type { APIRoute } from 'astro';
import { indexingEnabled, siteUrl } from '../lib/config.mjs';
export const GET: APIRoute = () => new Response(indexingEnabled
  ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n', { headers: { 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-cache' } });
