"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * Cliente de Supabase para componentes del navegador (login, subida de fotos).
 * Usa la clave anónima: todo lo que haga pasa por RLS.
 */
export function crearClienteNavegador() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
