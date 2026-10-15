/**
 * Lectura de variables de entorno con errores claros en español.
 * Si falta una clave, el mensaje dice exactamente qué agregar a .env.local.
 */

function requerida(nombre: string, valor: string | undefined): string {
  if (!valor || valor.trim() === "") {
    throw new Error(
      `Falta la variable de entorno ${nombre}. ` +
        `Agrégala a .env.local (copia .env.example) y reinicia el servidor. ` +
        `En Vercel: Settings > Environment Variables.`,
    );
  }
  return valor.trim();
}

/** URL del proyecto Supabase. Visible en el navegador. */
export function supabaseUrl(): string {
  return requerida("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/** Clave anónima: respeta RLS, puede ir al navegador. */
export function supabaseAnonKey(): string {
  return requerida("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Clave service_role: SALTA RLS. Solo servidor y scripts locales. */
export function supabaseServiceRoleKey(): string {
  return requerida("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Host del proyecto Supabase (para next/image). */
export function supabaseHost(): string {
  return new URL(supabaseUrl()).host;
}
