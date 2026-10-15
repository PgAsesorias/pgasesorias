import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * Cliente con service_role: SALTA RLS.
 * Solo para código de servidor que ya verificó permisos (o scripts locales).
 * Nunca importar desde un componente del navegador.
 */
export function crearClienteAdmin() {
  return createClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
