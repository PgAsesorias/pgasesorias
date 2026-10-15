import "server-only";

import { crearClienteServidor } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/env";
import type {
  Combustible,
  Condicion,
  Transmision,
  Vehiculo,
  VehiculoFoto,
} from "@/lib/database.types";

export const BUCKET_FOTOS = "vehiculos";

/** Estados que el público puede ver (borrador queda fuera por RLS). */
export const ESTADOS_PUBLICOS = ["publicado", "reservado", "vendido"] as const;

export type OrdenCatalogo =
  | "recientes"
  | "precio-asc"
  | "precio-desc"
  | "km-asc"
  | "anio-desc";

export type FiltrosVehiculos = {
  marca?: string;
  condicion?: Condicion;
  anio?: number;
  anioMin?: number;
  anioMax?: number;
  precioMin?: number;
  precioMax?: number;
  transmision?: Transmision;
  combustible?: Combustible;
  /** Búsqueda libre sobre el título. */
  q?: string;
  /** Solo los que tienen informe "Revisado por PG". */
  revisadoPg?: boolean;
  orden?: OrdenCatalogo;
  pagina?: number;
  porPagina?: number;
};

export type VehiculoConFotos = Vehiculo & { fotos: VehiculoFoto[] };

export type ResultadoCatalogo = {
  vehiculos: VehiculoConFotos[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
};

/** URL pública de una foto del bucket "vehiculos". */
export function urlFoto(storagePath: string): string {
  const limpio = storagePath.replace(/^\/+/, "");
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET_FOTOS}/${limpio}`;
}

/** Portada: la foto con orden más bajo (0 por convención). */
export function fotoPortada(vehiculo: VehiculoConFotos): VehiculoFoto | null {
  if (vehiculo.fotos.length === 0) return null;
  return [...vehiculo.fotos].sort((a, b) => a.orden - b.orden)[0] ?? null;
}

/** Precio que se le muestra al cliente: la oferta si existe. */
export function precioVigente(vehiculo: Pick<Vehiculo, "precio" | "precio_oferta">): number {
  return vehiculo.precio_oferta ?? vehiculo.precio;
}

const SELECT_CON_FOTOS = "*, fotos:vehiculo_fotos(*)";

/**
 * Lista vehículos visibles al público, con filtros y paginación.
 * Los borradores quedan fuera por RLS y por el filtro de estado.
 */
export async function listarVehiculos(
  filtros: FiltrosVehiculos = {},
): Promise<ResultadoCatalogo> {
  const {
    marca,
    condicion,
    anio,
    anioMin,
    anioMax,
    precioMin,
    precioMax,
    transmision,
    combustible,
    q,
    revisadoPg,
    orden = "recientes",
    pagina = 1,
    porPagina = 12,
  } = filtros;

  const supabase = await crearClienteServidor();

  let consulta = supabase
    .from("vehiculos")
    .select(SELECT_CON_FOTOS, { count: "exact" })
    .in("estado", [...ESTADOS_PUBLICOS]);

  if (marca) consulta = consulta.ilike("marca", marca);
  if (condicion) consulta = consulta.eq("condicion", condicion);
  if (anio) consulta = consulta.eq("anio", anio);
  if (anioMin) consulta = consulta.gte("anio", anioMin);
  if (anioMax) consulta = consulta.lte("anio", anioMax);
  if (precioMin) consulta = consulta.gte("precio", precioMin);
  if (precioMax) consulta = consulta.lte("precio", precioMax);
  if (transmision) consulta = consulta.eq("transmision", transmision);
  if (combustible) consulta = consulta.eq("combustible", combustible);
  if (revisadoPg) consulta = consulta.eq("revisado_pg", true);
  if (q?.trim()) consulta = consulta.ilike("titulo", `%${q.trim()}%`);

  switch (orden) {
    case "precio-asc":
      consulta = consulta.order("precio", { ascending: true });
      break;
    case "precio-desc":
      consulta = consulta.order("precio", { ascending: false });
      break;
    case "km-asc":
      consulta = consulta.order("kilometraje", { ascending: true });
      break;
    case "anio-desc":
      consulta = consulta.order("anio", { ascending: false });
      break;
    default:
      // Primero los destacados, luego lo más nuevo.
      consulta = consulta
        .order("destacado", { ascending: false })
        .order("publicado_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
  }

  const porPaginaSeguro = Math.min(Math.max(porPagina, 1), 48);
  const paginaSegura = Math.max(pagina, 1);
  const desde = (paginaSegura - 1) * porPaginaSeguro;

  const { data, error, count } = await consulta.range(desde, desde + porPaginaSeguro - 1);

  if (error) {
    throw new Error(`No se pudo listar los vehículos: ${error.message}`);
  }

  const total = count ?? 0;

  return {
    vehiculos: (data ?? []) as VehiculoConFotos[],
    total,
    pagina: paginaSegura,
    porPagina: porPaginaSeguro,
    totalPaginas: Math.max(Math.ceil(total / porPaginaSeguro), 1),
  };
}

/** Un vehículo por su slug, con las fotos ordenadas. Null si no existe. */
export async function obtenerVehiculoPorSlug(slug: string): Promise<VehiculoConFotos | null> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("vehiculos")
    .select(SELECT_CON_FOTOS)
    .eq("slug", slug)
    .in("estado", [...ESTADOS_PUBLICOS])
    .maybeSingle();

  if (error) throw new Error(`No se pudo obtener el vehículo ${slug}: ${error.message}`);
  if (!data) return null;

  const vehiculo = data as VehiculoConFotos;
  vehiculo.fotos = [...(vehiculo.fotos ?? [])].sort((a, b) => a.orden - b.orden);
  return vehiculo;
}

/** Slugs de todos los vehículos visibles (sitemap y generateStaticParams). */
export async function listarSlugsPublicados(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("vehiculos")
    .select("slug, updated_at")
    .in("estado", [...ESTADOS_PUBLICOS])
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`No se pudo listar los slugs: ${error.message}`);
  return data ?? [];
}

/**
 * Vehículo anterior y siguiente para la navegación de la ficha.
 * El orden es por fecha de publicación, igual que el catálogo.
 */
export async function obtenerVecinos(
  vehiculo: Pick<Vehiculo, "id" | "publicado_at" | "created_at">,
): Promise<{ anterior: Vehiculo | null; siguiente: Vehiculo | null }> {
  const supabase = await crearClienteServidor();
  const referencia = vehiculo.publicado_at ?? vehiculo.created_at;

  const [{ data: siguiente }, { data: anterior }] = await Promise.all([
    // Siguiente = publicado justo antes (más abajo en el catálogo).
    supabase
      .from("vehiculos")
      .select("*")
      .in("estado", [...ESTADOS_PUBLICOS])
      .lt("publicado_at", referencia)
      .order("publicado_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Anterior = publicado justo después.
    supabase
      .from("vehiculos")
      .select("*")
      .in("estado", [...ESTADOS_PUBLICOS])
      .gt("publicado_at", referencia)
      .order("publicado_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    anterior: (anterior as Vehiculo | null) ?? null,
    siguiente: (siguiente as Vehiculo | null) ?? null,
  };
}

/**
 * "Otros vehículos en venta": prioriza los de precio parecido,
 * excluyendo el que se está viendo.
 */
export async function obtenerRelacionados(
  vehiculo: Pick<Vehiculo, "id" | "precio" | "precio_oferta" | "carroceria">,
  limite = 3,
): Promise<VehiculoConFotos[]> {
  const supabase = await crearClienteServidor();
  const precio = precioVigente(vehiculo);

  const { data, error } = await supabase
    .from("vehiculos")
    .select(SELECT_CON_FOTOS)
    .in("estado", [...ESTADOS_PUBLICOS])
    .neq("id", vehiculo.id)
    .gte("precio", Math.round(precio * 0.6))
    .lte("precio", Math.round(precio * 1.4))
    .limit(limite);

  if (error) throw new Error(`No se pudo obtener los relacionados: ${error.message}`);

  const cercanos = (data ?? []) as VehiculoConFotos[];
  if (cercanos.length >= limite) return cercanos.slice(0, limite);

  // Si no alcanzan, completar con los más recientes.
  const { data: extra } = await supabase
    .from("vehiculos")
    .select(SELECT_CON_FOTOS)
    .in("estado", [...ESTADOS_PUBLICOS])
    .neq("id", vehiculo.id)
    .order("publicado_at", { ascending: false, nullsFirst: false })
    .limit(limite * 2);

  const vistos = new Set(cercanos.map((v) => v.id));
  for (const v of ((extra ?? []) as VehiculoConFotos[])) {
    if (cercanos.length >= limite) break;
    if (!vistos.has(v.id)) {
      cercanos.push(v);
      vistos.add(v.id);
    }
  }

  return cercanos.slice(0, limite);
}

/** Marcas con su conteo, para el filtro del catálogo. */
export async function contarPorMarca(): Promise<Array<{ marca: string; total: number }>> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("vehiculos")
    .select("marca")
    .in("estado", [...ESTADOS_PUBLICOS]);

  if (error) throw new Error(`No se pudo contar por marca: ${error.message}`);

  const conteo = new Map<string, number>();
  for (const { marca } of data ?? []) {
    conteo.set(marca, (conteo.get(marca) ?? 0) + 1);
  }

  return [...conteo.entries()]
    .map(([marca, total]) => ({ marca, total }))
    .sort((a, b) => a.marca.localeCompare(b.marca, "es"));
}

/** Años disponibles con su conteo, para el filtro del catálogo. */
export async function contarPorAnio(): Promise<Array<{ anio: number; total: number }>> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("vehiculos")
    .select("anio")
    .in("estado", [...ESTADOS_PUBLICOS]);

  if (error) throw new Error(`No se pudo contar por año: ${error.message}`);

  const conteo = new Map<number, number>();
  for (const { anio } of data ?? []) {
    conteo.set(anio, (conteo.get(anio) ?? 0) + 1);
  }

  return [...conteo.entries()]
    .map(([anio, total]) => ({ anio, total }))
    .sort((a, b) => b.anio - a.anio);
}

/** Catálogo de opciones de equipamiento y seguridad. */
export async function listarOpcionesEquipamiento() {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("opciones_equipamiento")
    .select("*")
    .order("tipo")
    .order("orden");

  if (error) throw new Error(`No se pudo listar el equipamiento: ${error.message}`);
  return data ?? [];
}
