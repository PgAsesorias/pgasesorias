import "server-only";

import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoPublicacion, Vehiculo, VehiculoFoto } from "@/lib/database.types";

export type VehiculoAdmin = Vehiculo & { fotos: VehiculoFoto[] };

/**
 * Lista TODOS los vehículos, incluidos los borradores.
 * Usa el cliente con sesión: la política de RLS deja ver los borradores solo a
 * quien está en admin_users.
 */
export async function listarParaAdmin(
  filtros: { estado?: EstadoPublicacion | "todos"; q?: string } = {},
): Promise<VehiculoAdmin[]> {
  const supabase = await crearClienteServidor();

  let consulta = supabase
    .from("vehiculos")
    .select("*, fotos:vehiculo_fotos(*)")
    .order("updated_at", { ascending: false });

  if (filtros.estado && filtros.estado !== "todos") {
    consulta = consulta.eq("estado", filtros.estado);
  }
  if (filtros.q?.trim()) {
    consulta = consulta.ilike("titulo", `%${filtros.q.trim()}%`);
  }

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo listar los vehículos: ${error.message}`);

  return ((data ?? []) as VehiculoAdmin[]).map((v) => ({
    ...v,
    fotos: [...(v.fotos ?? [])].sort((a, b) => a.orden - b.orden),
  }));
}

/** Conteo por estado, para las pestañas del panel. */
export async function contarPorEstado(): Promise<Record<string, number>> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("vehiculos").select("estado");
  if (error) throw new Error(error.message);

  const conteo: Record<string, number> = { todos: 0 };
  for (const { estado } of data ?? []) {
    conteo[estado] = (conteo[estado] ?? 0) + 1;
    conteo.todos++;
  }
  return conteo;
}

export async function obtenerParaAdmin(id: string): Promise<VehiculoAdmin | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*, fotos:vehiculo_fotos(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const vehiculo = data as VehiculoAdmin;
  vehiculo.fotos = [...(vehiculo.fotos ?? [])].sort((a, b) => a.orden - b.orden);
  return vehiculo;
}

/** ¿Este slug ya está usado por otro vehículo? */
export async function slugOcupado(slug: string, exceptoId?: string): Promise<boolean> {
  const supabase = await crearClienteServidor();
  let consulta = supabase.from("vehiculos").select("id").eq("slug", slug);
  if (exceptoId) consulta = consulta.neq("id", exceptoId);
  const { data } = await consulta.maybeSingle();
  return data !== null;
}

/** Catálogo de opciones para los chips del formulario. */
export async function opcionesEquipamiento() {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("opciones_equipamiento")
    .select("*")
    .order("tipo")
    .order("orden");
  if (error) throw new Error(error.message);
  return data ?? [];
}
