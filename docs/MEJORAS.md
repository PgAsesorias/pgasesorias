# Mejoras respecto al sitio actual (pgasesorias.cl)

Registro de todo lo que el sitio nuevo hace mejor que el WordPress actual, para
mostrárselo al cliente. Se actualiza al cerrar cada fase.

---

## Fase 1 — Proyecto base, identidad y layout

### Identidad de marca recuperada con precisión

- **Paleta completa extraída del CSS real del sitio**, no estimada con cuentagotas.
  El brief daba por perdidas las variables `--ast-global-color-0..8` del tema Astra;
  se recuperaron todas desde el CSS publicado:
  | Token nuevo | Valor | Dónde se usa en el sitio actual |
  |---|---|---|
  | `--pg-red` | `#d33e52` | prefijos de sección, fin del degradado |
  | `--pg-orange` | `#ff9d43` | acentos, hover |
  | `--pg-black` / `--pg-header` / `--pg-footer` | `#000000` | header y footer |
  | `--pg-ink` | `#272e32` | texto y botón secundario |
  | `--pg-bg` | `#f9f9fb` | fondo general del sitio |
  | `--pg-border` | `#d3d3d3` | separadores |
  | `--pg-muted` | `#6e6e6e` | texto secundario |
  | `--pg-yellow` | `#ffdd00` | estrellas de la reseña de Google |
- Tipografías de marca (**Anek Bangla** en títulos, **Source Sans 3** en texto)
  autoalojadas con `next/font`: se sirven desde el propio dominio, sin pedir nada a
  Google en cada visita. Mejora privacidad y tiempo de carga.

### Errores del sitio actual ya corregidos

- **Ortografía del menú:** "Vehiculos en venta" → **"Vehículos en venta"**;
  "inicio" → **"Inicio"**.
- **"Whatssap" → "WhatsApp"** y "Correo electronico" → "Correo electrónico"
  (en los datos del sitio, `lib/site.ts`).
- **"Revisón Pre-Compra" → "Revisión Pre-Compra"** en el tagline del footer.
- **Contadores de la home recuperados:** el sitio actual muestra solo un "+" sin
  número. Los valores reales (100, 250, 500 y 7) estaban en el HTML pero el plugin
  no los pintaba; quedan en `lib/site.ts` listos para animarse en la fase 4.
- **Sin residuos de plugins:** no se replica el carrito vacío de SureCart
  ("Review Your Cart 0", "Add Coupon Code") que hoy aparece al pie de todas las páginas.
- **Una sola URL para Flota de Empresas** (`/flota_de_empresas`); las variantes
  `/Flota-Empresarial` y `/flota-empresarial` se redirigen en la fase 8.

### Experiencia mejorada

- **Header fijo que se compacta al hacer scroll** (70px → 58px): el menú siempre
  está a mano y ocupa menos pantalla al leer.
- **Menú móvil a pantalla completa** con botón de WhatsApp y redes, que se cierra
  con `Esc`, al tocar un enlace, y bloquea el scroll del fondo mientras está abierto.
- **Barra inferior fija en móvil** con "WhatsApp" y "Ver autos": contactar o ver el
  catálogo desde cualquier punto de la página, sin volver arriba.
- **Enlace "Ir al contenido"** para teclado y lectores de pantalla.
- **Footer reorganizado** en 4 columnas (marca, contacto, contenido, ubicación) con
  mapa de Google que carga de forma diferida (`loading="lazy"`) para no frenar la
  carga inicial, y la tarjeta de reseña 5,0 ★ enlazada al perfil de Google Maps.
- **Indicador de página actual** en el menú (color de marca + `aria-current="page"`).
- **Foco visible** en todos los elementos interactivos y respeto por
  `prefers-reduced-motion` para quien pide menos animación.
- **Íconos SVG inline** en vez de cargar Font Awesome completo: menos peso y sin
  dependencias externas.
- **Logo e imágenes propias servidas desde el sitio** y optimizadas con `next/image`.

### Base técnica

- Next.js 16 (App Router) + TypeScript estricto + Tailwind 4, `lang="es-CL"`.
- Componentes de marca reutilizables: `BotonPrincipal`, `BotonSecundario`,
  `EncabezadoSeccion`, `DivisorDiagonal` (el mismo path diagonal del sitio actual),
  `Tarjeta` e `Iconos`.
- Todos los datos de la empresa centralizados en `lib/site.ts`: cambiar un teléfono
  o un horario es editar una sola línea.
- `npm run build` y `npm run lint` sin errores.

---

## Fase 2 — Base de datos y capa de datos

### Lo que quedó montado en Supabase

- Proyecto `PgAsesorias's Project` (ref `noozrbmmukctabusnwdy`), Postgres 17.11.
- `schema.sql` y `upgrades.sql` aplicados: 10 tablas + 1 vista, 28 políticas de
  seguridad, 18 opciones de equipamiento, 8 servicios y 3 claves de configuración.
- Tres buckets de Storage: `vehiculos` (público), `informes` (público),
  `tasaciones` (privado, porque guarda datos del vehículo de un cliente).

### Seguridad verificada, no supuesta

Se probó con la clave pública contra la base real:
| Prueba | Resultado |
|---|---|
| El público ve los vehículos publicados | ✅ sí |
| El público ve los borradores | ✅ no (quedan ocultos) |
| El público puede crear/editar vehículos | ✅ no (HTTP 401) |
| El público puede enviar una consulta (lead) | ✅ sí |
| El público puede leer las consultas de otros | ✅ no (0 filas) |

En el sitio actual cualquier dato está donde lo dejó el plugin; acá cada tabla
tiene reglas explícitas y comprobadas.

### Calidad de datos desde la base

- El propio Postgres rechaza los errores que hoy tiene el sitio: el año tiene que
  estar entre 1950 y el año siguiente (el "1970" del Peugeot 3008 no entra), el
  precio de oferta **tiene** que ser menor al precio, el kilometraje no puede ser
  negativo, y transmisión/combustible solo aceptan valores de una lista cerrada.
- La clave `service_role` (que salta esas reglas) solo se usa en código de servidor:
  los módulos que la tocan llevan `import "server-only"`, así que el build falla si
  alguien intenta importarlos desde el navegador.
- Se usan las **claves nuevas de Supabase** (`sb_publishable_` / `sb_secret_`), que
  se pueden rotar de forma independiente, en vez de las claves JWT heredadas.

### Capa de datos lista para el sitio

- Listado con filtros (marca, condición, año, rango de precio, transmisión,
  combustible, búsqueda por texto, "Revisado por PG"), orden y paginación.
- Ficha por slug con fotos ordenadas, vehículo anterior/siguiente, y
  "otros vehículos" priorizando precio parecido.
- Conteos por marca y por año para los filtros con número, como en el sitio actual.
- Título SEO y slug compatibles con WordPress, con 10 tests automáticos: las URLs
  de los vehículos ya publicados no se rompen.
- `npm run verificar:supabase` revisa en 5 segundos que la base, las semillas, los
  buckets y los administradores estén bien. Si algo falta, dice exactamente qué.
