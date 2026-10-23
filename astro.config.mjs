import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://reformasquijano.online',
  output: 'static',
  trailingSlash: 'always',
  server: { host: '0.0.0.0', port: 4321 },
  vite: { build: { assetsInlineLimit: 0 } },
});
