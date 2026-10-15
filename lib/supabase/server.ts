import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * Cliente de Supabase para Server Components, Server Actions y rutas.
 * Mantiene la sesión del usuario en cookies y respeta RLS.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesNuevas) {
        try {
          for (const { name, value, options } of cookiesNuevas) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // En Server Components no se pueden escribir cookies.
          // El middleware es el que refresca la sesión.
        }
      },
    },
  });
}

/**
 * Devuelve el usuario de la sesión actual, o null.
 * Usa getUser() (valida el token con Supabase), no getSession().
 */
export async function usuarioActual() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** ¿El usuario de la sesión está en admin_users? */
export async function esAdmin(): Promise<boolean> {
  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", sesion.user.id)
    .maybeSingle();

  return !error && data !== null;
}
