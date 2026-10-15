/**
 * Validación de coherencia de un vehículo.
 *
 * El sitio actual publica autos cuyo título contradice sus campos (un título dice
 * "Diésel ... Mecánico" y los campos dicen Gasolina / Automática). Esto detecta
 * esos casos antes de publicar. Se usa en el panel de administración y en la
 * auditoría de los datos migrados.
 *
 * No depende de Supabase ni de React: es una función pura y testeable.
 */

import type { Combustible, Traccion, Transmision } from "./database.types";

export type Severidad = "error" | "aviso";

export type Hallazgo = {
  campo: string;
  severidad: Severidad;
  mensaje: string;
  /** Valor que sugiere el título, cuando se puede deducir. */
  sugerencia?: string | number;
};

export type VehiculoVerificable = {
  titulo?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anio?: number | null;
  kilometraje?: number | null;
  transmision?: Transmision | null;
  combustible?: Combustible | null;
  traccion?: Traccion | null;
  puertas?: number | null;
  precio?: number | null;
  precio_oferta?: number | null;
  fotos?: unknown[] | null;
};

function sinTildes(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Lo que el título afirma sobre el vehículo. */
export type DatosDelTitulo = {
  transmision: Transmision | null;
  combustible: Combustible | null;
  traccion: Traccion | null;
  puertas: number | null;
  anio: number | null;
};

export function leerTitulo(titulo: string): DatosDelTitulo {
  const t = sinTildes(titulo);

  let transmision: Transmision | null = null;
  if (/\bautomatic[oa]\b|\bat\b|\bdsg\b|\btiptronic\b/.test(t)) transmision = "Automática";
  // "MT" y "mecánico" son manual; se evalúa después para que gane lo explícito.
  if (/\bmecanic[oa]\b|\bmanual\b|\bmt\b/.test(t)) transmision = "Manual";

  let combustible: Combustible | null = null;
  if (/\bdiesel\b|\bhdi\b|\btdi\b|\bcrdi\b/.test(t)) combustible = "Diésel";
  else if (/\bbencinero\b|\bgasolina\b|\bnafta\b/.test(t)) combustible = "Gasolina";
  else if (/\bhibrid[oa]\b|\bhev\b/.test(t)) combustible = "Híbrido";
  else if (/\belectric[oa]\b|\bev\b/.test(t)) combustible = "Eléctrico";

  let traccion: Traccion | null = null;
  if (/\b4\s*[x×]\s*4\b/.test(t)) traccion = "4x4";
  else if (/\b4\s*[x×]\s*2\b/.test(t)) traccion = "4x2";
  else if (/\bawd\b/.test(t)) traccion = "AWD";

  const puertas = Number(t.match(/(\d)\s*puertas?/)?.[1] ?? NaN);
  const anio = Number(t.match(/ano\s+(\d{4})/)?.[1] ?? NaN);

  return {
    transmision,
    combustible,
    traccion,
    puertas: Number.isFinite(puertas) ? puertas : null,
    anio: Number.isFinite(anio) ? anio : null,
  };
}

/** Kilometraje anual que se considera alto para un uso particular en Chile. */
const KM_POR_ANIO_ALTO = 40_000;

/**
 * Revisa un vehículo y devuelve los problemas encontrados.
 * `error` impide publicar; `aviso` solo advierte.
 */
export function verificarVehiculo(
  v: VehiculoVerificable,
  hoy: Date = new Date(),
): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  const anioActual = hoy.getFullYear();

  // ── Título vs campos ──────────────────────────────────────────────
  if (v.titulo) {
    const t = leerTitulo(v.titulo);

    if (t.transmision && v.transmision && t.transmision !== v.transmision) {
      hallazgos.push({
        campo: "transmision",
        severidad: "error",
        mensaje: `El título dice ${t.transmision === "Manual" ? "Mecánico" : "Automático"} pero el campo dice ${v.transmision}.`,
        sugerencia: t.transmision,
      });
    }

    if (t.combustible && v.combustible && t.combustible !== v.combustible) {
      hallazgos.push({
        campo: "combustible",
        severidad: "error",
        mensaje: `El título dice ${t.combustible} pero el campo dice ${v.combustible}.`,
        sugerencia: t.combustible,
      });
    }

    if (t.traccion && v.traccion && t.traccion !== v.traccion) {
      hallazgos.push({
        campo: "traccion",
        severidad: "error",
        mensaje: `El título dice tracción ${t.traccion.toUpperCase()} pero el campo dice ${v.traccion}.`,
        sugerencia: t.traccion,
      });
    } else if (t.traccion && !v.traccion) {
      hallazgos.push({
        campo: "traccion",
        severidad: "aviso",
        mensaje: `El título dice tracción ${t.traccion.toUpperCase()} y el campo está vacío.`,
        sugerencia: t.traccion,
      });
    }

    if (t.puertas && v.puertas && t.puertas !== v.puertas) {
      hallazgos.push({
        campo: "puertas",
        severidad: "error",
        mensaje: `El título dice ${t.puertas} puertas pero el campo dice ${v.puertas}.`,
        sugerencia: t.puertas,
      });
    }

    if (t.anio && v.anio && t.anio !== v.anio) {
      hallazgos.push({
        campo: "anio",
        severidad: "error",
        mensaje: `El título dice Año ${t.anio} pero el campo dice ${v.anio}.`,
        sugerencia: t.anio,
      });
    }
  }

  // ── Año ───────────────────────────────────────────────────────────
  if (v.anio != null) {
    if (v.anio < 1950 || v.anio > anioActual + 1) {
      hallazgos.push({
        campo: "anio",
        severidad: "error",
        mensaje: `El año ${v.anio} está fuera de rango (1950–${anioActual + 1}).`,
      });
    } else if (v.anio > anioActual) {
      hallazgos.push({
        campo: "anio",
        severidad: "aviso",
        mensaje: `El año ${v.anio} es del modelo siguiente: confirmar que no es un error de carga.`,
      });
    }
  }

  // ── Precio ────────────────────────────────────────────────────────
  if (v.precio != null && v.precio <= 0) {
    hallazgos.push({ campo: "precio", severidad: "error", mensaje: "El precio debe ser mayor que 0." });
  }

  if (v.precio_oferta != null && v.precio != null) {
    if (v.precio_oferta >= v.precio) {
      hallazgos.push({
        campo: "precio_oferta",
        severidad: "error",
        mensaje: "El precio de oferta tiene que ser menor que el precio normal.",
      });
    } else if (v.precio_oferta < v.precio * 0.5) {
      hallazgos.push({
        campo: "precio_oferta",
        severidad: "aviso",
        mensaje: "El precio de oferta es menos de la mitad del precio normal: revisar que no falte un dígito.",
      });
    }
  }

  // ── Kilometraje ───────────────────────────────────────────────────
  if (v.kilometraje != null) {
    if (v.kilometraje < 0) {
      hallazgos.push({ campo: "kilometraje", severidad: "error", mensaje: "El kilometraje no puede ser negativo." });
    } else if (v.anio != null && v.anio <= anioActual) {
      const anios = Math.max(anioActual - v.anio, 1);
      if (v.kilometraje / anios > KM_POR_ANIO_ALTO) {
        hallazgos.push({
          campo: "kilometraje",
          severidad: "aviso",
          mensaje: `${Math.round(v.kilometraje / anios).toLocaleString("es-CL")} km por año es alto para un ${v.anio}: confirmar el kilometraje.`,
        });
      }
      if (v.kilometraje === 0 && v.anio < anioActual) {
        hallazgos.push({
          campo: "kilometraje",
          severidad: "aviso",
          mensaje: "Kilometraje 0 en un vehículo usado: ¿falta completarlo?",
        });
      }
    }
  }

  // ── Fotos ─────────────────────────────────────────────────────────
  if (v.fotos) {
    if (v.fotos.length === 0) {
      hallazgos.push({ campo: "fotos", severidad: "error", mensaje: "El vehículo no tiene fotos." });
    } else if (v.fotos.length < 5) {
      hallazgos.push({
        campo: "fotos",
        severidad: "aviso",
        mensaje: `Solo ${v.fotos.length} foto(s): los avisos con 8 o más fotos reciben bastantes más consultas.`,
      });
    }
  }

  return hallazgos;
}

/** ¿Se puede publicar? (sin errores; los avisos no bloquean) */
export function puedePublicarse(hallazgos: Hallazgo[]): boolean {
  return !hallazgos.some((h) => h.severidad === "error");
}
