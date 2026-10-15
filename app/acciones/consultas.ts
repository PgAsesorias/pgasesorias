"use server";

import { headers } from "next/headers";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";
import {
  esquemaConsulta,
  tieneContacto,
  type ResultadoEnvio,
} from "@/lib/consultas";

/** Límite simple por IP, en memoria del servidor. */
const envios = new Map<string, number[]>();
const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_VENTANA = 5;

function superaLimite(ip: string): boolean {
  const ahora = Date.now();
  const previos = (envios.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  envios.set(ip, previos);
  if (envios.size > 5000) envios.clear(); // no crecer sin límite
  return previos.length > MAX_POR_VENTANA;
}

/**
 * Guarda una consulta (lead).
 *
 * Todo contacto queda registrado: hoy el sitio depende solo de WhatsApp y no
 * queda rastro de quién escribió ni por qué vehículo.
 */
export async function enviarConsulta(
  _estadoPrevio: ResultadoEnvio | null,
  formData: FormData,
): Promise<ResultadoEnvio> {
  // Los campos propios de cada formulario llegan como "datos.patente",
  // "datos.marca"… y se agrupan en un solo objeto que se guarda en la columna
  // `datos` del lead.
  const crudo: Record<string, unknown> = {};
  const extras: Record<string, string> = {};

  for (const [clave, valor] of formData.entries()) {
    if (typeof valor !== "string") continue;
    if (clave.startsWith("datos.")) {
      const nombre = clave.slice("datos.".length);
      if (valor.trim()) extras[nombre] = valor.trim();
    } else {
      crudo[clave] = valor;
    }
  }

  if (Object.keys(extras).length > 0) crudo.datos = extras;

  // Lo escrito por el visitante, para devolverlo si algo falla.
  const escrito: Record<string, string> = {};
  for (const [clave, valor] of formData.entries()) {
    if (typeof valor === "string" && clave !== "website") escrito[clave] = valor;
  }

  // Campo trampa: si viene lleno, es un robot. Se responde ok para no darle pistas.
  if (crudo.website) return { ok: true, mensaje: "¡Gracias! Te contactaremos pronto." };

  const analisis = esquemaConsulta.safeParse(crudo);
  if (!analisis.success) {
    const errores: Record<string, string> = {};
    for (const asunto of analisis.error.issues) {
      const campo = String(asunto.path[0] ?? "general");
      if (asunto.message) errores[campo] ??= asunto.message;
    }
    return { ok: false, errores, valores: escrito };
  }

  const datos = analisis.data;

  if (!tieneContacto(datos)) {
    return {
      ok: false,
      errores: { telefono: "Déjanos un teléfono o un correo para poder responderte." },
      valores: escrito,
    };
  }

  const cabeceras = await headers();
  const ip =
    cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    cabeceras.get("x-real-ip") ??
    "desconocida";

  if (superaLimite(ip)) {
    return {
      ok: false,
      errores: {},
      mensaje: "Recibimos varios mensajes desde esta conexión. Intenta de nuevo en unos minutos.",
      valores: escrito,
    };
  }

  const supabase = crearClienteAdmin();

  // Si la consulta viene de una ficha, se asocia al vehículo.
  let vehiculoId: string | null = null;
  if (datos.vehiculo_slug) {
    const { data } = await supabase
      .from("vehiculos")
      .select("id")
      .eq("slug", datos.vehiculo_slug)
      .maybeSingle();
    vehiculoId = data?.id ?? null;
  }

  const { error } = await supabase.from("consultas").insert({
    nombre: datos.nombre,
    telefono: datos.telefono || null,
    email: datos.email || null,
    mensaje: datos.mensaje || null,
    vehiculo_id: vehiculoId,
    origen: datos.origen,
    pagina: datos.pagina || null,
    datos: (datos.datos ?? null) as Json | null,
  });

  if (error) {
    console.error("No se pudo guardar la consulta:", error.message);
    return {
      ok: false,
      errores: {},
      mensaje:
        "No pudimos enviar tu mensaje. Escríbenos por WhatsApp y te respondemos al tiro.",
      valores: escrito,
    };
  }

  // TODO (fase 7): avisar por correo a PG con Resend.

  return {
    ok: true,
    mensaje: "¡Listo! Recibimos tu mensaje y te contactamos a la brevedad.",
  };
}
