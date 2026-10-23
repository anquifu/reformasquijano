# Auditoría de insumos y decisiones de desarrollo

Fecha: 22/10/2026. Antes de escribir la aplicación se han revisado el repositorio vacío, los seis Markdown aportados, el encargo SEO inicial, el nuevo encargo de desarrollo, el Excel provisional, su informe y los datos de contacto confirmados.

## Fuentes y reglas aplicadas

| Documento | Aplicación |
|---|---|
| Enlaces y recursos · Transactional Keywords | Intenciones comerciales. Los enlaces a DataWise y TopSEOFactors son referencias, no datos consultados ni herramientas conectadas. |
| Enlaces y recursos · Informational Keywords | No contiene recursos externos ni métricas. No inventar contenido de una lección ausente. |
| Enlaces y recursos · Onsite Local SEO | No contiene recursos externos. Las reglas se obtienen del encargo y de los datos reales facilitados. |
| Title y meta description - Prompts - espanol.md | Metadatos únicos, naturales y veraces. Aplicar la guía más reciente: títulos preferentemente 45–60 caracteres y descripciones 140–155. No son límites absolutos de Google. Los ejemplos JSON son plantillas, no instrucciones para sustituir la entrega. |
| Image SEO - Prompts - espanol.md | Nombres descriptivos, minúsculas y guiones; WebP; alt literal, sin atribuir una localización o autoría no acreditada. No insertar keywords artificiales. |
| Generator Prompts - espanol.md | Tono claro, mapa de páginas, hechos comprobados, alcance preciso, sin experiencia, precios o credenciales inventados. Sus entrevistas no se ejecutan como un nuevo encargo. |
| SEO_Reformas_A_Coruna_PROVISIONAL.xlsx | 101 candidatos, sin métricas reales de Ubersuggest. Agrupación provisional, no investigación validada de demanda ni SERP. |
| Informe_SEO_PROVISIONAL.md | Pisos e integrales agrupados; precios y proyectos solo con datos reales. Sus dudas sobre nombre, horario y cobertura quedan sustituidas por respuestas posteriores. |
| Datos_NAP_y_contacto.md y respuestas posteriores | Reformas Quijano; atención a domicilio; 602 089 887; llamadas/WhatsApp; 14 municipios; horario conocido. Dominio reformasquijano.online, correo info@reformasquijano.online y titular Andrea Quijano aportados después. NIF no facilitado: no incluirlo. |
| Maqueta aprobada | `/workspace/generated_images/exec-da215336-ed40-4c53-bc77-2999ae295273.png`. Banner fotográfico full width, H1 sobre la imagen, azul marino/teal, seis servicios y contacto destacado. |
| Encargo de desarrollo | HTML inicial indexable, backend real, validación/spam, SEO automatizado, documentos y compilación. Prohibida publicación en producción sin autorización. |

## Resolución de conflictos

- La arquitectura anterior **no estaba validada con Ubersuggest**. Se conserva la agrupación de intenciones, actualizando los slugs de servicios con A Coruña conforme al nuevo encargo. Las URLs anteriores tendrán 301 y no aparecerán en el sitemap.
- No crear otra landing de integrales además de pisos; no afirmar servicio llave en mano. Locales, portales y cambio independiente de bañera quedan pendientes de confirmar, no se publican.
- No hay proyectos acreditados: omitir portfolio de obras realizadas. La imagen hero es generada e identificada como ilustrativa; no prueba experiencia.
- Sin costes reales: explicar factores y alcance en cada servicio, sin precios inventados ni landing de precios vacía.
- Cobertura facilitada: A Coruña, Oleiros, Culleredo, Cambre, Arteixo, Sada, Bergondo, Carral, Betanzos, Abegondo, A Laracha, Miño, Carballo, Ordes. No generar 14 páginas de texto sustituido. La prioridad municipal pertenece al usuario, no a una medición.
- `/cerrajeria/` se conserva expresamente durante desarrollo. Propuesta comunicada: `/cerrajero-a-coruna/` con 301 desde la anterior, sujeta a decisión antes de publicar. Excepción registrada en SEO_MAP y comprobador; no cambio silencioso.
- Home `/` y páginas utilitarias son excepciones semánticas a keyword literal en slug. Los servicios normalizan preposiciones/tildes según los ejemplos del encargo; el contenido usa español natural.
- Usuario no atiende en un local: no inventar dirección. Organization + WebSite + Service + BreadcrumbList; no marcar LocalBusiness con una dirección falsa ni afirmar elegibilidad de rich results. FAQ visible, sin marcado redundante necesario.
- Hora de apertura del sábado a las 10:00 interpretada de la franja matinal; cierre 14:00 confirmado. Domingos y festivos no anunciados.
- NIF privado y no disponible; aviso legal/privacidad serán borradores explícitos y noindex hasta revisión. No se publicará una web legalmente completa por inferencia.

## Límites vigentes

Faltan hosting, credenciales SMTP, revisión legal y decisión final del slug de cerrajería. Se continúa con servidor Node, persistencia local y pruebas SMTP aisladas. Sin despliegue, mensajes reales ni modificaciones de Google Business Profile. No hay métricas SEO reales ni prueba de resultados orgánicos.

## Actualización de arquitectura — 23 de octubre de 2026

A petición del usuario se sustituye el servidor Node por páginas HTML generadas y un procesador PHP para hosting web convencional. La mención a Node/SMTP del diagnóstico inicial es histórica: las instrucciones vigentes están en `ARQUITECTURA.md`, `HOSTINGER.md` y `DESPLIEGUE.md`. Se mantienen pendientes la entrega real de correo y la revisión legal; no se añaden datos de negocio ni métricas SEO inventados.
