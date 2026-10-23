# Hostinger: ejecutar la aplicación como servidor Node

El 23 de octubre de 2026 se comprobó el dominio público:

| URL | Respuesta |
|---|---|
| `/` | 403, página de Hostinger |
| `/robots.txt` | 404, página de Hostinger |
| `/images/salon-cocina-roble-luz-natural-640.webp` | 404 |
| `/client/images/salon-cocina-roble-luz-natural-640.webp` | 200, WebP |
| `/reformas-banos-a-coruna/` | 404 |

Esto muestra que Hostinger está exponiendo los archivos de `dist` directamente, sin que estas rutas lleguen al servidor Astro. `dist` contiene `client` y `server`, no un `index.html`: es una compilación SSR. Un despliegue marcado como completado no demuestra que el proceso Node y el enrutamiento HTTP estén activos.

## Configuración de la aplicación existente

En **Configuración y redistribución**, mantener Node 24, raíz `./` y rama `main`. Configurar:

- Instalación: `npm ci`.
- Compilación: `npm run build`.
- Directorio de salida: `dist`.
- Archivo de entrada del servidor, desde la raíz del proyecto: `dist/server/entry.mjs`.
- Si aparece un comando de inicio: `npm start`.
- `HOST=0.0.0.0`; utilizar el puerto asignado por Hostinger, sin imponer el puerto local 4321.

Si el preajuste Astro solo permite publicar archivos estáticos o no muestra el archivo de entrada, elegir **Other / Otro** para declarar explícitamente la aplicación Node. Hostinger documenta este preajuste y su campo Entry file. No cambiar el proyecto a salida estática: el formulario y las páginas dependen del servidor.

`package.json` declara también `main: dist/server/entry.mjs`. Esto identifica la entrada para herramientas que consultan ese campo, pero no reemplaza una selección incorrecta del modo de despliegue en el panel.

Si aparece «La cuenta de GitHub no coincide», conectar la cuenta con acceso a `anquifu/reformasquijano` antes de redistribuir. Un despliegue correcto de servidor debe mostrar un proceso en ejecución y registros de arranque.

## Comprobación después de redistribuir

1. La home debe devolver 200 y mostrar «Reformas en A Coruña».
2. Las imágenes deben cargar en `/images/...` y el CSS en `/_astro/...`.
3. `/robots.txt` debe responder con el contenido de la aplicación; en revisión, `Disallow: /`.
4. Las páginas de servicios deben devolver 200; una ruta inexistente, el 404 diseñado de la web.

Si el proceso Node está en ejecución pero sigue el 403, comprobar con Hostinger el enrutamiento generado en `public_html/.htaccess` hacia `hbuilds/current/nodejs`. La documentación indica que una redistribución regenera ese archivo. No añadir reglas genéricas a ciegas ni modificar permisos globales.

La base SQLite necesita una ubicación privada persistente fuera de los directorios de versiones que Hostinger elimina al redistribuir. Mantener la revisión con datos ficticios hasta configurar almacenamiento, correo y textos legales; consultar `DESPLIEGUE.md`.

Fuente: [Guía oficial de despliegue Node.js en Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), consultada el 23 de octubre de 2026.
