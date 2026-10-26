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

---

## Fase 3 — Migración de los vehículos actuales

Se migraron los **7 vehículos** del WordPress con sus **72 fotos**, convertidas a
WebP (máx. 1920px) y alojadas en el Storage propio. Hoy las fotos se sirven desde
el servidor de WordPress en tamaño original; ahora pesan una fracción y las entrega
un CDN.

### Errores de datos encontrados y corregidos

El sitio actual publica autos cuyo título contradice su ficha. Se revisó cada caso
**mirando las fotos del propio auto**, no adivinando:

| Vehículo | Problema en el sitio actual | Qué se hizo |
|---|---|---|
| Maxus T60 | El título dice "Diésel … Mecánico", los campos decían Gasolina y Automática | Las fotos muestran la palanca con el patrón de marchas grabado, y el motor 2.8 de esa versión es diésel → se corrigieron los campos a **Mecánico + Diésel** |
| Peugeot Landtrek | El título dice "Automático", el campo decía Manual | Las fotos muestran palanca manual y selector 4×4 (H2/H4) → el campo tenía razón; se corrigió **el título** a "Mecánico" |
| 6 de 7 vehículos | El campo de tracción estaba vacío aunque el título la indicaba | Se completó la tracción (4×2 / 4×4) leyéndola del título |

La URL de cada vehículo (su slug) se mantuvo **exactamente igual** que en WordPress,
así que los enlaces compartidos por WhatsApp y lo que Google ya tiene indexado
siguen funcionando.

### Validador de coherencia (upgrade v1 nº 2)

`lib/coherencia.ts` revisa cada vehículo y distingue entre **errores** (impiden
publicar) y **avisos** (solo advierten):

- El título contra los campos: transmisión, combustible, tracción, puertas y año.
- Año fuera de rango (el "1970" que muestra hoy la tarjeta del Peugeot sería error)
  o del modelo siguiente (aviso para confirmar).
- Precio de oferta mayor o igual al precio, o sospechosamente bajo (falta un dígito).
- Kilometraje imposible para la antigüedad del vehículo.
- Vehículos sin fotos o con menos de 5.

Tiene 8 tests automáticos, incluido uno que reproduce el bug real del Maxus T60.
Se usa en el panel de administración (fase 5) y desde la línea de comandos:

```bash
npm run auditar
```

**Resultado actual del inventario: 7 vehículos, 0 errores, 2 avisos.**

---

## Fase 4 — Sitio público: home, catálogo y ficha

### Home

Las 9 secciones del sitio actual, con sus textos, más lo que faltaba:

- **Contadores que sí se ven.** Hoy el sitio muestra un "+" sin número porque el
  plugin falla. Los valores reales estaban escondidos en el HTML: ahora se animan
  al entrar en pantalla (100+, 250+, 500+ y 7), y quien tiene activado "reducir
  movimiento" ve el número final de inmediato.
- **Instagram honesto.** El plugin actual muestra imágenes rotas. Hasta conectar la
  API de Instagram, se muestra una invitación a seguir la cuenta en vez de fotos
  falsas.
- **Vehículos reales desde la base**, con el mismo precio que el catálogo
  (hoy la home y el catálogo muestran precios distintos para el mismo auto).
- **Ortografía corregida** en todos los títulos: "Contacto" y "Flota para Empresas"
  ya no aparecen como "cONTACTO" ni "fLOTA PARA EMPRESAS".

### Tarjeta de vehículo

Una sola tarjeta para home y catálogo, así no pueden volver a mostrar datos
distintos. Precio de oferta destacado con el precio normal tachado, insignia de
"Oferta", y estados "Reservado" / "Vendido" cuando corresponde. El botón ahora dice
**"Detalles"** y no "dETALLES".

### Catálogo

- Los filtros del sitio actual (marca, estado, año) **más** búsqueda por texto,
  transmisión, combustible, precio máximo y orden (recientes, precio, kilómetros, año).
- Cada filtro muestra **cuántos vehículos tiene** ("Toyota (1)", "Usado (4)").
- **Todo vive en la URL**: `/vehiculos-en-venta?marca=Nissan` se puede compartir por
  WhatsApp, guardar en favoritos y lo puede indexar Google. Los resultados se
  calculan en el servidor.
- Chips para quitar filtros uno a uno y "Limpiar todo".
- Si no hay resultados, en vez de una página vacía se ofrece escribir por WhatsApp
  contando qué busca el cliente.

### Ficha del vehículo

- **Galería** con miniaturas, lightbox a pantalla completa, navegación con flechas
  del teclado, `Escape` para cerrar y deslizar con el dedo en el celular.
- Precio con "Antes / Precio oferta", botones de WhatsApp (con mensaje prellenado
  que incluye el auto y su link) y de cotización.
- Ficha técnica completa, equipamiento y seguridad con ✓ verdes, y navegación al
  vehículo anterior y siguiente.
- "Otros vehículos en venta" priorizando autos de precio parecido.
- **SEO por vehículo, no genérico:**
  - `og:image` = la foto de portada de ese auto. Hoy **todas** las fichas comparten
    la misma imagen (el logo), así que compartir un auto por WhatsApp muestra el logo
    en vez del vehículo.
  - Título y descripción armados con los datos reales del auto.
  - JSON-LD `Car` + `Offer` en CLP con disponibilidad (`InStock`, `LimitedAvailability`
    si está reservado, `SoldOut` si se vendió) y `BreadcrumbList`, para que Google
    pueda mostrar precio y características en los resultados.
  - URL limpia `/vehiculos-en-venta/{slug}`, la misma que ya tenía el auto en WordPress.

### Rendimiento

- Home y fichas se generan estáticamente y se revalidan cada 5–10 minutos; no
  consultan la base en cada visita.
- Las lecturas públicas usan un cliente sin cookies, justamente para que las páginas
  puedan quedar en caché.
- Fotos en WebP con tamaños adaptados al dispositivo (`next/image`).

---

## Fase 6 — Páginas del menú y captura de leads

Las 6 páginas que faltaban del menú ya existen. Antes, 6 de los 8 enlaces del
menú llevaban a una página inexistente.

### Páginas nuevas

- **Servicios** — los 8 servicios con sus textos, los 4 pasos para agendar y
  JSON-LD `AutoRepair` con el catálogo de servicios.
- **Nosotros** — historia, cómo trabajamos, contadores y JSON-LD `AutoDealer`
  con dirección, horario y calificación.
- **Contacto** — los 5 canales, formulario y mapa. Si llega desde una ficha
  (`/contacto?vehiculo=...`), muestra de qué vehículo se trata y el lead queda
  asociado a ese auto.
- **Compramos tu Vehículo** — las dos modalidades (compra directa y consignación)
  y formulario de tasación con patente, marca/modelo, año, kilometraje y precio
  esperado.
- **Flota de Empresas** — propuesta para empresas y formulario de cotización
  (empresa, RUT, cantidad y tipo de flota). **Sin imágenes enlazadas desde sitios
  ajenos**: la página actual carga fotos desde infocampo, grupopana y gstatic,
  que es un riesgo legal y se puede caer en cualquier momento.
- **Blog** — página honesta de "próximamente", marcada como `noindex` mientras no
  haya artículos, en vez de un enlace roto en el menú.

### Los leads ya no se pierden

Hoy todo contacto depende de WhatsApp y no queda registro. Ahora cada envío se
guarda en la tabla `consultas` con el origen (contacto, cotizar, tasación, flota),
la página desde donde se envió y el vehículo asociado si corresponde.

Probado de punta a punta en un navegador real:

| Prueba | Resultado |
|---|---|
| Enviar vacío | Rechazado: "Escribe tu nombre." |
| Sin teléfono ni correo | Rechazado: "Déjanos un teléfono o un correo para poder responderte." |
| Correo mal escrito | Rechazado: "Revisa el correo." |
| Envío válido desde una ficha | Guardado, con el vehículo asociado |
| Robot (campo trampa lleno) | Descartado en silencio, no llega a la base |
| 6 envíos seguidos desde la misma IP | Bloqueado por 10 minutos |

**Nada de lo escrito se pierde al corregir un error.** Si el cliente llena el
formulario de tasación completo y se equivoca en el correo, al volver conserva
todos los campos: nombre, teléfono, marca, año, kilometraje, la opción elegida y
el mensaje. Es la diferencia entre recibir el lead o perderlo.

### Otros agregados

- **Página 404 útil**: en vez de un error seco, ofrece el catálogo, WhatsApp y
  todo el menú. Sirve para los enlaces viejos de vehículos ya vendidos.
- **Sitemap dinámico** (`/sitemap.xml`): 13 URLs, incluidos los vehículos con su
  fecha de última modificación.
- **robots.txt** que bloquea `/admin` y apunta al sitemap.

### Un bug encontrado al revisar las capturas

El footer se veía **blanco sobre blanco en todas las páginas**: usaba una clase de
color que no existía, y Tailwind las ignora en silencio. Además de corregirlo, se
agregó `npm run verificar:tokens`, que compara todas las clases de marca usadas
contra los tokens declarados y falla si falta alguna. Ese tipo de error no puede
volver a pasar desapercibido.

---

## Fase 5 — Panel de administración

El panel vive en `/admin`, está fuera de Google (`noindex` + bloqueado en
robots.txt) y solo entran los correos que estén en `admin_users`. La protección
se aplica dos veces: en el middleware y otra vez en el servidor, dentro del
layout del panel.

### Cargar un vehículo

El formulario va por secciones: datos básicos → precio → ficha técnica →
equipamiento y seguridad → fotos → descripción → publicación.

- **El título se arma solo** con el formato del sitio
  (`Toyota 4Runner Limited V6 4.0 Automático 5 Puertas, Tracción 4X4, Año 2018`)
  y se actualiza mientras se escribe. Se puede editar a mano si hace falta.
- **La URL de un vehículo ya publicado no cambia** aunque se edite el título:
  los enlaces compartidos siguen funcionando.
- **El precio se formatea mientras se escribe**: `18990000` se ve `18.990.000`.
  Si hay oferta, muestra el ahorro que verá el cliente.
- **Avisos de coherencia en vivo**, abajo en la barra de guardado: si el título
  dice Diésel y el campo dice Gasolina, aparece antes de publicar. Es el error
  que hoy tiene el Maxus T60 en el sitio.
- **Equipamiento y seguridad** como chips que se tocan; en el celular no hay que
  apuntarle a una casilla chica.

### Fotos

- Arrastrar y soltar varias a la vez, elegir del teléfono o **tomar la foto con
  la cámara** desde el mismo formulario.
- Se **comprimen en el navegador** antes de subir (máximo 1920px, WebP 80%): se
  suben en segundos incluso con datos móviles.
- Barra de progreso por foto, reordenar arrastrando, la primera es la portada y
  se puede eliminar una por una.
- **No se puede guardar mientras una foto está subiendo.** Se detectó probando:
  el botón quedaba disponible y las fotos que aún no terminaban se perdían sin
  aviso. Ahora el botón dice "Esperando fotos…" y se bloquea.

### Lista y acciones rápidas

Cada vehículo muestra foto, estado, precio (con la oferta tachada), fotos que
tiene y cuándo se editó. Desde la misma fila: **editar, ver en el sitio, cambiar
estado** (borrador / publicado / reservado / vendido), **destacar, duplicar y
eliminar** con confirmación. Avisa en rojo si a un vehículo **le faltan fotos**.

Al guardar se refrescan solas la home, el catálogo, la ficha y el sitemap.

### Bandeja de consultas

Los leads del sitio con su origen (contacto, cotización, tasación, flota), el
vehículo por el que preguntaron, los datos del formulario y la página desde donde
escribieron. Botón **Responder por WhatsApp** con el mensaje ya escrito, y marcar
como atendida. Hoy nada de esto existe: todo llega por WhatsApp y se pierde.

### Un bug de móvil encontrado probando

La **barra fija de WhatsApp del sitio público tapaba el botón "Guardar"** del
panel en el celular: Pablo no habría podido publicar un auto desde el teléfono.
Además el panel arrastraba el header y el footer del sitio público. Se separaron
los dos layouts: el sitio tiene su armazón y el panel el suyo.

### Medido, no estimado

Un vehículo completo (datos, precio, ficha técnica, 4 opciones de equipamiento,
3 fotos y publicación) **se carga en 5,2 segundos desde un celular de 390px**.
La meta del brief era menos de 2 minutos con 12 fotos.

---

## Hero nuevo con el Instagram real

El sitio actual tiene el hero dividido —texto a la izquierda, feed de Instagram a
la derecha— pero el feed depende de un plugin que **enlaza las fotos al CDN de
Instagram**, y esas direcciones vienen firmadas y caducan: por eso en el sitio
aparecen imágenes rotas.

Ahora:

- Mismo esquema de dos columnas, pero la tarjeta de texto es más legible (prefijo,
  barra de marca, título, párrafo y botones) y suma tres garantías visibles:
  vehículos revisados, retiro y entrega a domicilio, transferencia incluida.
- **Las 12 últimas publicaciones se descargan y se alojan en el Storage propio**,
  convertidas a WebP cuadrado de 800px (entre 22 y 108 KB cada una). El feed no se
  puede volver a romper por una URL caducada.
- Cada miniatura enlaza a su publicación real en Instagram, con el ícono de reel o
  de carrusel según corresponda, y crece suavemente al pasar el mouse.
- En el celular la tarjeta va primero y la grilla debajo, las dos legibles.
- Se eliminó el botón "Cargar más" del plugin, que no aportaba nada.

Para actualizar el feed: `npm run instagram`.

> **Sobre conectar Instagram en vivo:** se hace con un *token de acceso* de la
> Instagram Graph API (revocable, solo permiso de lectura), nunca con la
> contraseña de la cuenta. Queda como upgrade v2 nº 18. Aun con la API conectada,
> las imágenes se seguirán copiando al Storage propio: las que entrega Instagram
> caducan igual.

---

## Analítica: saber qué funciona y qué no

Hoy no hay forma de saber cuántas personas vieron un auto ni cuántas escribieron
por WhatsApp. Ahora se mide en dos capas, a propósito:

### 1. Analítica propia (siempre funciona)

Cada evento se guarda en la tabla `eventos` del propio Supabase: vista de ficha,
clic en WhatsApp, clic en teléfono, uso del simulador, compartir. **No usa cookies
ni identifica a nadie**, así que no la bloquean los bloqueadores de publicidad y no
requiere consentimiento. Es la que alimentará el panel de PG: vistas por vehículo,
días en inventario y de dónde llegan las consultas.

Se registra solo, sin tocar cada botón: un único oyente detecta los clics a
WhatsApp y teléfono en todo el sitio, incluidos los que se agreguen después. Cada
ficha además suma a su contador de vistas.

Entre el 20 % y el 40 % de los visitantes bloquea Google Analytics. Esos quedan
igualmente contados acá.

### 2. Google Analytics y Meta Pixel (para campañas)

Se cargan **solo si el visitante acepta las cookies** y solo si el ID está
configurado. Sin ID, no se descarga ni un byte extra.

Eventos que se envían a Google: `vista_ficha`, `clic_whatsapp`, `clic_telefono`,
`simulador`, `compartir`. A Meta se traducen a sus conversiones estándar
(`Contact`, `ViewContent`) para poder optimizar las campañas de Instagram.

### Banner de cookies

Aceptar o rechazar, con la decisión recordada. Si rechaza, el sitio funciona
igual y no se carga nada de Google ni de Meta. Comprobado en el navegador: con
cookies rechazadas, **cero peticiones** a googletagmanager, google-analytics o
facebook.

### Velocidad real

Vercel Analytics y Speed Insights quedan activos: miden visitas y la velocidad de
carga que experimentan los visitantes de verdad, sin cookies.
