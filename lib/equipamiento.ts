import type { OpcionEquipamiento } from "./database.types";

/**
 * Etiqueta legible de una opción de equipamiento o seguridad.
 *
 * Si el slug no está en el catálogo (dato viejo o escrito distinto), se arma un
 * texto presentable a partir del propio slug: el cliente nunca debe ver algo
 * como "camara-retroceso" en la ficha.
 */
export function etiquetaOpcion(slug: string, opciones: OpcionEquipamiento[]): string {
  const encontrada = opciones.find((o) => o.slug === slug);
  if (encontrada) return encontrada.label;

  const texto = slug.replace(/[-_]+/g, " ").trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
