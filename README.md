# pgasesorias.cl

Sitio de **PG Asesorías** (PG Servicios Automotrices SpA): catálogo de vehículos,
servicios automotrices y panel de administración.

Reemplaza al WordPress anterior manteniendo la identidad de marca y las URLs.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript estricto |
| Estilos | Tailwind CSS 4 con tokens de marca en `app/globals.css` |
| Base de datos | Supabase (Postgres + Auth + Storage), con RLS en todas las tablas |
| Imágenes | `next/image` sobre WebP en Supabase Storage |
| Deploy | Vercel |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # completar las claves de Supabase
npm run dev                    # http://localhost:3000
```

`.env.local` nunca se sube al repo. En producción, las variables van en
Vercel → Settings → Environment Variables.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests unitarios (título SEO, slug, coherencia de datos) |
| `npm run verificar:supabase` | Revisa tablas, semillas, buckets y administradores |
| `npm run auditar` | Audita los vehículos publicados: título vs campos, precios, fotos |
| `npm run capturas` | Capturas de pantalla en desktop y móvil (`.capturas/`) |
| `npm run migrar` | Migra los vehículos desde el WordPress anterior |
| `npm run tipos:supabase` | Regenera los tipos de la base |

## Estructura

```
app/                  Rutas (App Router)
components/
  layout/             Header, Footer, barra móvil
  ui/                 Botones, tarjetas, íconos y encabezados de marca
  home/               Secciones de la portada
  vehiculos/          Tarjeta, galería y filtros del catálogo
lib/
  site.ts             Datos de la empresa y contenido fijo
  vehiculos.ts        Consultas del catálogo y la ficha
  titulo.ts           Título SEO y slug (compatibles con WordPress)
  coherencia.ts       Validación de datos antes de publicar
  supabase/           Clientes: público, servidor (sesión) y admin
supabase/             schema.sql y upgrades.sql
scripts/              Migración, auditoría, verificación y capturas
docs/MEJORAS.md       Registro de mejoras respecto al sitio anterior
CLAUDE.md             Brief del proyecto
```

## Convenciones

- Español de Chile (`lang="es-CL"`); precios en CLP con punto de miles.
- Server Components por defecto; `"use client"` solo donde hay interacción.
- Las URLs de los vehículos (`slug`) **no cambian**: vienen de WordPress y
  están indexadas.
- Toda escritura del admin verifica sesión y pertenencia a `admin_users`.
