import { z } from "zod";

/**
 * Validación del formulario de vehículos. Se usa en el navegador (mientras se
 * escribe) y en el servidor (al guardar): las mismas reglas en los dos lados.
 */

const anioActual = new Date().getFullYear();

const numeroDesdeTexto = (etiqueta: string) =>
  z.preprocess(
    (v) => {
      if (typeof v === "number") return v;
      const limpio = String(v ?? "").replace(/[^\d]/g, "");
      return limpio === "" ? undefined : Number(limpio);
    },
    z.number({ error: `Escribe ${etiqueta}.` }).int(),
  );

const opcionalDesdeTexto = z.preprocess(
  (v) => {
    const limpio = String(v ?? "").replace(/[^\d]/g, "");
    return limpio === "" ? null : Number(limpio);
  },
  z.number().int().nullable(),
);

/**
 * Lista cerrada opcional: un `<select>` vacío manda "" y el enum lo rechazaría.
 * Acá "" se convierte en null antes de validar.
 */
const enumOpcional = <const T extends readonly [string, ...string[]]>(valores: T) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.enum(valores).nullable(),
  );

const textoOpcional = z.preprocess(
  (v) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s;
  },
  z.string().nullable(),
);

export const esquemaVehiculo = z
  .object({
    id: z.string().uuid().optional(),

    // Datos básicos
    marca: z.string().trim().min(1, "Escribe la marca.").max(60),
    modelo: z.string().trim().min(1, "Escribe el modelo.").max(80),
    version: textoOpcional,
    motor: textoOpcional,
    titulo: z.string().trim().min(5, "El título es muy corto.").max(250),
    slug: z
      .string()
      .trim()
      .min(3, "El slug es muy corto.")
      .max(220)
      .regex(/^[a-z0-9-]+$/, "El slug solo admite minúsculas, números y guiones."),

    // Precio
    precio: numeroDesdeTexto("el precio").refine((v) => v > 0, "El precio debe ser mayor que 0."),
    precio_oferta: opcionalDesdeTexto,

    // Ficha técnica
    anio: numeroDesdeTexto("el año")
      .refine((v) => v >= 1950, "El año no puede ser anterior a 1950.")
      .refine((v) => v <= anioActual + 1, `El año no puede ser posterior a ${anioActual + 1}.`),
    kilometraje: numeroDesdeTexto("el kilometraje").refine(
      (v) => v >= 0,
      "El kilometraje no puede ser negativo.",
    ),
    transmision: z.enum(["Automática", "Manual"], { error: "Elige la transmisión." }),
    combustible: z.enum(["Gasolina", "Diésel", "Híbrido", "Eléctrico"], {
      error: "Elige el combustible.",
    }),
    traccion: enumOpcional(["4x2", "4x4", "AWD"]),
    puertas: z.preprocess(
      (v) => (String(v ?? "") === "" ? null : Number(v)),
      z.number().int().min(2).max(5).nullable(),
    ),
    condicion: enumOpcional(["Nuevo", "Seminuevo", "Usado"]),
    carroceria: enumOpcional([
      "Sedán",
      "Hatchback",
      "SUV",
      "Camioneta",
      "Station Wagon",
      "Coupé",
      "Furgón",
      "Minivan",
      "Convertible",
    ]),
    color: textoOpcional,
    ubicacion: z.string().trim().min(2).max(120).default("Santiago, Chile"),

    // Equipamiento
    equipamiento: z.array(z.string()).default([]),
    seguridad: z.array(z.string()).default([]),

    // Contenido
    descripcion: textoOpcional,
    revisado_pg: z.coerce.boolean().default(false),

    // Publicación
    estado: z.enum(["borrador", "publicado", "reservado", "vendido"]).default("borrador"),
    destacado: z.coerce.boolean().default(false),
  })
  .refine((v) => v.precio_oferta == null || v.precio_oferta < v.precio, {
    path: ["precio_oferta"],
    message: "El precio de oferta tiene que ser menor que el precio normal.",
  });

export type DatosVehiculo = z.infer<typeof esquemaVehiculo>;
export type EntradaVehiculo = z.input<typeof esquemaVehiculo>;

export const TRANSMISIONES = ["Automática", "Manual"] as const;
export const COMBUSTIBLES = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"] as const;
export const TRACCIONES = ["4x2", "4x4", "AWD"] as const;
export const CONDICIONES = ["Nuevo", "Seminuevo", "Usado"] as const;
export const CARROCERIAS = [
  "Sedán",
  "Hatchback",
  "SUV",
  "Camioneta",
  "Station Wagon",
  "Coupé",
  "Furgón",
  "Minivan",
  "Convertible",
] as const;
export const ESTADOS = ["borrador", "publicado", "reservado", "vendido"] as const;

export const ETIQUETA_ESTADO: Record<(typeof ESTADOS)[number], string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  reservado: "Reservado",
  vendido: "Vendido",
};
