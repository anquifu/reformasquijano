# Reformas Quijano — web HTML

Web estática con contacto por llamada y WhatsApp al **602 089 887**. Mantiene el diseño aprobado y las páginas de servicios para SEO local.

## Subir la web

El archivo **Reformas-Quijano-SENCILLA.zip** contiene la web terminada. En un sitio de hosting web convencional, extraer su contenido dentro de `public_html`. Debe quedar `public_html/index.html` directamente, junto a las carpetas de estilos, imágenes y páginas. Ver [HOSTINGER.md](docs/HOSTINGER.md).

No necesita ejecutar Node, PHP, instalar paquetes, configurar correo ni crear bases de datos en el alojamiento. Los botones abren una llamada o WhatsApp; abrir WhatsApp no envía automáticamente el mensaje. No hay formulario ni almacenamiento de solicitudes.

## Editar y generar los archivos

Astro se utiliza únicamente como herramienta de desarrollo para mantener componentes y contenido común. El resultado es HTML, CSS, JavaScript e imágenes normales. Node 24 solo es necesario en la máquina de desarrollo:

```sh
npm ci
npm run dev
```

Para generar la entrega indexable y comprobarla:

```sh
SITE_INDEXING=true ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run check
npm test
npm start
# En otra terminal:
EXPECT_INDEXING=true npm run test:web
npm run test:browser
```

`npm start` ofrece una vista previa local; no se utiliza en Hostinger. Las pruebas de navegador necesitan Chromium (`CHROMIUM_PATH` permite indicar su ruta). La compilación predeterminada es de revisión, con `noindex`. La entrega ZIP se genera con indexación activa. Las páginas legales siguen marcadas como borrador hasta completar los datos y su revisión.

## Referencias

- [Mapa SEO y URLs](SEO_MAP.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Estado de publicación](docs/DESPLIEGUE.md)
- [Validación](docs/VALIDACION.md)

Las implementaciones anteriores con servidor Node y formularios PHP se conservan únicamente en el historial de Git.
