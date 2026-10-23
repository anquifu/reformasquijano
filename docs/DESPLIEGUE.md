# Publicación y operación

Esta versión sustituye el despliegue Node por HTML + PHP en hosting web convencional. Ver `HOSTINGER.md` para la subida. Se conserva el diseño corporativo, el hero completo, los enlaces de contacto y las URLs existentes.

## Pendientes reales

- Asignar el dominio al sitio PHP/HTML y subir el paquete. No se ha realizado esta operación desde Codex: no hay acceso al panel autenticado.
- Crear/verificar el buzón `info@reformasquijano.online`, la configuración de envío PHP del hosting y SPF/DKIM/DMARC con su proveedor. Las pruebas locales capturan el correo y no verifican la recepción real.
- Completar la revisión legal: titular facilitada Andrea Quijano; dirección legal e identificación fiscal pendientes. No se publica ningún NIF ni dirección inventados. La preferencia por privacidad debe resolverse con una forma legalmente válida antes de publicar la versión definitiva.
- Confirmar conservación y proveedores. Treinta días es la configuración técnica provisional; el buzón y las copias requieren una política propia. La purga de archivos no borra los emails.
- Resolver la excepción de `/cerrajeria/` documentada en `SEO_MAP.md` antes de cualquier cambio de slug.
- Activar indexación tras esas comprobaciones y registrar el sitemap en Search Console. No se prometen posiciones ni métricas SEO que no se hayan medido.

## Operación privada

El almacenamiento se crea como `.quijano-private` junto a `public_html`, no dentro. Restringir su acceso al usuario PHP y conservar una copia cifrada. La web no necesita bases de datos ni credenciales SMTP en archivos públicos.

El comando de administración está en el repositorio, no en el ZIP público. Para usarlo en el hosting, conservar una copia del proyecto fuera de `public_html` y señalar `RQ_PRIVATE_DIR` a la carpeta real:

```sh
RQ_PRIVATE_DIR=/ruta/privada/.quijano-private php scripts/leads.php list
RQ_PRIVATE_DIR=/ruta/privada/.quijano-private php scripts/leads.php purge
RQ_PRIVATE_DIR=/ruta/privada/.quijano-private php scripts/leads.php retry
```

`show ID` muestra datos personales en terminal autorizada; `delete ID` borra una solicitud. `list` muestra referencia, fecha, clasificación y estado de correo, sin datos de contacto.

Programar `purge` diariamente y `retry` cada cinco minutos. El comando necesita la copia compilada `dist/api/_lib` del proyecto privado. No subir el administrador a una ruta accesible por HTTP. Las solicitudes no se pierden al actualizar los HTML porque el almacenamiento queda fuera de `public_html`.

## SEO y rendimiento

Cada URL entrega su contenido en HTML: title, H1, primer párrafo, metadescripción, canonical, Open Graph, Twitter, datos estructurados y enlaces internos. Las redirecciones conservan las URLs antiguas. No hay páginas repetidas por municipio ni una SPA vacía que dependa de JavaScript.

La versión anterior con Astro SSR también era rastreable; no era una limitación SEO. El cambio reduce los requisitos operativos del hosting. Un 403 sí impide el rastreo, por lo que la validación pública del despliegue es un paso necesario. Tras activar indexación, comprobar status 200, robots, sitemap y canonical antes de solicitar indexación.
