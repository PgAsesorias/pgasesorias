/**
 * Verifica que el proyecto de Supabase quedó bien configurado.
 *
 *   node --env-file=.env.local scripts/verificar-supabase.ts
 *
 * Revisa: conexión, tablas del schema, tablas de los upgrades, buckets,
 * semillas de opciones_equipamiento/servicios/config y usuarios admin.
 * No escribe nada: solo lee.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ok = (m: string) => console.log(`  ✓ ${m}`);
const falla = (m: string) => console.log(`  ✗ ${m}`);
const aviso = (m: string) => console.log(`  ! ${m}`);

let errores = 0;

function faltante(nombre: string, valor: string | undefined): boolean {
  if (!valor) {
    falla(`falta ${nombre} en .env.local`);
    errores++;
    return true;
  }
  return false;
}

async function main() {
  console.log("\nVerificando Supabase…\n");

  if (
    faltante("NEXT_PUBLIC_SUPABASE_URL", url) ||
    faltante("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon)
  ) {
    process.exit(1);
  }

  console.log(`Proyecto: ${url}\n`);

  // 1. Lectura pública (clave anónima, pasa por RLS)
  const publico = createClient(url!, anon!, { auth: { persistSession: false } });

  console.log("Tablas del schema base:");
  const tablasBase = [
    "vehiculos",
    "vehiculo_fotos",
    "opciones_equipamiento",
    "consultas",
    "admin_users",
  ] as const;

  for (const tabla of tablasBase) {
    const { error } = await publico.from(tabla).select("*", { head: true, count: "exact" });
    // 42P01 = la tabla no existe. Un error de permisos significa que sí existe.
    if (error && /does not exist|42P01/i.test(`${error.message} ${error.code}`)) {
      falla(`${tabla} no existe → ejecuta supabase/schema.sql`);
      errores++;
    } else {
      ok(tabla);
    }
  }

  console.log("\nTablas de los upgrades:");
  const tablasUpgrade = ["config", "servicios", "reservas", "eventos", "alertas"] as const;
  for (const tabla of tablasUpgrade) {
    const { error } = await publico.from(tabla).select("*", { head: true, count: "exact" });
    if (error && /does not exist|42P01/i.test(`${error.message} ${error.code}`)) {
      falla(`${tabla} no existe → ejecuta supabase/upgrades.sql`);
      errores++;
    } else {
      ok(tabla);
    }
  }

  console.log("\nColumnas de los upgrades en vehiculos:");
  const { error: errCols } = await publico
    .from("vehiculos")
    .select("revisado_pg, carroceria, informe_path, vistas", { head: true });
  if (errCols) {
    falla(`faltan columnas nuevas en vehiculos (${errCols.message}) → ejecuta supabase/upgrades.sql`);
    errores++;
  } else {
    ok("revisado_pg, carroceria, informe_path, vistas");
  }

  console.log("\nSemillas:");
  const { count: nOpciones } = await publico
    .from("opciones_equipamiento")
    .select("*", { head: true, count: "exact" });
  if ((nOpciones ?? 0) >= 18) ok(`opciones_equipamiento: ${nOpciones} opciones`);
  else {
    aviso(`opciones_equipamiento tiene ${nOpciones ?? 0} filas (se esperaban 18)`);
  }

  const { count: nServicios } = await publico
    .from("servicios")
    .select("*", { head: true, count: "exact" });
  if ((nServicios ?? 0) >= 8) ok(`servicios: ${nServicios}`);
  else aviso(`servicios tiene ${nServicios ?? 0} filas (se esperaban 8)`);

  const { data: config } = await publico.from("config").select("clave");
  const claves = (config ?? []).map((c) => c.clave);
  for (const clave of ["financiamiento", "contadores_home", "agenda"]) {
    if (claves.includes(clave)) ok(`config: ${clave}`);
    else aviso(`falta la clave de config "${clave}"`);
  }

  console.log("\nVehículos visibles al público:");
  const { count: nVehiculos } = await publico
    .from("vehiculos")
    .select("*", { head: true, count: "exact" })
    .neq("estado", "borrador");
  console.log(`  → ${nVehiculos ?? 0} publicados/reservados/vendidos`);

  // 2. Lo que requiere service_role
  if (!service) {
    console.log("\n! Sin SUPABASE_SERVICE_ROLE_KEY no se pueden revisar buckets ni admins.");
  } else {
    const admin = createClient(url!, service, { auth: { persistSession: false } });

    console.log("\nBuckets de Storage:");
    const { data: buckets, error: errBuckets } = await admin.storage.listBuckets();
    if (errBuckets) {
      falla(`no se pudo listar buckets: ${errBuckets.message}`);
      errores++;
    } else {
      const nombres = (buckets ?? []).map((b) => b.id);
      for (const esperado of ["vehiculos", "informes", "tasaciones"]) {
        if (nombres.includes(esperado)) {
          const b = buckets!.find((x) => x.id === esperado)!;
          ok(`${esperado} (${b.public ? "público" : "privado"})`);
        } else {
          falla(`falta el bucket "${esperado}"`);
          errores++;
        }
      }
    }

    console.log("\nAdministradores del panel:");
    const { data: admins, error: errAdmins } = await admin
      .from("admin_users")
      .select("email, nombre");
    if (errAdmins) {
      falla(`no se pudo leer admin_users: ${errAdmins.message}`);
      errores++;
    } else if ((admins ?? []).length === 0) {
      aviso(
        "admin_users está vacío: nadie puede entrar a /admin.\n" +
          "    Crea el usuario en Authentication > Users y luego ejecuta en el SQL Editor:\n" +
          "    insert into public.admin_users (user_id, email, nombre)\n" +
          "    select id, email, 'Pablo' from auth.users where email = 'CORREO';",
      );
    } else {
      for (const a of admins!) ok(`${a.email}${a.nombre ? ` (${a.nombre})` : ""}`);
    }
  }

  console.log(
    errores === 0
      ? "\n✅ Supabase está listo.\n"
      : `\n❌ ${errores} problema(s) por resolver.\n`,
  );
  process.exit(errores === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(`\nError inesperado: ${(e as Error).message}\n`);
  process.exit(1);
});
