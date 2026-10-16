/**
 * Trae las últimas publicaciones de Instagram y las deja alojadas en el propio
 * Storage del sitio.
 *
 *   node --env-file=.env.local scripts/sincronizar-instagram.ts
 *
 * Por qué no se enlazan directo desde Instagram: las URLs de su CDN vienen
 * firmadas y caducan en días, así que el feed se rompería solo (es justo lo que
 * le pasa hoy al sitio en WordPress). Acá se descargan, se convierten a WebP
 * cuadrado y se suben al bucket "instagram"; la lista queda en config.
 *
 * Fuente actual: el feed ya renderizado en pgasesorias.cl (plugin Smash Balloon).
 * Se abre con un navegador real porque el feed se arma con JavaScript. Las
 * imágenes se bajan del propio servidor de WordPress (el plugin guarda copias
 * locales); el CDN de Instagram responde 403 a cualquier descarga directa.
 * Cuando ese sitio se apague, reemplazar `leerPublicaciones()` por la
 * Instagram Graph API (upgrade v2 nº 18), que usa un token revocable.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { chromium } from "playwright";

const WP_URL = (process.env.WP_URL ?? "https://pgasesorias.cl").replace(/\/$/, "");
// Nombre neutro a propósito: los bloqueadores de publicidad filtran cualquier
// URL que contenga "instagram" y dejarían la grilla en blanco.
const BUCKET = "social";
const MAX_PUBLICACIONES = 12;
const LADO = 800;

type Publicacion = {
  id: string;
  permalink: string;
  tipo: "video" | "carrusel" | "imagen";
  fecha: string;
  imagen: string; // ruta dentro del bucket
};

type PublicacionCruda = {
  id: string;
  permalink: string;
  tipo: Publicacion["tipo"];
  fecha: number;
  imagen: Buffer;
};

/** Abre el sitio en un navegador, lee el feed y baja las fotos locales. */
async function leerPublicaciones(): Promise<PublicacionCruda[]> {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1400, height: 1000 } });

  await pagina.goto(WP_URL, { waitUntil: "networkidle", timeout: 60000 });
  await pagina.waitForSelector(".sbi_item", { timeout: 30000 });
  await pagina.evaluate(() => document.querySelector("#sbi_images")?.scrollIntoView({ block: "center" }));
  await pagina.waitForTimeout(3000);

  const datos = await pagina.$$eval(".sbi_item", (nodos) =>
    nodos.map((n) => {
      // La foto de la publicación, no los emojis del texto.
      const imgs = [...n.querySelectorAll("img")]
        .map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src)
        .filter((src) => src.includes("sb-instagram-feed-images"));
      return {
        permalink: n.querySelector<HTMLAnchorElement>("a.sbi_photo")?.href ?? "",
        src: imgs[0] ?? "",
        respaldo: n.querySelector<HTMLAnchorElement>("a.sbi_photo")?.dataset.fullRes ?? "",
        clases: n.className,
        fecha: Number(n.getAttribute("data-date") ?? 0),
      };
    }),
  );

  await navegador.close();

  const vistos = new Set<string>();
  const salida: PublicacionCruda[] = [];

  for (const d of datos) {
    const m = d.permalink.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (!m || !d.src) continue;
    const id = m[1];
    if (vistos.has(id)) continue;

    // El plugin guarda varias resoluciones; se prueba la mayor primero.
    const candidatas = [
      d.src.replace(/low\.webp$/, "full.webp"),
      d.src,
      d.src.replace(/low\.webp$/, "thumb.webp"),
    ];

    let imagen: Buffer | null = null;
    for (const url of candidatas) {
      try {
        const res = await fetch(url, { headers: { Referer: WP_URL, "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) {
          imagen = buf;
          break;
        }
      } catch {
        /* se prueba la siguiente */
      }
    }
    if (!imagen) continue;

    vistos.add(id);
    salida.push({
      id,
      permalink: `https://www.instagram.com/${d.permalink.includes("/reel/") ? "reel" : "p"}/${id}/`,
      tipo: d.clases.includes("sbi_type_video")
        ? "video"
        : d.clases.includes("sbi_type_carousel")
          ? "carrusel"
          : "imagen",
      fecha: d.fecha,
      imagen,
    });
  }

  return salida.sort((a, b) => b.fecha - a.fecha).slice(0, MAX_PUBLICACIONES);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan las variables de Supabase en .env.local");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log(`\nLeyendo publicaciones desde ${WP_URL} …`);
  const publicaciones = await leerPublicaciones();
  console.log(`  ${publicaciones.length} publicaciones encontradas.\n`);

  // Bucket público (idempotente)
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
    });
    if (error) throw new Error(`No se pudo crear el bucket: ${error.message}`);
    console.log(`Bucket "${BUCKET}" creado.\n`);
  }

  const guardadas: Publicacion[] = [];

  for (const p of publicaciones) {
    try {
      // Cuadrada, como se ve en la grilla de Instagram.
      const webp = await sharp(p.imagen)
        .resize(LADO, LADO, { fit: "cover", position: "attention" })
        .webp({ quality: 80 })
        .toBuffer();

      const ruta = `${p.id}.webp`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(ruta, webp, { contentType: "image/webp", upsert: true });
      if (error) throw new Error(error.message);

      guardadas.push({
        id: p.id,
        permalink: p.permalink,
        tipo: p.tipo,
        fecha: new Date(p.fecha * 1000).toISOString(),
        imagen: ruta,
      });

      console.log(`  ✓ ${p.id} (${p.tipo}) · ${Math.round(webp.length / 1024)} KB`);
    } catch (e) {
      console.error(`  ✗ ${p.id}: ${(e as Error).message}`);
    }
  }

  const { error } = await supabase.from("config").upsert({
    clave: "instagram_feed",
    valor: { actualizado: new Date().toISOString(), publicaciones: guardadas } as never,
    descripcion: "Últimas publicaciones de Instagram alojadas en el bucket instagram.",
  });
  if (error) throw new Error(`No se pudo guardar en config: ${error.message}`);

  console.log(`\n✅ ${guardadas.length} publicaciones guardadas y listas para la home.\n`);
}

main().catch((e) => {
  console.error(`\nError: ${(e as Error).message}\n`);
  process.exit(1);
});
