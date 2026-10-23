import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
export const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://reformasquijano.online').replace(/\/$/, '');
if (!/^https?:\/\/[a-z0-9.:[\]-]+$/i.test(siteUrl)) throw new Error('PUBLIC_SITE_URL debe ser un origen válido sin rutas.');
export const indexingEnabled = process.env.SITE_INDEXING === 'true';
export const retentionDays = Math.max(1, Math.min(365, Number(process.env.LEAD_RETENTION_DAYS) || 30));
