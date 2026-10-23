# Reformas Quijano

Web funcional de servicios locales con Astro SSR y captación persistente en SQLite. **Versión privada, no publicada.** El envío a la cuenta real requiere SMTP del hosting.

## Abrir localmente

Requisitos: Node 24 o superior y npm. Desde la raíz:

```sh
npm ci
cp .env.example .env
ASTRO_TELEMETRY_DISABLED=1 npm run dev
```

Abrir http://localhost:4321. Usar datos ficticios en la vista previa. Mantener `SITE_INDEXING=false`. No se necesita SMTP para comprobar el registro local de solicitudes.

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm start
```

La compilación genera servidor Node y recursos estáticos; no sirve un hosting exclusivamente estático.

## Comprobaciones

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run check
npm test
# Con el servidor arrancado:
npm run test:web
npm run test:browser
```

Las pruebas de navegador requieren Chromium (`CHROMIUM_PATH`, por defecto `/usr/bin/chromium`) y crean solicitudes ficticias. Ejecútalas contra una base de datos de pruebas mediante `LEADS_DB`, nunca contra producción. `npm test` usa archivos temporales y SMTP en loopback; no envía correos externos.

## Documentación

- [Mapa SEO y rutas](SEO_MAP.md)
- [Arquitectura e inventario](docs/ARQUITECTURA.md)
- [Despliegue y pendientes](docs/DESPLIEGUE.md)
- [Configuración de Hostinger y diagnóstico del 403](docs/HOSTINGER.md)
- [Validación](docs/VALIDACION.md)
- [Revisión visual](design-qa.md)
- [Auditoría de los materiales aportados](docs/AUDITORIA_INSUMOS.md)
