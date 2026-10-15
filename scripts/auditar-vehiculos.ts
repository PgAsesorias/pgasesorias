/**
 * Audita los vehículos guardados con el validador de coherencia.
 *
 *   node --env-file=.env.local scripts/auditar-vehiculos.ts
 *
 * Solo lee. Muestra, por vehículo, los errores (impiden publicar) y los avisos.
 */

import { createClient } from "@supabase/supabase-js";
import { verificarVehiculo, puedePublicarse } from "../lib/coherencia.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from("vehiculos")
  .select("slug, titulo, anio, kilometraje, transmision, combustible, traccion, puertas, precio, precio_oferta, estado, vehiculo_fotos(id)")
  .order("publicado_at", { ascending: false });

if (error) throw new Error(error.message);

let errores = 0;
let avisos = 0;

for (const v of data ?? []) {
  const hallazgos = verificarVehiculo({ ...v, fotos: v.vehiculo_fotos ?? [] });
  const nErr = hallazgos.filter((h) => h.severidad === "error").length;
  const nAvi = hallazgos.length - nErr;
  errores += nErr;
  avisos += nAvi;

  const marca = nErr > 0 ? "✗" : nAvi > 0 ? "!" : "✓";
  console.log(`\n${marca} ${v.titulo}`);
  console.log(`   /${v.slug}  ·  ${v.estado}  ·  ${v.vehiculo_fotos?.length ?? 0} fotos`);
  for (const h of hallazgos) {
    console.log(`   ${h.severidad === "error" ? "✗" : "!"} [${h.campo}] ${h.mensaje}`);
  }
  if (nErr > 0 && v.estado !== "borrador") {
    console.log(`   → publicado con ${nErr} error(es): corregir antes del lanzamiento.`);
  }
  void puedePublicarse(hallazgos);
}

console.log(`\n${(data ?? []).length} vehículos · ${errores} error(es) · ${avisos} aviso(s)\n`);
