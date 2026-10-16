import "server-only";

import { crearClientePublico } from "@/lib/supabase/publico";
import { supabaseUrl } from "@/lib/env";

/**
 * Nombre neutro a propósito: los bloqueadores de publicidad filtran las URLs
 * que contienen "instagram" y la grilla quedaría vacía en esos navegadores.
 */
export const BUCKET_INSTAGRAM = "social";

export type PublicacionInstagram = {
  id: string;
  permalink: string;
  tipo: "video" | "carrusel" | "imagen";
  fecha: string;
  imagen: string;
};

/** URL pública de una foto del feed. */
export function urlPublicacion(ruta: string): string {
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET_INSTAGRAM}/${ruta.replace(/^\/+/, "")}`;
}

/**
 * Últimas publicaciones de Instagram.
 *
 * Las imágenes están alojadas en el Storage propio, no enlazadas a Instagram:
 * las URLs de su CDN caducan en días y el feed se rompería solo (es lo que le
 * pasa hoy al sitio en WordPress). Se actualizan con `npm run instagram`.
 */
export async function ultimasPublicaciones(limite = 6): Promise<PublicacionInstagram[]> {
  const supabase = crearClientePublico();

  const { data, error } = await supabase
    .from("config")
    .select("valor")
    .eq("clave", "instagram_feed")
    .maybeSingle();

  if (error || !data) return [];

  const valor = data.valor as { publicaciones?: PublicacionInstagram[] } | null;
  return (valor?.publicaciones ?? []).slice(0, limite);
}
