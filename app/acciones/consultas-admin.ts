"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor, esAdmin } from "@/lib/supabase/server";

/**
 * Marca una consulta como atendida (o la devuelve a pendientes).
 *
 * `estado` solo admite los valores del embudo definido en el esquema
 * (nuevo, contactado, en_proceso, ganado, perdido): atendida ⇒ contactado.
 */
export async function marcarAtendida(id: string, atendida: boolean) {
  if (!(await esAdmin())) throw new Error("Sin permiso.");

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("consultas")
    .update({ atendida, estado: atendida ? "contactado" : "nuevo" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/consultas");
}
