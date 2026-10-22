# Arquitectura e inventario

Astro SSR entrega contenido y metadatos completos sin depender de JavaScript. El cliente añade envío AJAX, navegación y eventos locales; el formulario también funciona de forma nativa. Node 24 ejecuta SQLite, validación y notificaciones SMTP.

## Archivos

- `src/data/site.mjs`: datos únicos de negocio, servicios, contenido, rutas y redirecciones. Nombre, teléfono, horarios y cobertura se reutilizan desde esta fuente.
- `src/pages/[...page].astro`: home, seis servicios y páginas auxiliares. Las rutas desconocidas devuelven 404.
- `src/layouts/Layout.astro`: cabecera, pie, metadatos y navegación.
- `src/components/`: hero, fichas, FAQ, cobertura y formulario accesible.
- `src/styles/global.css`: adaptación a móvil, tableta y escritorio.
- `src/pages/api/solicitudes.ts`: validación de origen, token/cookie firmados, honeypot, límite de frecuencia y tamaño; respuesta real según resultado del registro.
- `src/lib/leads.mjs`: almacenamiento privado, idempotencia, clasificación, retención y estado de correo.
- `src/lib/mail.mjs`: SMTP con TLS para proveedores remotos y cola de reintentos.
- `src/middleware.ts`: redirecciones, CSP, cabeceras de seguridad y protección contra indexación de la vista previa.
- `src/lib/structured-data.mjs`: Organization, WebSite, Service y BreadcrumbList. Sin dirección inventada, reseñas ni certificaciones.
- `public/images/`: fotografía ilustrativa generada, optimizada en WebP a 640, 960 y 1680 px y variante social. No es un proyecto propio.
- `public/icons/`: iconos Phosphor. Fuentes Manrope alojadas localmente.
- `scripts/`: mapa SEO, validación HTTP/navegador, gestión local de solicitudes y reintentos.
- `tests/`: controles de seguridad y almacenamiento y prueba de entrega/reintento SMTP local.

## Flujo de presupuesto

Formulario → validación del servidor → SQLite → intento de notificación SMTP → confirmación de registro. La confirmación no afirma que el correo haya llegado ni que haya una cita. El fallo SMTP conserva la solicitud para reintento. Un reenvío del mismo identificador no crea otra solicitud; un cambio de contenido con ese identificador se rechaza.

La ficha conserva servicio, rango de presupuesto indicado por el cliente y urgencia declarada; no aplica puntuaciones comerciales inventadas. Email, presupuesto y fecha son opcionales. No se habilitan adjuntos: faltan almacenamiento seguro, controles y política operativa para ellos.

Los eventos `quijano:conversion` (llamada, WhatsApp y solicitud registrada) se emiten solamente en el navegador, sin datos personales. No hay Google Analytics, píxeles publicitarios ni cookies analíticas. Las cookies de formulario son técnicas.

## Decisiones editoriales

La última instrucción exige proyectos reales. Al no disponer de fotografías verificadas de trabajos propios, se sustituye la galería conceptual por una explicación del proceso. No hay testimonios, precios cerrados, certificaciones, años de experiencia ni servicio 24 horas inventados. Cerrajería tiene página y contacto propios.

Se agrupan pisos/integrales y pladur/techos para evitar duplicar intención. Los municipios aparecen en cobertura, sin crear páginas repetidas. `/cerrajeria/` se conserva: la alternativa `/cerrajero-a-coruna/` necesita resolver la excepción indicada por el usuario antes de migrarla.
