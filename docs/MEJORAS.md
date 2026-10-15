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
