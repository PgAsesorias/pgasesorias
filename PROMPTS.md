# Guía paso a paso con Claude Code

Cada fase es un prompt para copiar y pegar en Claude Code. No pases a la siguiente hasta que la anterior funcione y esté en GitHub.

---

## Fase 0 — Preparación (tú, ~30 min, una sola vez)

1. **GitHub:** crea un repo privado vacío, por ejemplo `pgasesorias-web`.
2. **Supabase:** crea un proyecto (región São Paulo, la más cercana a Chile). Guarda la contraseña de la base.
   - SQL Editor → pega y ejecuta `supabase/schema.sql` completo, y luego `supabase/upgrades.sql`.
   - Authentication → Users → crea el usuario de Pablo (y el tuyo).
   - SQL Editor → ejecuta el `insert into public.admin_users ...` del final del schema con cada correo.
   - Project Settings → API → copia `Project URL`, `anon key` y `service_role key`.
3. **Vercel:** cuenta conectada a tu GitHub (el proyecto se importa en la fase 8).
4. **Cuentas para los upgrades** (todas tienen plan gratuito o de bajo costo para empezar):
   - Anthropic Console (console.anthropic.com) → API key para la IA del admin y el buscador.
   - Resend (resend.com) → API key y verificación del dominio pgasesorias.cl para enviar avisos de leads.
   - Cloudflare Turnstile → site key y secret key (anti-spam de formularios).
   - Sentry → proyecto Next.js (monitoreo de errores).
   - Google Analytics 4 y Meta (Pixel + token de Conversions API) si van a correr campañas.
5. **Carpeta local:** clona el repo, copia dentro el contenido de este kit (`CLAUDE.md`, `PROMPTS.md`, `supabase/`, `scripts/`, `.env.example`, `docs/`).
6. Copia `.env.example` a `.env.local` y completa las claves.
7. **Capturas de referencia** en `docs/referencia/` (ver `docs/referencia/LEEME.md`). Con ellas Claude Code respeta la identidad de marca (colores, logo, menú).
8. Abre la terminal en la carpeta y ejecuta `claude`.

---

## Fase 1 — Proyecto base, diseño y layout

```
Lee CLAUDE.md completo y las capturas en docs/referencia/.

Crea el proyecto Next.js en esta carpeta (sin borrar los archivos existentes) con TypeScript, Tailwind, ESLint y App Router.

1. Define los tokens de diseño de CLAUDE.md en el CSS global. Usa las capturas header-desktop.png y footer-desktop.png para obtener los colores del header, footer y fondo que faltan, y agrégalos como tokens.
2. Carga Anek Bangla y Source Sans 3 con next/font.
3. Descarga el logo y los íconos SVG de servicios desde pgasesorias.cl a public/.
4. Crea lib/site.ts con los datos de la empresa.
5. Crea los componentes base: BotonPrincipal, BotonSecundario, EncabezadoSeccion, DivisorDiagonal, Tarjeta.
6. Construye Header (con menú móvil) y Footer fieles a la identidad de las capturas, en desktop y móvil.

El objetivo es respetar la identidad de marca y mejorar la experiencia (header sticky, barra inferior fija en móvil, ortografía corregida).
Al terminar, levanta el servidor, revisa Header y Footer contra las capturas y en 375px. Crea docs/MEJORAS.md y anota lo mejorado. Luego build, lint y commit.
```

## Fase 2 — Conexión a Supabase

```
Configura Supabase con @supabase/ssr:
- lib/supabase/server.ts, lib/supabase/client.ts y lib/supabase/admin.ts (service role, solo servidor, con import "server-only").
- Genera los tipos TypeScript de la base (supabase gen types) en lib/database.types.ts.
- Crea lib/vehiculos.ts con funciones para: listar publicados con filtros y paginación, obtener por slug, obtener vecinos (anterior/siguiente), y una función que arme la URL pública de una foto del bucket "vehiculos".
- Crea lib/titulo.ts (título SEO y slug) siguiendo el formato de CLAUDE.md, con tests unitarios.
- Configura next.config para next/image con el dominio de Supabase Storage.
Build, lint y commit.
```

## Fase 3 — Migrar los vehículos actuales

Primero en modo prueba (no escribe nada):

```
Instala tsx, @supabase/supabase-js y sharp. Ejecuta:
node --env-file=.env.local --import tsx scripts/migrar-desde-wordpress.ts --dry-run
Muéstrame el resumen de migracion-reporte.md.
```

Revisa las advertencias (años raros, títulos que no calzan). Si está bien:

```
Ejecuta la migración real con el mismo comando sin --dry-run. Luego verifica en Supabase que cada vehículo tenga sus fotos y muéstrame el reporte final.
```

## Fase 4 — Sitio público: Home, catálogo y ficha

```
Construye, siguiendo CLAUDE.md y comparando con las capturas:
1. Home completa con todas las secciones en orden. La sección "Vehiculos en venta" lee de Supabase.
2. /vehiculos-en-venta con filtros en la URL (los de CLAUDE.md), render en servidor, paginación.
3. /vehiculos-en-venta/[slug] con galería + lightbox, precios, botones WhatsApp/Cotizar, General, Equipamiento, Seguridad, descripción, otros vehículos, anterior/siguiente.
4. generateMetadata y JSON-LD Car por ficha, og:image = portada.
Prueba en 375px y 1440px. Verifica que ninguno de los "Bugs del sitio actual" de CLAUDE.md aparezca. Build, lint y commit.
```

## Fase 5 — Panel de administración

```
Construye /admin según la sección "Panel de administración" de CLAUDE.md:
- Login con Supabase Auth, protección de todas las rutas /admin en servidor, verificación contra admin_users, noindex.
- Lista de vehículos con filtros por estado y acciones rápidas.
- Formulario crear/editar por secciones con zod + react-hook-form, título y slug autogenerados con vista previa.
- Subida de fotos: drag & drop múltiple y cámara del celular, compresión a WebP en el navegador, progreso por foto, reordenar arrastrando (dnd-kit), portada = primera, eliminar.
- Server Actions para guardar, con revalidatePath de home, catálogo y ficha.
- Vista previa de tarjeta y ficha.
- Bandeja de consultas.
Usa shadcn/ui solo dentro de /admin. Prioriza la experiencia en celular.
Al terminar, crea un vehículo de prueba con 12 fotos desde el viewport móvil, verifica que aparezca en el sitio, y bórralo. Build, lint y commit.
```

## Fase 5b — IA en la carga de vehículos

```
Implementa el upgrade 1 y 2 de CLAUDE.md:
- Endpoint de servidor /api/admin/asistente-vehiculo (solo admins) que recibe el texto o dictado de Pablo y hasta 6 fotos, llama a la API de Claude con @anthropic-ai/sdk y devuelve JSON validado con zod: campos de la ficha, carrocería, equipamiento/seguridad detectados (solo slugs de opciones_equipamiento), descripción comercial en el tono de PG (cercano, con emojis moderados como en su Instagram) y advertencias de coherencia.
- Usa claude-haiku-5-5 para la extracción y claude-sonnet-5-5 para la descripción. Usa salida estructurada (tool use) en vez de parsear texto libre.
- En el formulario: botón "Completar con IA" (y dictado por voz con la Web Speech API) que prellena todo sin pisar lo que Pablo ya escribió, marcando en color los campos sugeridos.
- Validación de coherencia en cliente y servidor (zod refine) con los casos de "Bugs del sitio actual".
- Maneja errores y timeouts: si la IA falla, el formulario sigue funcionando a mano.
Prueba con el texto "Toyota 4Runner Limited 2018, 145 mil km, bencinero, automático, 4x4, 23.990.000" y fotos de un auto migrado. Build, lint, commit y anota en docs/MEJORAS.md.
```

## Fase 6 — Resto de páginas

```
Construye /servicios, /nosotros, /contacto, /vende_tu_vehiculo y /flota_de_empresas tomando los textos del sitio actual (usa WebFetch sobre cada URL de pgasesorias.cl), con ortografía corregida. En /flota_de_empresas NO uses las imágenes enlazadas desde sitios ajenos: deja espacios marcados para fotos propias.
El formulario de /contacto y /vende_tu_vehiculo guarda en la tabla consultas (honeypot + límite por IP) y acepta ?vehiculo=slug para precargar el auto.
Para /blog, importa los posts desde la REST API de WordPress (wp-json/wp/v2/posts) a una tabla nueva "posts" y crea /blog y /blog/[slug].
Build, lint y commit.
```

## Fase 7 — Upgrades v1 para clientes

```
Implementa los upgrades 3 a 12 de CLAUDE.md, uno por commit, en este orden:
3. Simulador de financiamiento en la ficha (parámetros desde la tabla config, editables en /admin/configuracion).
4. Sello "Revisado por PG": subida de informe PDF/checklist en el admin, sello en tarjeta y sección en ficha.
5. Registro de leads con origen, página y UTM + aviso por email con Resend. Bandeja con estados (nuevo, contactado, en proceso, ganado, perdido).
6. Tasación por pasos en /vende_tu_vehiculo con subida de fotos por URL firmada al bucket "tasaciones".
7. Agenda de servicios con bloques disponibles (tablas servicios y reservas, vista reservas_ocupadas) y confirmación desde el admin.
8. Búsqueda en lenguaje natural en el catálogo que se convierte en filtros visibles.
9. Analítica: Vercel Analytics, Speed Insights, GA4 y Meta Pixel + Conversions API, con banner de consentimiento. Eventos propios en la tabla eventos.
10. OG images dinámicas con next/og y páginas por marca.
11. Turnstile en formularios, límite por IP, Sentry, 404 con buscador.
12. Admin como PWA instalable.
Después de cada uno: build, lint, commit y entrada en docs/MEJORAS.md.
```

## Fase 8 — SEO, redirecciones y deploy

```
1. Redirecciones 301 (ver CLAUDE.md): ?vehiculo=slug → /vehiculos-en-venta/slug sin query param, ?post_type=vehiculo, /Flota-Empresarial, /flota-empresarial, y cualquier URL vieja de páginas.
2. app/sitemap.ts dinámico (páginas + vehículos publicados + posts) y app/robots.ts (bloquear /admin).
3. JSON-LD LocalBusiness/AutoDealer en el layout.
4. Lighthouse móvil en home, catálogo y una ficha; corrige hasta llegar a las metas de CLAUDE.md.
5. Revisa docs/MEJORAS.md y déjalo listo para presentárselo a PG.
Commit y push.
```

Luego, tú:
1. Vercel → Add New Project → importa el repo → agrega las variables de `.env.local` (excepto `WP_URL`, que solo usa la migración) → Deploy.
2. Revisa todo en la URL `*.vercel.app` (también desde el celular de Pablo).
3. Supabase → Authentication → URL Configuration → agrega `https://pgasesorias.cl` y la URL de Vercel.

## Fase 9 — Cambio de dominio (el día del lanzamiento)

1. Antes: anota en Search Console las URLs más visitadas y verifica que cada una redirija bien en la versión de Vercel.
2. Vercel → Settings → Domains → agrega `pgasesorias.cl` y `www.pgasesorias.cl`. Vercel te muestra los registros DNS.
3. En tu proveedor de DNS (donde está el dominio, NIC Chile / hosting actual) cambia los registros A/CNAME a los que indica Vercel. **No toques los registros MX** si el correo info@pgasesorias.cl está en ese hosting.
4. Espera la propagación (minutos a pocas horas). Vercel emite el certificado SSL solo.
5. Search Console: envía el nuevo sitemap y usa "Inspección de URL" en las páginas clave.
6. Mantén el WordPress vivo en un subdominio (ej. `old.pgasesorias.cl`) 30 días como respaldo, con `noindex`. Después, cancélalo.

## Fase 10 — Upgrades v2 (después del lanzamiento, uno a la vez)

```
Implementa el upgrade [número] de la sección v2 de CLAUDE.md. Antes de programar, propón el diseño (tablas, pantallas, costos de servicios externos) y espera mi aprobación.
```

Orden sugerido: 15 (dashboard, para medir) → 14 (publicación multicanal) → 13 (asistente de chat) → 16 (favoritos y alertas) → 17, 18, 19.

---

## Prompts útiles para el día a día

- "Revisa la home en 375px contra docs/referencia/home-mobile.png: ¿se mantiene la identidad de marca? Propón mejoras."
- "Agrega el campo `color` a vehículos: migración SQL, tipos, formulario admin y ficha."
- "Hay un error en producción: [pega el error]. Encuentra la causa y corrígelo."
