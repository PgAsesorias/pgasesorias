/**
 * Migra los vehículos de pgasesorias.cl (WordPress) a Supabase.
 *
 * Qué hace:
 *  1. Lee todos los vehículos desde la REST API pública de WordPress (no necesita contraseña).
 *  2. Toma los campos ACF desde `spectra_custom_meta` (la API devuelve `acf: []`).
 *  3. Extrae las fotos de la galería (contenido del post) + la imagen destacada.
 *  4. Descarga cada foto, la convierte a WebP (máx. 1920px) y la sube al bucket "vehiculos".
 *  5. Hace upsert por `wp_id`, así que se puede ejecutar varias veces sin duplicar.
 *  6. Escribe `migracion-reporte.md` con advertencias (años imposibles, títulos que no
 *     calzan con los campos, vehículos sin fotos, etc.).
 *
 * Uso:
 *   npm i -D tsx && npm i @supabase/supabase-js sharp
 *   npx tsx scripts/migrar-desde-wordpress.ts            # migración real
 *   npx tsx scripts/migrar-desde-wordpress.ts --dry-run  # solo lee y reporta, no escribe nada
 *
 * Variables (en .env.local, cargadas con `node --env-file` o exportadas):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WP_URL (default https://pgasesorias.cl)
 *
 * ⚠️ La service role key salta RLS: úsala solo en tu computador, nunca en el navegador ni en el repo.
 */

import { writeFileSync } from "node:fs";

const WP_URL = (process.env.WP_URL ?? "https://pgasesorias.cl").replace(/\/$/, "");
const DRY_RUN = process.argv.includes("--dry-run");
const BUCKET = "vehiculos";
const ANIO_MAX = new Date().getFullYear() + 1;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type WpVehiculo = {
  id: number;
  slug: string;
  status: string;
  date_gmt: string;
  title: { rendered: string };
  content: { rendered: string };
  spectra_custom_meta?: Record<string, string[]>;
  uagb_featured_image_src?: { full?: [string, number, number, boolean] };
};

export type VehiculoMigrado = {
  wp_id: number;
  slug: string;
  titulo: string;
  marca: string;
  modelo: string;
  anio: number | null;
  kilometraje: number;
  transmision: "Automática" | "Manual" | null;
  combustible: "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico" | null;
  traccion: "4x2" | "4x4" | "AWD" | null;
  puertas: number | null;
  condicion: "Nuevo" | "Seminuevo" | "Usado" | null;
  ubicacion: string;
  precio: number | null;
  precio_oferta: number | null;
  equipamiento: string[];
  seguridad: string[];
  estado: "publicado" | "borrador";
  publicado_at: string;
  fotos: string[]; // URLs originales, portada primero
};

// ---------------------------------------------------------------------------
// Parsers (puros, testeables)
// ---------------------------------------------------------------------------

export function decodeHtml(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/×/g, "x")
    .trim();
}

/** "23.990.000" | "$23.990.000" | "145.000km" -> número entero, o null */
export function soloDigitos(v: string | undefined): number | null {
  if (!v) return null;
  const d = v.replace(/\D/g, "");
  return d ? Number(d) : null;
}

/** Arrays PHP serializados: a:2:{i:0;s:5:"hola";i:1;s:5:"chao";} -> ["hola","chao"] */
export function phpArray(v: string | undefined): string[] {
  if (!v) return [];
  return [...v.matchAll(/s:\d+:"([^"]*)"/g)].map((m) => m[1]);
}

function meta(m: Record<string, string[]> | undefined, key: string): string | undefined {
  const v = m?.[key]?.[0];
  return v === undefined || v === "" ? undefined : v;
}

export function normTransmision(v?: string): VehiculoMigrado["transmision"] {
  if (!v) return null;
  const s = v.toLowerCase();
  if (s.startsWith("auto")) return "Automática";
  if (s.startsWith("man") || s.startsWith("mec")) return "Manual";
  return null;
}

export function normCombustible(v?: string): VehiculoMigrado["combustible"] {
  if (!v) return null;
  const s = v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (s.includes("diesel")) return "Diésel";
  if (s.includes("hibrid")) return "Híbrido";
  if (s.includes("electr")) return "Eléctrico";
  if (s.includes("gasol") || s.includes("bencin")) return "Gasolina";
  return null;
}

export function normTraccion(v?: string): VehiculoMigrado["traccion"] {
  if (!v) return null;
  const s = v.toLowerCase().replace(/\s|×/g, "x");
  if (s.includes("4x4")) return "4x4";
  if (s.includes("4x2")) return "4x2";
  if (s.includes("awd")) return "AWD";
  return null;
}

export function normCondicion(v?: string): VehiculoMigrado["condicion"] {
  if (!v) return null;
  const s = v.toLowerCase();
  if (s.startsWith("semi")) return "Seminuevo";
  if (s.startsWith("nuev")) return "Nuevo";
  if (s.startsWith("usad")) return "Usado";
  return null;
}

/** El campo "ano" es tipo fecha en ACF: puede venir "2018", "20180101", "01/01/2018"... */
export function parseAnio(v: string | undefined, titulo: string): { anio: number | null; origen: string } {
  const valido = (n: number) => n >= 1950 && n <= ANIO_MAX;
  const delCampo = v?.match(/(19[5-9]\d|20\d{2})/)?.[1];
  if (delCampo && valido(Number(delCampo))) return { anio: Number(delCampo), origen: "campo" };
  const delTitulo = titulo.match(/A[ñn]o\s+(\d{4})/i)?.[1];
  if (delTitulo && valido(Number(delTitulo))) return { anio: Number(delTitulo), origen: "titulo" };
  return { anio: null, origen: "ninguno" };
}

/** Fotos de la galería Spectra: versión completa en data-src del lightbox, si no, el src más grande. */
export function extraerFotos(html: string, destacada?: string): string[] {
  const urls: string[] = [];
  for (const m of html.matchAll(/data-src=["']([^"']+\.(?:jpe?g|png|webp|avif))["']/gi)) urls.push(m[1]);
  if (urls.length === 0) {
    for (const m of html.matchAll(/srcset=["']([^"'\s]+)/gi)) urls.push(m[1]);
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) urls.push(m[1]);
  }
  const limpiar = (u: string) =>
    decodeHtml(u)
      .replace(/\\\//g, "/")
      .replace(/-\d+x\d+(?=\.(?:jpe?g|png|webp|avif)$)/i, ""); // quita sufijo de miniatura -768x1024
  const lista = [destacada, ...urls]
    .filter((u): u is string => !!u && /\/wp-content\/uploads\//.test(u) && !/placeholder/.test(u))
    .map(limpiar);
  return [...new Set(lista)];
}

export function mapear(wp: WpVehiculo, avisos: string[]): VehiculoMigrado {
  const m = wp.spectra_custom_meta;
  const titulo = decodeHtml(meta(m, "titulo_vehiculo_seo") ?? wp.title.rendered);
  const { anio, origen } = parseAnio(meta(m, "ano"), titulo);
  const transmision = normTransmision(meta(m, "transmision"));
  const combustible = normCombustible(meta(m, "combustible"));
  const precio = soloDigitos(meta(m, "precio"));
  let precio_oferta = soloDigitos(meta(m, "precio_oferta"));

  const a = (msg: string) => avisos.push(`- **${titulo}** (wp ${wp.id}): ${msg}`);

  if (anio === null) a(`año inválido ("${meta(m, "ano")}"). Hay que completarlo a mano.`);
  else if (origen === "titulo") a(`año tomado del título (${anio}); el campo decía "${meta(m, "ano")}".`);
  if (anio !== null && anio >= new Date().getFullYear()) a(`año ${anio}: confirmar, parece un error de carga.`);
  if (!precio) a("sin precio.");
  if (precio && precio_oferta && precio_oferta >= precio) {
    a(`precio oferta (${precio_oferta}) no es menor al precio (${precio}); se descarta la oferta.`);
    precio_oferta = null;
  }

  // Coherencia título vs. campos
  const t = titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (transmision === "Manual" && /automatic/.test(t)) a("el título dice Automático pero el campo dice Manual.");
  if (transmision === "Automática" && /mecanic|manual/.test(t)) a("el título dice Mecánico pero el campo dice Automática.");
  if (combustible === "Gasolina" && /diesel/.test(t)) a("el título dice Diésel pero el campo dice Gasolina.");
  if (combustible === "Diésel" && /bencin|gasolin/.test(t)) a("el título dice Gasolina pero el campo dice Diésel.");

  const fotos = extraerFotos(wp.content.rendered, wp.uagb_featured_image_src?.full?.[0]);
  if (fotos.length === 0) a("sin fotos.");

  return {
    wp_id: wp.id,
    slug: wp.slug,
    titulo,
    marca: meta(m, "marca") ?? titulo.split(" ")[0],
    modelo: meta(m, "modelo") ?? "",
    anio,
    kilometraje: soloDigitos(meta(m, "kilometraje")) ?? 0,
    transmision,
    combustible,
    traccion: normTraccion(meta(m, "traccion")),
    puertas: soloDigitos(meta(m, "puertas")),
    condicion: normCondicion(meta(m, "estado_del_vehiculo")),
    ubicacion: meta(m, "ubicacion") ?? "Santiago, Chile",
    precio,
    precio_oferta,
    equipamiento: phpArray(meta(m, "equipamiento")),
    seguridad: phpArray(meta(m, "seguridad")),
    estado: wp.status === "publish" ? "publicado" : "borrador",
    publicado_at: wp.date_gmt ? `${wp.date_gmt}Z` : new Date().toISOString(),
    fotos,
  };
}

// ---------------------------------------------------------------------------
// I/O
// ---------------------------------------------------------------------------

async function leerWordPress(): Promise<WpVehiculo[]> {
  const todos: WpVehiculo[] = [];
  for (let page = 1; ; page++) {
    const url = `${WP_URL}/wp-json/wp/v2/vehiculo?per_page=100&page=${page}&status=publish`;
    const res = await fetch(url);
    if (res.status === 400) break; // página fuera de rango
    if (!res.ok) throw new Error(`WordPress respondió ${res.status} en ${url}`);
    const lote = (await res.json()) as WpVehiculo[];
    todos.push(...lote);
    const totalPages = Number(res.headers.get("x-wp-totalpages") ?? 1);
    if (page >= totalPages || lote.length === 0) break;
  }
  return todos;
}

async function main() {
  console.log(`Leyendo vehículos desde ${WP_URL} ...`);
  const wp = await leerWordPress();
  console.log(`  ${wp.length} vehículos encontrados.`);

  const avisos: string[] = [];
  const vehiculos = wp.map((v) => mapear(v, avisos));

  const listos = vehiculos.filter(
    (v) => v.anio !== null && v.precio && v.transmision && v.combustible,
  );
  const incompletos = vehiculos.filter((v) => !listos.includes(v));
  for (const v of incompletos) {
    avisos.push(`- **${v.titulo}**: faltan datos obligatorios; se importa como **borrador** para completarlo en /admin.`);
  }

  if (DRY_RUN) {
    escribirReporte(vehiculos, avisos, true);
    console.log("Dry run: no se escribió nada en Supabase. Revisa migracion-reporte.md");
    return;
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sharp = (await import("sharp")).default;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  for (const v of vehiculos) {
    const completo = listos.includes(v);
    const { fotos, ...datos } = v;
    const fila = {
      ...datos,
      // Los incompletos entran como borrador con valores provisorios que pasan los CHECK
      anio: datos.anio ?? new Date().getFullYear(),
      precio: datos.precio ?? 1,
      transmision: datos.transmision ?? "Manual",
      combustible: datos.combustible ?? "Gasolina",
      estado: completo ? datos.estado : "borrador",
    };

    const { data: guardado, error } = await supabase
      .from("vehiculos")
      .upsert(fila, { onConflict: "wp_id" })
      .select("id")
      .single();
    if (error || !guardado) {
      avisos.push(`- **${v.titulo}**: error al guardar (${error?.message}).`);
      console.error(`  ✗ ${v.titulo}: ${error?.message}`);
      continue;
    }

    // Reemplaza las fotos de este vehículo (idempotente)
    await supabase.from("vehiculo_fotos").delete().eq("vehiculo_id", guardado.id);

    let orden = 0;
    for (const url of fotos) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const original = Buffer.from(await res.arrayBuffer());
        const img = sharp(original).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true });
        const webp = await img.webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
        const path = `${guardado.id}/${String(orden).padStart(2, "0")}.webp`;

        const up = await supabase.storage.from(BUCKET).upload(path, webp.data, {
          contentType: "image/webp",
          upsert: true,
        });
        if (up.error) throw up.error;

        await supabase.from("vehiculo_fotos").insert({
          vehiculo_id: guardado.id,
          storage_path: path,
          orden,
          ancho: webp.info.width,
          alto: webp.info.height,
          alt: `${v.titulo} - foto ${orden + 1}`,
        });
        orden++;
      } catch (e) {
        avisos.push(`- **${v.titulo}**: no se pudo migrar la foto ${url} (${(e as Error).message}).`);
      }
    }
    console.log(`  ✓ ${v.titulo} (${orden} fotos)${completo ? "" : " [borrador]"}`);
  }

  escribirReporte(vehiculos, avisos, false);
  console.log("Listo. Revisa migracion-reporte.md");
}

function escribirReporte(vs: VehiculoMigrado[], avisos: string[], dry: boolean) {
  const filas = vs
    .map(
      (v) =>
        `| ${v.wp_id} | ${v.titulo} | ${v.anio ?? "—"} | ${v.precio?.toLocaleString("es-CL") ?? "—"} | ${
          v.precio_oferta?.toLocaleString("es-CL") ?? "—"
        } | ${v.transmision ?? "—"} | ${v.combustible ?? "—"} | ${v.fotos.length} |`,
    )
    .join("\n");
  const md = `# Reporte de migración ${dry ? "(dry run)" : ""}

Fecha: ${new Date().toLocaleString("es-CL")}
Vehículos leídos: ${vs.length}

## Advertencias (${avisos.length})

${avisos.length ? avisos.join("\n") : "Sin advertencias."}

## Vehículos

| WP id | Título | Año | Precio | Oferta | Transmisión | Combustible | Fotos |
|---|---|---|---|---|---|---|---|
${filas}
`;
  writeFileSync("migracion-reporte.md", md);
}

// Solo ejecuta main() cuando se llama como script (permite importar los parsers en tests)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("migrar-desde-wordpress.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
