# Reformas Quijano — HTML + PHP

Web de servicios locales lista para un **hosting web convencional de Hostinger con PHP 8.2 o superior**. Cada URL tiene su propio HTML. El servidor no necesita Node, npm, Astro ni un proceso persistente.

## Publicación sencilla

El paquete para subir contiene `index.html` en su raíz, las carpetas de servicios, estilos, imágenes, `api/` con el formulario PHP y `.htaccess` con redirecciones y cabeceras. Extraer **su contenido dentro de `public_html`** de un sitio de hosting web PHP. No subir el repositorio completo ni colocar el ZIP sin extraer. Ver [HOSTINGER.md](docs/HOSTINGER.md).

El diseño y las páginas se pueden ver incluso sin PHP; el envío de presupuestos necesita PHP. El registro se guarda fuera de `public_html`, en `.quijano-private`. Las notificaciones usan el transporte de correo PHP del hosting; hay que comprobar la entrega al buzón real. El código nunca afirma que un correo haya llegado.

## Edición y generación

Astro se utiliza únicamente como generador durante el desarrollo. El resultado entregado es HTML, CSS, JavaScript e imágenes normales. Node 24 se requiere solo en la máquina que genera los archivos:

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

La salida es `dist/`, con un `index.html` real en la raíz. La versión de revisión tiene `noindex`; para generar la versión indexable después de revisar los datos legales y probar contacto:

```sh
SITE_INDEXING=true ASTRO_TELEMETRY_DISABLED=1 npm run build
```

No son dos sitios distintos: el contenido, las rutas y el diseño son los mismos. Cambia la indexación y la nota de prueba. Nunca dejar `SITE_INDEXING=false` en una publicación destinada a posicionarse.

## Pruebas locales

Instalar PHP 8.2+; `PHP_BIN` permite indicar su ejecutable. No se necesita MySQL ni SQLite.

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run check
npm run build
npm test
npm start
# Con el servidor PHP local iniciado en 127.0.0.1:4321:
npm run test:web
npm run test:browser
```

`npm test` arranca PHP en un puerto temporal, usa solicitudes ficticias y captura los avisos de correo localmente; no envía correo real. Las pruebas de navegador necesitan Chromium y deben utilizar un almacenamiento de prueba separado (`RQ_PRIVATE_DIR`) y `RQ_MAIL_ENABLED=0`. `npm run dev` sirve para editar el aspecto con Astro; para probar los formularios, compilar y usar `npm start`.

## Documentación

- [Subir a Hostinger](docs/HOSTINGER.md)
- [Mapa SEO y URLs](SEO_MAP.md)
- [Arquitectura e inventario](docs/ARQUITECTURA.md)
- [Despliegue, correo y privacidad](docs/DESPLIEGUE.md)
- [Validación](docs/VALIDACION.md)
- [Auditoría de materiales aportados](docs/AUDITORIA_INSUMOS.md)

La antigua implementación con servidor Node está conservada en el historial de Git hasta `74ab18f`. Las instrucciones actuales sustituyen sus pasos de despliegue.
