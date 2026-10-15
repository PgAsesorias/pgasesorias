/**
 * Título SEO y slug de los vehículos.
 *
 * Formato que usa hoy el sitio y que se mantiene:
 *   {Marca} {Modelo} {Versión} {Motor} {Automático|Mecánico} {N} Puertas, Tracción {4X2|4X4}, Año {AAAA}
 *
 * Ejemplo:
 *   Toyota 4Runner Limited V6 4.0 Automático 5 Puertas, Tracción 4X4, Año 2018
 */

import type { Traccion, Transmision } from "./database.types";

export type DatosTitulo = {
  marca: string;
  modelo: string;
  version?: string | null;
  motor?: string | null;
  transmision?: Transmision | null;
  puertas?: number | null;
  traccion?: Traccion | null;
  anio?: number | null;
};

/** En el título, la transmisión se escribe Automático / Mecánico. */
export function transmisionEnTitulo(t: Transmision | null | undefined): string | null {
  if (t === "Automática") return "Automático";
  if (t === "Manual") return "Mecánico";
  return null;
}

/** 4x4 → 4X4 (como se escribe en los títulos del sitio). AWD queda igual. */
export function traccionEnTitulo(t: Traccion | null | undefined): string | null {
  if (!t) return null;
  return t === "AWD" ? "AWD" : t.toUpperCase();
}

function limpiar(v: string | null | undefined): string | null {
  const s = v?.trim();
  return s ? s.replace(/\s+/g, " ") : null;
}

/**
 * Arma el título SEO. Omite las partes que no vienen, sin dejar
 * espacios dobles ni comas colgando.
 */
export function generarTitulo(datos: DatosTitulo): string {
  const nombre = [
    limpiar(datos.marca),
    limpiar(datos.modelo),
    limpiar(datos.version),
    limpiar(datos.motor),
    transmisionEnTitulo(datos.transmision),
  ]
    .filter(Boolean)
    .join(" ");

  const partes: string[] = [];
  if (nombre) partes.push(nombre);

  if (typeof datos.puertas === "number" && datos.puertas > 0) {
    partes.push(`${datos.puertas} Puertas`);
  }

  const traccion = traccionEnTitulo(datos.traccion);
  if (traccion) partes.push(`Tracción ${traccion}`);

  if (typeof datos.anio === "number" && datos.anio > 0) {
    partes.push(`Año ${datos.anio}`);
  }

  // "Marca Modelo ... Automático" va unido al número de puertas con espacio;
  // el resto se separa con coma, igual que en el sitio actual.
  if (partes.length <= 1) return partes[0] ?? "";

  const [primera, segunda, ...resto] = partes;
  const cabeza =
    segunda && /^\d+ Puertas$/.test(segunda) ? `${primera} ${segunda}` : [primera, segunda].join(", ");

  return [cabeza, ...resto].join(", ");
}

/**
 * Slug a partir del título: sin tildes, en minúsculas y con guiones.
 * Compatible con los slugs que genera WordPress, para no romper las URLs
 * de los vehículos ya publicados.
 */
export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes y diéresis
    .replace(/[×xX]{1}(?=\d)/g, "x") // 4×2 → 4x2
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // todo lo demás pasa a guion
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Slug directamente desde los datos del vehículo. */
export function generarSlug(datos: DatosTitulo): string {
  return slugificar(generarTitulo(datos));
}
