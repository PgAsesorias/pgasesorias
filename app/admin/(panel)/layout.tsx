import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { crearClienteServidor, esAdmin, usuarioActual } from "@/lib/supabase/server";
import { NavegacionAdmin } from "@/components/admin/NavegacionAdmin";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel PG" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();

  // Sin sesión: el middleware ya redirige, pero el servidor nunca confía en eso.
  if (!usuario) redirect("/admin/login");

  if (!(await esAdmin())) {
    const supabase = await crearClienteServidor();
    await supabase.auth.signOut();
    redirect("/admin/login?error=sin-permiso");
  }

  const nombre =
    (usuario.user_metadata?.nombre as string | undefined) ?? usuario.email ?? "Equipo PG";

  return (
    <div className="min-h-screen bg-pg-bg">
      <NavegacionAdmin nombre={nombre} />
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-6 lg:px-8">{children}</div>
    </div>
  );
}
