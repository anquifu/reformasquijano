# Subir la web HTML a Hostinger

## Qué paquete utilizar

`Reformas-Quijano-HTML.zip` contiene los archivos **ya generados**. Dentro se ven `index.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `_astro/`, `images/`, `api/` y las carpetas de cada página. No hace falta compilar nada en Hostinger.

## Hosting adecuado

Usar un **sitio de hosting web PHP/HTML convencional**, con PHP 8.2 o superior. La aplicación Node configurada anteriormente administra sus propios despliegues y puede sobrescribir `public_html`; no se debe mezclar esa integración con una subida manual.

Desde el panel, seleccionar o preparar el sitio PHP/HTML asociado a `reformasquijano.online`. Si el dominio sigue asociado a la app Node, hacer la migración de tipo de sitio con las opciones del plan o con soporte de Hostinger, conservando una copia del despliegue anterior. No borrar el dominio, el buzón ni sus registros DNS para hacer este cambio.

## Subida

1. Abrir el Administrador de archivos del sitio PHP/HTML y entrar en `public_html`.
2. Guardar una copia de los archivos y del `.htaccess` actuales antes de reemplazarlos.
3. Subir y extraer `Reformas-Quijano-HTML.zip` dentro de `public_html`. `index.html` debe quedar directamente en `public_html/index.html`, sin una carpeta `dist` o `reformasquijano` intermedia.
4. Incluir el `.htaccess` del paquete. Revisar y conservar las reglas específicas del hosting que fueran necesarias; eliminar solo reglas antiguas de arranque Node al migrar. No modificar archivos de correo o verificación del dominio.
5. Abrir el dominio y una página de servicios. Comprobar también imágenes, menú, teléfono, WhatsApp y un envío ficticio antes de aceptar solicitudes reales.

No hay archivo de entrada Node, directorio de salida para un servidor ni comando `npm start` en el hosting. Se sirve `index.html`; PHP procesa únicamente el formulario.

## Formulario y almacenamiento

El formulario guarda cada solicitud en `../.quijano-private` (fuera de `public_html`) con permisos privados y usa `mail()` de PHP para notificar a `info@reformasquijano.online`. La carpeta y su secreto se crean automáticamente. El buzón debe existir y el hosting debe permitir el envío desde ese dominio. Si el transporte falla, la solicitud queda guardada para reintento; la entrega al buzón real todavía requiere una prueba en Hostinger.

Si PHP no puede escribir fuera de `public_html`, configurar `RQ_PRIVATE_DIR` con una ruta privada permitida por el hosting. No trasladar las solicitudes a una carpeta pública para resolver un error de permisos.

Los campos opcionales de configuración están en `php/private-config.example.php` del repositorio. Si se necesitan, copiar como `config.php` dentro de `.quijano-private`, nunca dentro de `public_html`.

## Indexación

El paquete `Reformas-Quijano-HTML.zip` está generado con indexación activa: nueve URLs entran en sitemap; privacidad, aviso legal y confirmación siguen sin indexarse. Está preparado para la publicación después de cerrar los pendientes legales y de correo. La compilación local predeterminada mantiene `noindex` para las revisiones. Para reproducir la entrega indexable, generar con `SITE_INDEXING=true npm run build`. Cambiar solo `robots.txt` no basta porque también hay metadatos y cabeceras.

## Comprobaciones

- `/`: 200, título «Reformas en A Coruña» y diseño completo.
- `/reformas-banos-a-coruna/`: 200 con contenido propio.
- `/images/salon-cocina-roble-luz-natural-640.webp`: 200.
- `/pagina-inexistente/`: 404 con el diseño de la web.
- `/api/_lib/app.php`: acceso HTTP denegado.
- `/api/formulario.php`: formulario disponible sin JavaScript.
- Envío ficticio: referencia visible, archivo privado y comprobación del aviso en el buzón.

La versión anterior devolvía 403 porque se publicaba `dist` del servidor como carpeta estática, sin `index.html`. Esta versión sí incluye ese archivo.
