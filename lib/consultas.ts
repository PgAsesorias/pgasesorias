import { z } from "zod";

/**
 * Validación de los formularios públicos (contacto, cotizar, tasación, flota).
 * Los mensajes están en español y se muestran tal cual al visitante.
 */

export const ORIGENES = [
  "contacto",
  "cotizar",
  "vende_tu_vehiculo",
  "flota",
  "financiamiento",
  "tasacion",
  "agenda",
] as const;

export type Origen = (typeof ORIGENES)[number];

const telefonoChile = /^(\+?56)?\s?0?9?[\s.-]?\d{4}[\s.-]?\d{4}$|^\+?\d{8,15}$/;

export const esquemaConsulta = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre.")
    .max(120, "El nombre es demasiado largo."),
  telefono: z
    .string()
    .trim()
    .max(30, "El teléfono es demasiado largo.")
    .refine((v) => v === "" || telefonoChile.test(v), "Revisa el teléfono. Ej: +56 9 1234 5678")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Revisa el correo.")
    .optional()
    .or(z.literal("")),
  mensaje: z
    .string()
    .trim()
    .max(3000, "El mensaje es demasiado largo.")
    .optional()
    .or(z.literal("")),
  origen: z.enum(ORIGENES).default("contacto"),
  vehiculo_slug: z.string().trim().max(200).optional().or(z.literal("")),
  pagina: z.string().trim().max(500).optional().or(z.literal("")),
  /** Campo trampa: los humanos lo dejan vacío, los robots lo llenan. */
  website: z.string().max(0, "").optional().or(z.literal("")),
  /** Datos extra del formulario (tasación, financiamiento, flota). */
  datos: z.record(z.string(), z.unknown()).optional(),
});

export type DatosConsulta = z.input<typeof esquemaConsulta>;

/** Al menos una forma de responderle al cliente. */
export function tieneContacto(d: { telefono?: string; email?: string }): boolean {
  return Boolean(d.telefono?.trim() || d.email?.trim());
}

export type ResultadoEnvio =
  | { ok: true; mensaje: string }
  | {
      ok: false;
      errores: Record<string, string>;
      mensaje?: string;
      /**
       * Lo que el visitante ya había escrito. Se devuelve para volver a
       * pintarlo: corregir un campo no puede costarle escribir todo de nuevo.
       */
      valores?: Record<string, string>;
    };
