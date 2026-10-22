# Despliegue y pendientes de publicación

**No se ha publicado ni modificado el DNS.** Dominio previsto: `reformasquijano.online`. Correo previsto: `info@reformasquijano.online`.

## Lo que falta

1. Elegir/acceder al hosting con Node 24, HTTPS, volumen persistente y tareas programadas. Configurar DNS y certificado cuando se autorice publicar.
2. Crear o verificar la cuenta de correo y proporcionar SMTP mediante secretos del hosting. Configurar SPF, DKIM y DMARC según su proveedor. La entrega a la cuenta real no está verificada.
3. Revisar y completar los textos legales. Titular facilitado: Andrea Quijano. No se ha facilitado NIF ni dirección legal; no están inventados ni incluidos en código. La preferencia por mantener el NIF privado no resuelve por sí sola las obligaciones del aviso legal. Acordar una solución válida con asesoramiento jurídico antes de publicar. No se requiere mostrar una oficina de atención al público inexistente.
4. Confirmar política de conservación y responsables/proveedores de datos: los 30 días son una configuración técnica provisional. El buzón y sus copias necesitan su propia política; borrar SQLite no borra los emails.
5. Resolver la excepción de URL de cerrajería descrita en `SEO_MAP.md`.
6. Aprobar la publicación. Solo entonces activar indexación. Los borradores legales permanecen noindex por diseño, aunque noindex no es control de acceso.

## Configuración

Copiar `.env.example` a secretos del entorno, nunca subir `.env`. Generar `FORM_SECRET` aleatorio de al menos 32 bytes y mantenerlo entre reinicios. Configurar `PUBLIC_SITE_URL=https://reformasquijano.online`, `MAIL_FROM` y `LEAD_EMAIL` con el remitente autorizado y el destinatario real. SMTP remoto verifica TLS; no desactivarlo.

`LEADS_DB` debe apuntar a un volumen privado persistente, fuera de `public/` y con acceso restringido al usuario del proceso. Para esta arquitectura usar **una instancia Node**: SQLite y la limitación local no están diseñados para varias réplicas. Establecer copia de seguridad cifrada, política de borrado y prueba de restauración. No usar filesystem efímero/serverless sin adaptar almacenamiento.

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run check
npm test
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm start
```

Ejecutar detrás de proxy HTTPS. Configurar `TRUST_PROXY=1` únicamente si el proxy reescribe la IP original e impide el acceso directo al servidor. No cachear HTML con tokens ni respuestas de API. Proteger preproducción con autenticación del hosting: robots/noindex no impide visitas.

Programar `npm run mail:retry` cada cinco minutos con exclusión mutua (`flock`) y `npm run leads -- purge` diariamente. Evitar que el recuperador de envíos interrumpidos corra a la vez que un envío activo: el mecanismo actual puede reenviar una notificación en ese caso; un Message-ID estable ayuda, pero no garantiza deduplicación en todos los buzones. Para mayor volumen, implantar una cola con arrendamientos antes de escalar.

Consultar solicitudes sin PII: `npm run leads -- list`. `show ID` muestra datos personales solo en terminal autorizada; `delete ID` borra una solicitud. No existe un panel de administración público.

Antes de publicar, probar el registro real controlado y la recepción en el buzón con autorización; comprobar llamadas y WhatsApp en dispositivo, revisar datos legales, HTTPS y recuperación. Tras activar `SITE_INDEXING=true`, reiniciar, comprobar robots/sitemap/canonical y registrar Search Console. No se han verificado métricas de Ubersuggest ni tráfico real. Rendimiento de campo/INP queda pendiente de tráfico suficiente.
