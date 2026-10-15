"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor, esAdmin } from "@/lib/supabase/server";
import { esquemaVehiculo } from "@/lib/esquemas/vehiculo";
import { slugificar } from "@/lib/titulo";
import { slugOcupado } from "@/lib/admin/vehiculos";
import type { EstadoPublicacion } from "@/lib/database.types";

export type ResultadoGuardado =
  | { ok: true; id: string; slug: string; mensaje: string }
  | { ok: false; errores: Record<string, string>; mensaje?: string };

/** Toda escritura del panel pasa por acá: sin sesión de admin, no se escribe. */
async function exigirAdmin() {
  if (!(await esAdmin())) {
    throw new Error("No tienes permiso para esta acción.");
  }
}

/** Refresca las páginas públicas que muestran este vehículo. */
function revalidarPublico(slug?: string) {
  revalidatePath("/");
  revalidatePath("/vehiculos-en-venta");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/vehiculos-en-venta/${slug}`);
}

export async function guardarVehiculo(
  _previo: ResultadoGuardado | null,
  formData: FormData,
): Promise<ResultadoGuardado> {
  await exigirAdmin();

  const crudo: Record<string, unknown> = {};
  const equipamiento: string[] = [];
  const seguridad: string[] = [];

  for (const [clave, valor] of formData.entries()) {
    if (typeof valor !== "string") continue;
    if (clave === "equipamiento") equipamiento.push(valor);
    else if (clave === "seguridad") seguridad.push(valor);
    else crudo[clave] = valor;
  }

  crudo.equipamiento = equipamiento;
  crudo.seguridad = seguridad;
  crudo.revisado_pg = formData.get("revisado_pg") === "on" || formData.get("revisado_pg") === "true";
  crudo.destacado = formData.get("destacado") === "on" || formData.get("destacado") === "true";

  const analisis = esquemaVehiculo.safeParse(crudo);

  if (!analisis.success) {
    const errores: Record<string, string> = {};
    for (const asunto of analisis.error.issues) {
      const campo = String(asunto.path[0] ?? "general");
      errores[campo] ??= asunto.message;
    }
    return { ok: false, errores, mensaje: "Revisa los campos marcados." };
  }

  const datos = analisis.data;
  const slug = slugificar(datos.slug);

  if (await slugOcupado(slug, datos.id)) {
    return {
      ok: false,
      errores: { slug: "Ya existe otro vehículo con esta URL. Cámbiala." },
    };
  }

  const supabase = await crearClienteServidor();
  const fila = {
    marca: datos.marca,
    modelo: datos.modelo,
    version: datos.version,
    motor: datos.motor,
    titulo: datos.titulo,
    slug,
    precio: datos.precio,
    precio_oferta: datos.precio_oferta,
    anio: datos.anio,
    kilometraje: datos.kilometraje,
    transmision: datos.transmision,
    combustible: datos.combustible,
    traccion: datos.traccion ?? null,
    puertas: datos.puertas,
    condicion: datos.condicion ?? null,
    carroceria: datos.carroceria ?? null,
    color: datos.color,
    ubicacion: datos.ubicacion,
    equipamiento: datos.equipamiento,
    seguridad: datos.seguridad,
    descripcion: datos.descripcion,
    revisado_pg: datos.revisado_pg,
    estado: datos.estado,
    destacado: datos.destacado,
  };

  const { data, error } = datos.id
    ? await supabase.from("vehiculos").update(fila).eq("id", datos.id).select("id, slug").single()
    : await supabase.from("vehiculos").insert(fila).select("id, slug").single();

  if (error || !data) {
    return {
      ok: false,
      errores: {},
      mensaje: `No se pudo guardar: ${error?.message ?? "error desconocido"}`,
    };
  }

  // Sincronizar las fotos: lo que mandó el formulario es la verdad.
  const errorFotos = await sincronizarFotos(data.id, String(formData.get("fotos") ?? "[]"));
  if (errorFotos) {
    return { ok: false, errores: {}, mensaje: errorFotos };
  }

  revalidarPublico(data.slug);

  return {
    ok: true,
    id: data.id,
    slug: data.slug,
    mensaje: datos.estado === "borrador" ? "Guardado como borrador." : "¡Vehículo publicado!",
  };
}

type FotoEnviada = {
  id?: string;
  storage_path: string;
  orden: number;
  ancho: number | null;
  alto: number | null;
  alt: string | null;
};

/**
 * Deja en `vehiculo_fotos` exactamente las fotos que envió el formulario, en su
 * orden, y borra del Storage las que se quitaron (si no, quedarían ocupando
 * espacio para siempre).
 */
async function sincronizarFotos(vehiculoId: string, json: string): Promise<string | null> {
  let enviadas: FotoEnviada[];
  try {
    enviadas = JSON.parse(json) as FotoEnviada[];
  } catch {
    return "No se pudieron leer las fotos.";
  }

  const supabase = await crearClienteServidor();

  const { data: actuales } = await supabase
    .from("vehiculo_fotos")
    .select("id, storage_path")
    .eq("vehiculo_id", vehiculoId);

  const rutasEnviadas = new Set(enviadas.map((f) => f.storage_path));
  const sobrantes = (actuales ?? []).filter((f) => !rutasEnviadas.has(f.storage_path));

  const { error: errorBorrado } = await supabase
    .from("vehiculo_fotos")
    .delete()
    .eq("vehiculo_id", vehiculoId);
  if (errorBorrado) return `No se pudieron actualizar las fotos: ${errorBorrado.message}`;

  if (enviadas.length > 0) {
    const { error } = await supabase.from("vehiculo_fotos").insert(
      enviadas.map((f, i) => ({
        vehiculo_id: vehiculoId,
        storage_path: f.storage_path,
        orden: i,
        ancho: f.ancho,
        alto: f.alto,
        alt: f.alt,
      })),
    );
    if (error) return `No se pudieron guardar las fotos: ${error.message}`;
  }

  if (sobrantes.length > 0) {
    await supabase.storage.from("vehiculos").remove(sobrantes.map((f) => f.storage_path));
  }

  return null;
}

export async function cambiarEstadoVehiculo(id: string, estado: EstadoPublicacion) {
  await exigirAdmin();

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("vehiculos")
    .update({ estado })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) throw new Error(error.message);

  revalidarPublico(data?.slug);
  revalidatePath("/admin");
}

export async function alternarDestacado(id: string, destacado: boolean) {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("vehiculos")
    .update({ destacado })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) throw new Error(error.message);
  revalidarPublico(data?.slug);
  revalidatePath("/admin");
}

/** Duplica un vehículo como borrador, con sus fotos. */
export async function duplicarVehiculo(id: string) {
  await exigirAdmin();
  const supabase = await crearClienteServidor();

  const { data: original, error } = await supabase
    .from("vehiculos")
    .select("*, fotos:vehiculo_fotos(*)")
    .eq("id", id)
    .single();

  if (error || !original) throw new Error("No se encontró el vehículo a duplicar.");

  const {
    id: _id,
    created_at: _c,
    updated_at: _u,
    publicado_at: _p,
    wp_id: _w,
    vistas: _v,
    fotos,
    ...resto
  } = original as typeof original & { fotos: Array<{ storage_path: string; orden: number; ancho: number | null; alto: number | null; alt: string | null }> };

  let slug = `${resto.slug}-copia`;
  let intento = 2;
  while (await slugOcupado(slug)) slug = `${resto.slug}-copia-${intento++}`;

  const { data: copia, error: errorCopia } = await supabase
    .from("vehiculos")
    .insert({ ...resto, slug, titulo: `${resto.titulo} (copia)`, estado: "borrador", destacado: false })
    .select("id")
    .single();

  if (errorCopia || !copia) throw new Error(errorCopia?.message ?? "No se pudo duplicar.");

  if (fotos?.length) {
    await supabase.from("vehiculo_fotos").insert(
      fotos.map((f) => ({
        vehiculo_id: copia.id,
        storage_path: f.storage_path,
        orden: f.orden,
        ancho: f.ancho,
        alto: f.alto,
        alt: f.alt,
      })),
    );
  }

  revalidatePath("/admin");
  redirect(`/admin/vehiculos/${copia.id}`);
}

export async function eliminarVehiculo(id: string) {
  await exigirAdmin();
  const supabase = await crearClienteServidor();

  const { data: vehiculo } = await supabase
    .from("vehiculos")
    .select("slug, fotos:vehiculo_fotos(storage_path)")
    .eq("id", id)
    .maybeSingle();

  const rutas = (vehiculo?.fotos ?? []).map((f: { storage_path: string }) => f.storage_path);

  const { error } = await supabase.from("vehiculos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Las fotos del Storage no se borran solas al borrar la fila.
  if (rutas.length > 0) {
    await supabase.storage.from("vehiculos").remove(rutas);
  }

  revalidarPublico(vehiculo?.slug);
  revalidatePath("/admin");
}
