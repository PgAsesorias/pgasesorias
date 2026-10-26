/**
 * Migra los artículos del blog de WordPress al sitio nuevo.
 *
 *   node --env-file=.env.local scripts/migrar-blog.ts
 *
 * Estos artículos ya están indexados en Google y traen tráfico: si el sitio
 * nuevo no los sirve en la MISMA URL, se pierde ese posicionamiento. Por eso se
 * conservan tal cual el slug, el título y la fecha original.
 *
 * El contenido queda como archivos JSON en `contenido/blog/` (no en la base):
 * son 4 artículos que cambian muy de vez en cuando, y así viajan con el repo.
 * Las imágenes se descargan a public/blog/ en WebP.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const WP_URL = (process.env.WP_URL ?? "https://pgasesorias.cl").replace(/\/$/, "");
const SALIDA = "contenido/blog";
const IMAGENES = "public/blog";

type Articulo = {
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;
  fecha: string;
  actualizado: string;
  portada: string | null;
  portadaAlt: string;
  categorias: string[];
  etiquetas: string[];
};

function limpiarHtml(s: string): string {
  return s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(class|id|style|data-[a-z-]+)="[^"]*"/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function texto(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function bajarImagen(url: string, nombre: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: WP_URL } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const destino = `${IMAGENES}/${nombre}.webp`;
    await sharp(buf).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(destino);
    return `/blog/${nombre}.webp`;
  } catch {
    return null;
  }
}

async function main() {
  mkdirSync(SALIDA, { recursive: true });
  mkdirSync(IMAGENES, { recursive: true });

  const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?per_page=100&_embed=1`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`WordPress respondió ${res.status}`);

  const posts = (await res.json()) as Array<Record<string, never>>;
  console.log(`\n${posts.length} artículos encontrados.\n`);

  const indice: Array<Omit<Articulo, "contenido">> = [];

  for (const p of posts as never[]) {
    const post = p as unknown as {
      slug: string;
      date: string;
      modified: string;
      title: { rendered: string };
      excerpt: { rendered: string };
      content: { rendered: string };
      _embedded?: {
        "wp:featuredmedia"?: Array<{ source_url?: string; alt_text?: string }>;
        "wp:term"?: Array<Array<{ name: string; taxonomy: string }>>;
      };
    };

    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    const portada = media?.source_url ? await bajarImagen(media.source_url, post.slug) : null;

    // Las imágenes dentro del texto también se traen al sitio propio.
    let contenido = limpiarHtml(post.content.rendered);
    const internas = [...contenido.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    let n = 0;
    for (const url of internas) {
      if (!url.includes("pgasesorias.cl")) continue;
      const local = await bajarImagen(url, `${post.slug}-${++n}`);
      if (local) contenido = contenori(contenido, url, local);
    }

    const terminos = post._embedded?.["wp:term"] ?? [];
    const categorias = terminos.flat().filter((t) => t.taxonomy === "category").map((t) => t.name);
    const etiquetas = terminos.flat().filter((t) => t.taxonomy === "post_tag").map((t) => t.name);

    const articulo: Articulo = {
      slug: post.slug,
      titulo: texto(post.title.rendered),
      resumen: texto(post.excerpt.rendered).slice(0, 250),
      contenido,
      fecha: post.date,
      actualizado: post.modified,
      portada,
      portadaAlt: media?.alt_text || texto(post.title.rendered),
      categorias,
      etiquetas,
    };

    writeFileSync(`${SALIDA}/${post.slug}.json`, JSON.stringify(articulo, null, 2));
    const { contenido: _c, ...resumen } = articulo;
    indice.push(resumen);

    console.log(`  ✓ ${articulo.titulo.slice(0, 58)}`);
    console.log(`     /blog/${articulo.slug}  ·  portada: ${portada ? "sí" : "no"}  ·  ${n} imagen(es) interna(s)`);
  }

  indice.sort((a, b) => b.fecha.localeCompare(a.fecha));
  writeFileSync(`${SALIDA}/indice.json`, JSON.stringify(indice, null, 2));
  console.log(`\n✅ ${indice.length} artículos migrados a ${SALIDA}/\n`);
}

/** Reemplaza todas las apariciones de una URL en el HTML. */
function contenori(html: string, de: string, a: string): string {
  return html.split(de).join(a);
}

main().catch((e) => {
  console.error(`\nError: ${(e as Error).message}\n`);
  process.exit(1);
});
