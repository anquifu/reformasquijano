# Validación de la versión HTML + PHP

23 de octubre de 2026. Comprobación local con PHP 8.4 y Chromium. Los archivos públicos son HTML real; PHP se limita al formulario. No se ha cambiado el tipo de sitio ni subido el paquete a Hostinger desde este entorno.

| Comprobación | Resultado observado |
|---|---|
| Generación | 12 páginas independientes y 404; `dist/index.html` presente |
| Astro/TypeScript | 0 errores, 0 advertencias, 0 hints |
| Backend PHP | Prueba de integración aprobada: token/cookie, origen, honeypot, campos, fechas, tamaño, límites, persistencia privada, idempotencia y borrado por caducidad |
| Correo PHP | Transporte local capturado; prueba de fallo conserva solicitud y reintento cambia a aceptada. Ningún correo externo enviado |
| Formulario en navegador | AJAX 201, referencia y evento local; formulario PHP alternativo sin JavaScript con confirmación protegida |
| SEO | 12 páginas, 26 destinos internos, title/H1/description/canonical/OG/Twitter/JSON-LD comprobados; sin fallos |
| Indexación | Probadas ambas compilaciones: revisión noindex/sitemap vacío y publicación con 9 URLs en sitemap |
| Estados y navegación | 200, redirecciones 301 y 404 comprobados mediante servidor local que emula `.htaccess` |
| Responsive | 1440, 802 y 390 px sin desbordamiento |
| Axe WCAG 2 A/AA + 2.1 AA | 0 infracciones detectadas en la home en esos tres anchos |
| JavaScript/CSP | 0 errores de navegador en la prueba final |
| Dependencias de desarrollo | npm audit completo: 0 vulnerabilidades reportadas |

La prueba de integración PHP utiliza un proceso PHP real y archivos temporales fuera del directorio público. Verifica que un formulario enviado dos veces no duplica el registro ni el correo, que un cambio con la misma referencia se rechaza y que un fallo del transporte no pierde la solicitud. Las confirmaciones no prometen una cita ni entrega del email.

## Evidencias

- `artifacts/seo-preview.json` y `artifacts/seo-indexable.json`.
- `artifacts/browser-report.json`.
- Capturas locales en `artifacts/screenshots/home-1440.png`, `home-802.png` y `home-390.png`.
- Prueba reproducible: `PHP_BIN=/ruta/php npm test`, después de compilar.

## Límites

El servidor local emula las rutas y cabeceras de Apache/LiteSpeed; no sustituye la comprobación del `.htaccess`, permisos y transporte de correo en el hosting real. La entrega al buzón `info@reformasquijano.online`, el almacenamiento privado y la tarea programada de limpieza se deben verificar al subir.

Los títulos cortos de privacidad, aviso legal y confirmación y una descripción de cerrajería de 156 caracteres generan avisos editoriales de longitud, sin fallos técnicos. No se han medido volúmenes de búsqueda, posiciones ni tráfico real. La inspección automatizada no certifica accesibilidad completa ni cubre Safari/dispositivos físicos.

Los resultados Lighthouse de la versión Node anterior no se presentan como mediciones de esta entrega. INP y Core Web Vitals de campo quedan pendientes del despliegue y tráfico suficiente.

Los datos legales siguen pendientes de completar/revisar. No hay NIF ni dirección inventados. La indexación se puede activar al generar los HTML, pero no implica aprobación legal ni publicación automática.
