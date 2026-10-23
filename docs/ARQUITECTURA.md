# Arquitectura e inventario — versión HTML + PHP

El sitio público está formado por páginas HTML independientes, CSS, JavaScript pequeño e imágenes WebP. El hosting no renderiza la home ni los servicios: entrega directamente los archivos. Astro solo genera esos archivos durante el desarrollo.

- `src/data/site.mjs`: datos confirmados del negocio y contenido único de cada servicio, rutas y redirecciones.
- `src/pages/[...page].astro`: generación de las doce páginas y un 404.
- `src/layouts/` y `src/components/`: plantillas compartidas; el resultado final es HTML.
- `src/styles/global.css`: diseño adaptable; fuentes locales y fotografías optimizadas.
- `src/scripts/client.ts`: menú, eventos locales de contacto y mejora AJAX del formulario. El contenido SEO no depende de este script.
- `php/`: procesador del formulario, emisión de tokens y confirmación segura. El paquete coloca estos archivos en `api/`.
- `scripts/package-html.mjs`: copia PHP, genera configuración pública, 404 y `.htaccess` con redirecciones y hashes CSP de los scripts JSON-LD.
- `scripts/serve-php.mjs` y `php-router.php`: servidor local de pruebas; el hosting usa Apache/LiteSpeed.
- `scripts/leads.php`: consulta local, borrado, purga y reintento de notificaciones. Nunca se publica como ruta administrativa.
- `dist/`: entrega lista para subir; no incluye código fuente de Astro, npm, secretos ni solicitudes.

## Solicitudes

El JavaScript solicita un token específico de cada visitante a PHP al interactuar con el formulario. El HTML estático no contiene un token compartido. PHP verifica origen, cookie firmada, caducidad, campo trampa, tamaño, límite de frecuencia y campos del negocio. Luego guarda una solicitud idempotente y notifica mediante el transporte de correo PHP.

Sin JavaScript, el enlace «formulario accesible» abre el mismo diseño desde PHP con su token individual y permite enviar y recibir confirmación. Abrir una página de confirmación directamente no acredita un envío.

La persistencia usa archivos JSON privados y escrituras atómicas bajo bloqueo, fuera del directorio público. Las solicitudes contienen clasificación por servicio, presupuesto y urgencia. Las IP se convierten en HMAC para la limitación; no se guardan en claro. La conservación técnica predeterminada es de 30 días y requiere tarea diaria de purga para cumplirse cuando no llegan solicitudes nuevas.

La notificación se marca como `accepted` cuando `mail()` acepta el mensaje, sin afirmar entrega al buzón. Los fallos quedan pendientes para reintento, con máximo de cinco intentos y recuperación de envíos interrumpidos tras cinco minutos. Existe una posibilidad de duplicar una notificación si el proceso muere después de aceptar el correo y antes de guardar el estado, inherente a este transporte; se usa un Message-ID estable.

No se habilitan adjuntos, analítica externa ni publicidad. Las cookies del formulario son técnicas. No hay proyectos, opiniones, dirección de oficina, servicio 24 horas ni certificaciones inventados. La imagen del hero se identifica como ilustrativa.
