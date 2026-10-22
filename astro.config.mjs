import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
export default defineConfig({
  site: 'https://reformasquijano.online',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'always',
  server: { host: '0.0.0.0', port: 4321 },
  vite: { build: { assetsInlineLimit: 0 }, ssr: { external: ['node:sqlite', 'nodemailer'] } },
});
