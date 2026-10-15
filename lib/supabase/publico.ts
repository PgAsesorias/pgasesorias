import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * Cliente para leer los datos públicos del sitio (catálogo, fichas, home).
 *
 * No toca cookies a propósito: así las páginas públicas se pueden generar
 * estáticamente y revalidar cada cierto tiempo (ISR), en vez de renderizarse
 * de nuevo en cada visita. Usa la clave anónima, o sea que RLS sigue aplicando
 * y los borradores quedan fuera.
 */
export function crearClientePublico() {
  return createClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
