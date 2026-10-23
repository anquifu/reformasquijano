# Revisión visual

Fecha: 22 de octubre de 2026. Resultado visual: **passed** para la adaptación responsive de la propuesta elegida; no es una reproducción píxel a píxel del boceto.

Referencia: `/workspace/generated_images/exec-da215336-ed40-4c53-bc77-2999ae295273.png`.
Renderizados inspeccionados: `artifacts/screenshots/home-1440.png`, `home-802.png` y `home-390.png`.

Se conserva cabecera blanca, logotipo tipográfico, teléfono visible, fotografía de interior a todo el ancho, título superpuesto, degradado oscuro, llamadas a presupuesto/WhatsApp, tarjetas azul claro y formulario azul marino. La fotografía generada está identificada como ilustrativa. Los iconos proceden de Phosphor, no de emoji.

En 802 px los servicios se distribuyen en dos columnas; en escritorio, en tres. En 390 px, botones apilados, campos a una columna y barra inferior de contacto. No se detectó desbordamiento horizontal. La barra fija aparece a la altura del viewport inicial en las capturas de página completa; permanece anclada al fondo de la pantalla al navegar.

Cambios justificados respecto al boceto: galería retirada por falta de proyectos verificados y sustituida por el proceso; formulario ampliado conforme a los requisitos posteriores; controles de 48–50 px y más espacio vertical para lectura; teléfono y correo separados; cobertura sin oficinas inventadas. Texto y campos se mantienen como HTML real, no incrustados en la imagen.

Correcciones durante QA: JavaScript externo para respetar CSP; tono verde más oscuro para el contraste en fondos claros. Verificación automatizada WCAG A/AA en tres tamaños, complementada con inspección visual. Esto no equivale a una certificación de accesibilidad ni reemplaza una revisión completa con tecnologías de apoyo.

La aprobación visual no implica preparación legal u operativa para publicar: ver `docs/DESPLIEGUE.md`.

## Revalidación HTML + PHP — 23 de octubre de 2026

Resultado: **passed** en renderizado local. Se volvieron a capturar las páginas a 1440, 802 y 390 px sobre la entrega HTML. El diseño, las fotos, la tipografía y los CTA se conservan. Sin overflow ni infracciones detectadas por Axe en la home. El formulario se probó con AJAX y mediante el enlace PHP para navegación sin JavaScript. La verificación pública en Hostinger sigue pendiente de subir/configurar el hosting PHP.


## Versión HTML sencilla — 23 de octubre de 2026

Resultado local: **passed**. Se sustituye el formulario por un panel con llamadas y WhatsApp, conservando hero a todo el ancho, fotografía, tipografía, colores y páginas de servicios. Se inspeccionaron las capturas de escritorio (1440 px) y móvil (390 px), además de la verificación automatizada a 802 px. No hay desbordamiento ni infracciones Axe A/AA detectadas en la home. El contacto también está disponible sin JavaScript. No se han realizado llamadas ni enviado mensajes de prueba.
