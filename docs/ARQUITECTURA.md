# Arquitectura

La entrega es una carpeta de archivos estáticos: HTML, CSS, JavaScript, fuentes locales e imágenes. Contiene 11 páginas de contenido (nueve indexables y dos legales) y una página de error 404. No hay proceso de aplicación en producción.

Astro genera el HTML durante el desarrollo. Los datos del negocio y los servicios se editan en `src/data/site.mjs`; el diseño se comparte mediante componentes. `ContactSection.astro` ofrece teléfono y WhatsApp con un texto inicial específico del servicio. `client.ts` solo mejora el menú y emite eventos locales de clic, sin transmitirlos a terceros.

`scripts/package-html.mjs` prepara `.htaccess` con redirecciones, error 404 y cabeceras, incluida una política CSP con hashes para los datos estructurados. `scripts/serve-static.mjs` permite revisar localmente el resultado; no se sube ni se ejecuta en Hostinger.

El paquete no contiene API, PHP, base de datos, datos de clientes ni dependencias de Node. Las fuentes e imágenes son locales. La imagen principal está identificada como ilustrativa. No se inventan proyectos, testimonios, dirección de atención al público ni certificaciones.

Se conservan las URLs de los servicios. La antigua página de confirmación `/solicitud-recibida/` redirige a la página de contacto porque ya no existe un formulario.
