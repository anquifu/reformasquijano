# Validación de la versión de revisión

22 de octubre de 2026. Entorno local Node 24, Astro SSR y Chromium. No se ha publicado el sitio.

| Comprobación | Resultado observado |
|---|---|
| Compilación de producción | Correcta |
| Astro/TypeScript | 0 errores, 0 advertencias |
| Pruebas de datos y backend | 5 aprobadas: token, validación, clasificación, SQLite/idempotencia/límites/borrado y SMTP local con fallo/reintento |
| Rutas/SEO | 12 páginas y 26 destinos internos verificados; sin fallos |
| Indexación | Vista previa noindex y sitemap vacío; servidor local separado con indexación activa probado: 9 rutas candidatas |
| Metadatos y estructura | H1, title, description, canonical, OG, Twitter y JSON-LD comprobados por ruta |
| Estados HTTP | Rutas conocidas 200, desconocidas 404; redirecciones heredadas 301 |
| Formulario en navegador | Registro AJAX 201 y confirmación; registro nativo sin JavaScript y redirección a confirmación |
| Controles | Menú/Escape, FAQ, enlaces tel/WhatsApp y evento local de conversión comprobados; no se hicieron llamadas ni se enviaron WhatsApp |
| Responsive | 1440, 802 y 390 px sin desbordamiento horizontal |
| Axe WCAG 2 A/AA + 2.1 AA | 0 infracciones detectadas en la home a esos tres anchos tras corregir contraste |
| JavaScript/CSP | 0 errores de navegador en la prueba final |
| Dependencias de producción | npm audit: 0 vulnerabilidades reportadas tras actualizar sharp a 0.35.5 |

## Rendimiento

Una ejecución Lighthouse móvil local, con simulación de red/CPU, obtuvo **98/100**, **LCP 2,4 s**, **CLS 0**, **TBT 0 ms**. Informe: `artifacts/lighthouse-mobile.json`. Se tomó antes de los últimos ajustes de contraste y del origen permitido en la API; no es una medición del hosting final ni garantiza resultados con usuarios reales. INP y Core Web Vitals de campo todavía no están medidos.

## Corrección del aviso de dependencias en Hostinger

El escáner señaló `basic-ftp@5.3.1` (CVE-2026-102990, GHSA-c475-qrg2-pj4r). Era una dependencia transitiva de Lighthouse 12.8.2, usada para auditorías locales. Se actualizó Lighthouse a **13.5.0**, fijando la versión en `package.json` y regenerando `package-lock.json`. La cadena nueva ya no instala `basic-ftp`; no se oculta ni se excluye el aviso del escáner.

La auditoría completa, incluyendo desarrollo, pasó de 27 avisos a **0 vulnerabilidades reportadas**. La compilación, la comprobación Astro/TypeScript y las cinco pruebas del backend volvieron a pasar. Hostinger debe desplegar el commit actualizado de `main` e instalar con `npm ci` para usar este árbol de dependencias. Esta corrección resuelve el aviso del paquete; el funcionamiento del dominio requiere comprobar el resultado del despliegue en Hostinger.

## Límites y advertencias

El contenido SEO utiliza los documentos aportados y los servicios confirmados. No se dispone de métricas verificadas de Ubersuggest ni de una investigación de competidores actualizada; no se han presentado volúmenes o posiciones inventadas.

El validador conserva avisos editoriales por títulos cortos en privacidad, aviso legal y confirmación y una descripción de cerrajería de 156 caracteres. Son guías de longitud, no errores técnicos; el ajuste visual de Google depende también del ancho del texto.

La entrega SMTP se ha probado exclusivamente con un receptor local; el correo real y DNS no están configurados. Las solicitudes de navegador son ficticias en una base de pruebas fuera del repositorio. La revisión automática de accesibilidad de la home no certifica todo el sitio ni sustituye pruebas manuales con lector de pantalla. No se han probado Safari/iOS o dispositivos físicos.

La dirección fiscal y el NIF no se han facilitado. Los textos legales son borradores señalados y no indexables. El NAP utiliza únicamente nombre, teléfono y zonas reales confirmadas, sin publicar una dirección inexistente. Ver `DESPLIEGUE.md` antes de cualquier publicación.
