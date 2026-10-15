# PG Asesorías — Migración de WordPress a Next.js + Supabase + Vercel

Este archivo es el brief maestro del proyecto. Léelo completo antes de cualquier tarea.

## Objetivo

Reconstruir **pgasesorias.cl** como una aplicación Next.js propia que sea un **upgrade completo** del sitio WordPress actual:

1. **Misma identidad de marca:** colores, tipografías, logo, tono, estructura de navegación y textos. Un cliente que ya conoce PG debe reconocerlo al instante.
2. **Mejor en todo lo demás:** diseño más pulido y moderno dentro de esa identidad, cero errores de datos, rendimiento excelente, SEO técnico de primer nivel.
3. **Herramientas digitales actuales:** IA para cargar autos y atender clientes, simulador de financiamiento, tasación online, agenda real, analítica de conversiones y publicación en marketplaces (ver "Upgrades").
4. **Panel de administración** (`/admin`) muy superior al actual.

Regla de oro: **la marca se respeta, la experiencia se mejora.** Las capturas de `docs/referencia/` definen la identidad (colores, logo, menú, tono), no un píxel a píxel. Cada vez que mejores algo respecto al sitio actual, anótalo en `docs/MEJORAS.md` para mostrárselo al cliente.

## Stack

- Next.js (última versión estable, App Router, TypeScript estricto, Server Components por defecto)
- Tailwind CSS + shadcn/ui (solo para el panel admin; el sitio público usa componentes propios)
- Supabase: Postgres, Auth, Storage (`@supabase/ssr`)
- Validación: zod + react-hook-form
- Imágenes: `next/image` con `remotePatterns` al dominio de Supabase Storage
- IA: SDK oficial de Anthropic (`@anthropic-ai/sdk`), solo en código de servidor
- Email transaccional: Resend · Errores: Sentry · Anti-spam: Cloudflare Turnstile
- Analítica: Vercel Analytics + Speed Insights, GA4, Meta Pixel + Conversions API
- Deploy: Vercel, conectado al repo de GitHub (cada push a `main` despliega; cada PR genera una URL de vista previa)
- Idioma del sitio: español de Chile (`lang="es-CL"`). Precios en CLP con punto de miles: `$23.990.000`

## Referencias visuales

En `docs/referencia/` hay capturas del sitio actual (desktop y móvil). Úsalas para respetar la identidad: colores de header y footer, logo, orden del menú, estilo de botones y secciones. Puedes mejorar espaciados, jerarquía, animaciones sutiles y diseño responsive, siempre dentro de esa identidad.

## Tokens de diseño (extraídos del CSS real del sitio)

```css
:root {
  /* Marca */
  --pg-orange: #FF9D43;          /* acento: labels, subrayados hover */
  --pg-red: #D33E52;             /* títulos prefijo de sección, fin del degradado */
  --pg-red-dark: #B80000;        /* indicador activo de sliders, hover flechas */
  --pg-red-shadow: #E84B4B;      /* sombra del botón principal */
  --pg-gradient: linear-gradient(90deg, #FF9D43 0%, #D33E52 100%); /* botón principal */

  /* Neutros */
  --pg-ink: #272E32;             /* texto principal y botón secundario */
  --pg-black: #000000;           /* secciones oscuras */
  --pg-white: #FFFFFF;
  --pg-gray: #333333;            /* separadores, íconos */
  --pg-check: #4CAF50;           /* ✓ en listas de equipamiento */

  /* Forma */
  --pg-radius-pill: 40px;        /* todos los botones */
  --pg-radius-card: 20px;        /* tarjetas */
  --pg-shadow-card: 0 18px 40px -10px rgba(0,0,0,.44);
  --pg-shadow-btn: 0 2px 5px -1px #E84B4B;
}
```

Tipografías (Google Fonts vía `next/font/google`):
- **Títulos:** `Anek Bangla`
- **Texto y botones:** `Source Sans 3` (400, 600, 700, 900)

El tema WordPress es Astra y usa variables `--ast-global-color-0..8` cuyo valor no se pudo extraer (header, footer y fondo general). **Tómalos de las capturas** con un cuentagotas y agrégalos a los tokens.

### Patrones de componentes

- **Botón principal:** fondo `--pg-gradient`, texto blanco, Source Sans 3 18px, radio 40px, sombra `--pg-shadow-btn`, ícono a la derecha con 16px de separación. Hover: sin sombra.
- **Botón secundario:** fondo `#272E32`, borde 2px `#272E32`, texto blanco, radio 40px. Hover: fondo blanco, texto `#272E32`.
- **Encabezado de sección:** prefijo en mayúsculas 18px color `#D33E52` → título 40px Anek Bangla → barra separadora de 48–100px × 4px.
- **Tarjeta:** fondo blanco, radio 20px, `--pg-shadow-card`, padding 40px.
- **Secciones:** padding vertical ~100px en desktop, contenido al 80% del ancho con máximo 1400px.
- **Divisores diagonales** entre secciones: SVG `viewBox="0 0 1000 100" preserveAspectRatio="none"` con path `M0,6V0h1000v100L0,6z` (invertido/rotado según la sección), alto 60–85px.
- **Íconos:** Font Awesome 6 (es lo que usa el sitio). Usar `@fortawesome/react-fontawesome` o SVG inline equivalentes.

## Datos de la empresa (constantes en `lib/site.ts`)

- Nombre: PG Asesorías (PG Servicios Automotrices SpA)
- Teléfono / WhatsApp: +56 9 4618 9034 → `56946189034`
- Email: info@pgasesorias.cl
- Instagram: @pgasesorias · TikTok: @pgasesoriaschile
- Horario: Lun – Vie: 9:00 AM – 5:00 PM
- Dirección (para JSON-LD): Av. Apoquindo 6410, oficina 212, Las Condes, Santiago
- Google Maps: https://maps.app.goo.gl/Ci22kWQ3zYajE7148 · Calificación mostrada: 5,0 ★
- Mensaje WhatsApp por defecto: `Hola PG! Necesito un servicio automotriz, me puedes ayudar? 🚗✅✅`
- Logo: `https://pgasesorias.cl/wp-content/uploads/2025/05/cropped-logo-pg-asesorias.webp` (790×568). Descárgalo junto con los íconos SVG de servicios a `public/` durante la fase 1.

## Mapa del sitio y URLs (mantener las mismas para no perder SEO)

| Ruta nueva | Origen WordPress | Notas |
|---|---|---|
| `/` | `/` | Home |
| `/vehiculos-en-venta` | `/vehiculos-en-venta/` | Catálogo con filtros |
| `/vehiculos-en-venta/[slug]` | `/?vehiculo=[slug]` | Ficha. **Mismo slug que WP.** Redirección 301 obligatoria |
| `/servicios` | `/servicios/` | |
| `/nosotros` | `/nosotros/` | |
| `/contacto` | `/contacto/` | |
| `/vende_tu_vehiculo` | `/vende_tu_vehiculo/` | Menú: "Compramos tu Vehículo" |
| `/blog` y `/blog/[slug]` | `/blog/` | Fase posterior |
| `/flota_de_empresas` | `/flota_de_empresas/` | También redirigir `/Flota-Empresarial` y `/flota-empresarial` aquí |
| `/admin/*` | — | Panel privado, `noindex` |

Redirecciones 301 adicionales: `/?post_type=vehiculo` → `/vehiculos-en-venta`. La redirección `?vehiculo=slug` debe hacerse en el middleware/proxy de Next (según la versión instalada) para que el destino quede **sin** el query param.

## Header (todas las páginas)

Logo a la izquierda (enlaza a `/`). Menú en este orden (ortografía corregida respecto al sitio actual):
`Inicio` · `Vehículos en venta` · `Servicios Automotrices` · `Nosotros` · `Contacto` · `Compramos tu Vehículo` · `Blog` · `Flota de Empresas`.
Íconos sociales: Instagram, WhatsApp, TikTok. Header fijo (sticky) que se compacta al hacer scroll. En móvil, menú hamburguesa a pantalla completa y una barra inferior fija con "WhatsApp" y "Ver autos".

## Home — secciones en orden

1. **Hero:** prefijo "BIENVENIDO A PG ASESORÍAS", H1 "Servicios Automotrices", párrafo "Compra, vende o repara tu vehículo con total confianza…" (con enlaces en Compra/vende/repara), botones "Vehículos en venta" (→ catálogo) y "Agendar Servicio Automotriz" (→ WhatsApp).
2. **Feed de Instagram** (ver nota de Instagram más abajo).
3. **¿Quieres agendar un Servicio Automotriz?** — texto + 4 pasos: Reserva a través de la web / Selecciona el servicio / Confirma tu cita / Recibe atención profesional. Botón principal.
4. **Contadores:** Vehículos vendidos con éxito · Servicios automotrices realizados · Clientes satisfechos · Servicios especializados. Animación de conteo al entrar en pantalla. Los valores no se pudieron leer del sitio: déjalos en `lib/site.ts` con `TODO`.
5. **SERVICIOS AUTOMOTRICES / ¿En qué te podemos ayudar?** — 8 servicios: Consignación Virtual, Inspección Pre-compra, Mantención automotriz, Traslado Revisión Técnica, Desabolladura-pintura, Mecánica General Automotriz, Diagnóstico Automotriz – Repros, Otros Servicios Automotrices. Mantener los textos del sitio actual, corrigiendo ortografía. Botón "Nuestros servicios automotrices".
6. **Banner** "Compramos tu vehículo" (imagen enlazada a `/vende_tu_vehiculo`).
7. **SOBRE NOSOTROS** — imagen del taller + "PG Asesorías: liderazgo en soluciones automotrices en Chile" + texto + check "Asesoría automotriz experta en Santiago…" + botón secundario "Conoce más sobre nosotros".
8. **Vehículos en venta** — 3 tarjetas, paginación, botón "Ver catálogo completo". Datos desde Supabase.
9. **CONTACTO / ¡Escríbenos o agenda tu servicio automotriz!** — 5 canales: Teléfono, WhatsApp, Instagram, TikTok, Correo.
10. **Footer** (todas las páginas): logo, tagline "PG Asesorías - Compra/venta de autos usados verificados en Santiago ✓ Asesoría técnica experta ✓ …", columna Contacto (teléfono, email, ubicación, horario), íconos sociales, columna "Contenido" con enlaces, mapa de Google embebido, tarjeta de reseñas Google 5,0, "Copyright © {año} pgasesorias.cl".

No incluir el carrito de SureCart que aparece al pie del sitio actual: es un residuo de plugin.

## Tarjeta de vehículo (catálogo y home)

Foto (relación 4:3, `object-cover`) → precio grande → título enlazado (H2/H3) → fila de íconos: año, combustible, transmisión, kilometraje (`145.000 km`) → botón "Detalles" con flecha.
Si hay `precio_oferta`, la tarjeta muestra **el precio de oferta** y el precio normal tachado (hoy el sitio es inconsistente: la home muestra uno y el catálogo otro; no replicar ese bug). Badge "Reservado" o "Vendido" según estado.

## Catálogo `/vehiculos-en-venta`

H1 "Vehículos en venta". Filtros con conteo: MARCA (select), ESTADO DEL VEHICULO (Seminuevo/Usado), AÑO. Agregar además: búsqueda por texto, rango de precio, transmisión, combustible y orden (recientes / precio ↑↓ / km). Filtros en la URL (`?marca=toyota&anio=2018`) para que sean compartibles e indexables. Render en servidor.

## Ficha `/vehiculos-en-venta/[slug]`

1. Galería: carrusel con miniaturas + lightbox a pantalla completa con swipe en móvil.
2. Ubicación con ícono de pin ("Santiago, Chile").
3. H1 = título del vehículo.
4. Año · km · combustible · transmisión.
5. Precio: si hay oferta, "Antes" con el precio tachado y "Precio Oferta" destacado; si no, solo "Precio".
6. Botones: **WhatsApp** (mensaje prellenado: `Hola PG! Me interesa el {titulo} publicado en {url}`) y **Cotizar** (→ `/contacto?vehiculo={slug}`).
7. Sección **General**: año, combustible, transmisión, km, tracción, puertas (con íconos).
8. Sección **Equipamiento** y **Seguridad**: listas con ✓ verde `#4CAF50`.
9. Descripción libre (nueva; el sitio actual no la tiene).
10. "Otros vehículos en venta" (excluye el actual), priorizando similares en precio y tipo.
11. Bloque de servicios + navegación vehículo anterior/siguiente.

SEO por ficha: `generateMetadata` con título, descripción armada desde los datos, `og:image` = foto de portada (hoy todas usan el logo), canonical, JSON-LD `Car` con `offers` en CLP. Usar ISR/`revalidatePath` al guardar desde el admin.

## Modelo de datos

El esquema está en `supabase/schema.sql` (base) y `supabase/upgrades.sql` (tablas de los upgrades: carrocería, informes de inspección, configuración, agenda, tasaciones, eventos). Resumen:
- `vehiculos`: datos de la ficha. Campos espejo de los 15 campos ACF actuales, pero tipados (números como `int`, listas como `text[]`).
- `vehiculo_fotos`: fotos ordenadas; `orden = 0` es la portada.
- `opciones_equipamiento`: catálogo de opciones de equipamiento/seguridad (slug + etiqueta), editable.
- `consultas`: leads desde el formulario de contacto/cotizar.
- `admin_users`: quién puede entrar al panel.

### Título SEO automático (`lib/titulo.ts`)

Formato actual del sitio, que debe mantenerse:
`{Marca} {Modelo} {Versión} {Motor} {Automático|Mecánico} {N} Puertas, Tracción {4x2|4x4}, Año {AAAA}`
Ejemplo: `Toyota 4Runner Limited V6 4.0 Automático 5 Puertas, Tracción 4X4, Año 2018`.
El admin ve el título generado en vivo y puede editarlo a mano. El slug se genera del título (sin tildes, minúsculas, guiones) y no cambia al editar un vehículo ya publicado.

## Panel de administración `/admin` (la parte a mejorar)

Acceso con Supabase Auth (email + contraseña o magic link). Solo usuarios presentes en `admin_users`. Todas las rutas `/admin` protegidas en servidor y con `robots: noindex`.

Requisitos:
- **Lista de vehículos:** tabla/tarjetas con foto, título, precio, estado, fecha. Filtros por estado. Acciones rápidas: editar, duplicar, marcar reservado/vendido, despublicar, eliminar (con confirmación).
- **Formulario crear/editar** en secciones: Datos básicos → Precio → Ficha técnica → Equipamiento y seguridad (chips/checkbox desde `opciones_equipamiento`) → Fotos → Descripción → Publicación.
- **Fotos:** arrastrar y soltar varias a la vez, también desde la cámara del celular. Compresión en el navegador antes de subir (máx. 1920px, WebP, ~80%). Barra de progreso por foto. Reordenar arrastrando. La primera es la portada. Eliminar foto individual.
- **Validación** con zod y mensajes claros en español. Coherencia: precio de oferta menor al precio; año entre 1950 y el año siguiente; km ≥ 0.
- **Precio** con formato CLP mientras se escribe.
- **Vista previa** de la tarjeta y de la ficha antes de publicar.
- Guardar como borrador o publicar. Al guardar: `revalidatePath` de home, catálogo y ficha.
- **Mobile-first:** Pablo sube autos desde el teléfono. Todo el flujo debe ser cómodo en 375px.
- **Consultas:** bandeja con los leads de contacto/cotizar, marcar como atendida.
- Meta: un vehículo completo con 12 fotos en menos de 2 minutos.

## Upgrades: herramientas digitales nuevas

Ordenadas por impacto en el negocio. Las de **v1** salen en el lanzamiento; las de **v2** van después, una por una.

### v1 — en el lanzamiento

1. **Carga de vehículos asistida por IA (admin).** Pablo sube las fotos y escribe o dicta en una frase lo que sabe ("Toyota 4Runner Limited 2018, 145 mil km, bencinero, automático, 4x4, 23.990.000"). Un endpoint de servidor llama a la API de Claude (`claude-haiku-5-5` para extracción estructurada; `claude-sonnet-5-5` para redacción) y devuelve: campos de la ficha prellenados, equipamiento detectado en las fotos, una descripción comercial en el tono de PG y advertencias de coherencia ("el título dice diésel y marcaste gasolina"). Pablo revisa y publica. La clave `ANTHROPIC_API_KEY` vive solo en el servidor.
2. **Validación de coherencia** en el formulario y al guardar: título vs. campos, año plausible, precio de oferta menor al precio, km razonable para el año. Los errores de hoy no pueden volver a pasar.
3. **Simulador de financiamiento** en cada ficha: pie (por defecto 40%, que es lo que PG exige hoy), plazo, tasa referencial editable desde el admin, cuota estimada y requisitos (3 liquidaciones, 12 cotizaciones AFP). Botón "Quiero este financiamiento" → crea un lead con la simulación adjunta. Texto legal: valores referenciales, sujetos a evaluación.
4. **"Revisado por PG":** cada auto puede tener su informe de inspección (PDF o checklist) subido desde el admin. Se muestra como sello en la tarjeta y como sección en la ficha. Es el gran diferenciador de PG frente a un portal genérico.
5. **Leads registrados, no perdidos:** todo contacto (formulario, cotizar, financiamiento, tasación, clic en WhatsApp) queda en la tabla `consultas` con el auto y la página de origen. Aviso por email a PG en cada lead nuevo (Resend).
6. **Tasación online en "Compramos tu Vehículo":** formulario por pasos (patente, marca/modelo/año, km, fotos, precio esperado) con subida de fotos al Storage. Crea un lead completo.
7. **Agenda real de servicios:** el cliente elige servicio, fecha y bloque horario disponible; PG confirma desde el admin. Mantener WhatsApp como alternativa, no como única vía.
8. **Búsqueda inteligente** en el catálogo: además de filtros, una caja que entiende lenguaje natural ("SUV diésel bajo 15 millones", "automático para la familia") y la traduce a filtros con la API de Claude. Resultado siempre son filtros visibles y editables.
9. **Analítica de conversiones:** Vercel Analytics + Speed Insights, GA4 con eventos (clic WhatsApp, envío de formulario, uso del simulador, vista de ficha) y Meta Pixel con Conversions API para las campañas de Instagram. Banner de consentimiento de cookies.
10. **SEO técnico:** URLs limpias, sitemap dinámico, JSON-LD (`AutoDealer`, `Car`, `Offer`, `BreadcrumbList`), imágenes OG generadas con `next/og` mostrando foto + precio + logo, páginas por marca (`/vehiculos-en-venta/marca/toyota`).
11. **Protección y monitoreo:** Cloudflare Turnstile en formularios, límite por IP, Sentry para errores, página 404 útil con buscador.
12. **Admin instalable (PWA):** el panel se instala como app en el celular de Pablo, con acceso a la cámara para fotos.

### v2 — después del lanzamiento

13. **Asistente de chat en el sitio:** responde preguntas sobre el inventario real (consulta Supabase vía herramientas), explica servicios, agenda y deriva a WhatsApp con el contexto de la conversación. Siempre aclara que es un asistente virtual.
14. **Publicación multicanal desde el admin:** un botón genera el post para Instagram (carrusel con plantilla PG + texto con hashtags) y el feed de inventario para Facebook Marketplace / Meta Catalog y Google Vehicle Ads.
15. **Dashboard de negocio en el admin:** vistas por auto, leads por auto, días en inventario, tasa de conversión por canal.
16. **Favoritos, comparador y alertas:** el visitante guarda autos, compara hasta 3 lado a lado y deja una alerta ("avísame si llega una Hilux bajo 20 millones") que dispara un email cuando se publica uno que calza.
17. **Video en la galería:** subir los reels del auto a la ficha.
18. **Instagram Graph API** para el feed real de la home.
19. **Portal de flota para empresas:** cada empresa ve el historial de mantenciones de sus vehículos y descarga informes.

Registra cada upgrade terminado en `docs/MEJORAS.md` (qué hace, por qué importa para el negocio, cómo se usa) para presentárselo a PG.

## Seguridad

- Nunca commitear claves. `.env.local` en `.gitignore`. La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en scripts locales o en código de servidor, jamás en el cliente.
- RLS activo en todas las tablas (ver schema).
- Las escrituras del admin pasan por Server Actions que verifican sesión y pertenencia a `admin_users`.
- Formulario público de contacto: honeypot + límite por IP.

## Bugs del sitio actual que NO se deben replicar

Detectados al revisar los datos de WordPress (el script de migración los reporta):
- Peugeot 3008: el campo año guarda "2026" pero la tarjeta muestra **1970** (el campo ACF es tipo fecha). Además el año 2026 parece un error de carga; confirmar con el dueño.
- Maxus T60: el título dice "Diésel … Mecánico" pero los campos dicen Gasolina / Automática.
- Peugeot Landtrek: el título dice "Automático" pero el campo dice Manual.
- Precio mostrado distinto entre home y catálogo para el mismo auto.
- Todas las fichas comparten la misma `og:image` (el logo).
- Botón "dETALLES" y títulos "cONTACTO", "fLOTA PARA EMPRESAS" con mayúsculas invertidas: corregir.
- URLs de vehículos con query (`/?vehiculo=...`): pasar a rutas limpias con 301.
- Enlaces inconsistentes a Flota (`/flota_de_empresas`, `/Flota-Empresarial`, `/flota-empresarial`): una sola URL.
- La página de Flota usa imágenes enlazadas desde sitios ajenos (infocampo, grupopana, gstatic, etc.): riesgo legal y de caída. Reemplazar por fotos propias o de bancos con licencia, alojadas en Storage.
- Feed de Instagram mostrando imágenes placeholder.
- Contadores de la home sin números visibles.
- Residuos de plugins (carrito SureCart vacío en todas las páginas).
- Contacto y agenda dependen 100% de WhatsApp: no queda registro de los leads.
- Ortografía en textos: "Whatssap", "Revisón", "Vehiculos" sin tilde en títulos. Corregir en todo el sitio.

## Instagram

El sitio usa el plugin Smash Balloon y hoy muestra imágenes placeholder. En la v1, mostrar una grilla estática con las últimas publicaciones enlazadas (imágenes subidas a Storage) y botón "Seguir en Instagram". En una fase posterior se puede conectar la Instagram Graph API.

## Forma de trabajo

- Trabaja por fases (ver `PROMPTS.md`). Al terminar cada fase: `npm run build` sin errores, `npm run lint` limpio, commit con mensaje descriptivo.
- Revisa cada página contra su captura de referencia (identidad de marca) y contra la lista de "Bugs del sitio actual" antes de darla por terminada.
- Lighthouse objetivo en móvil: Performance ≥ 90, SEO 100, Accesibilidad ≥ 95.
- No agregues dependencias pesadas sin necesidad.
