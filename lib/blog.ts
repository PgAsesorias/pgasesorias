import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Artículos del blog.
 *
 * Viven como archivos en `contenido/blog/` y no en la base: son pocos, cambian
 * poco y así viajan con el repositorio. Vienen migrados del WordPress anterior
 * conservando slug, título y fecha, porque **ya están indexados en Google**.
 */

const CARPETA = join(process.cwd(), "contenido", "blog");

export type ResumenArticulo = {
  slug: string;
  titulo: string;
  resumen: string;
  fecha: string;
  actualizado: string;
  portada: string | null;
  portadaAlt: string;
  categorias: string[];
  etiquetas: string[];
};

export type Articulo = ResumenArticulo & { contenido: string };

export function listarArticulos(): ResumenArticulo[] {
  try {
    return JSON.parse(readFileSync(join(CARPETA, "indice.json"), "utf8")) as ResumenArticulo[];
  } catch {
    return [];
  }
}

export function obtenerArticulo(slug: string): Articulo | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return JSON.parse(readFileSync(join(CARPETA, `${slug}.json`), "utf8")) as Articulo;
  } catch {
    return null;
  }
}

/** Minutos de lectura, estimados en 200 palabras por minuto. */
export function minutosDeLectura(contenido: string): number {
  const palabras = contenido.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
