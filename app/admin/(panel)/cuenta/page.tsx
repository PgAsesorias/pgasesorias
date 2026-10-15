import { usuarioActual } from "@/lib/supabase/server";
import { FormularioPassword } from "@/components/admin/FormularioPassword";

export const metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const usuario = await usuarioActual();

  return (
    <div className="max-w-xl">
      <h1 className="text-[30px]">Mi cuenta</h1>
      <p className="mt-1 text-[15px] text-pg-muted">{usuario?.email}</p>

      <div className="mt-6 rounded-card bg-pg-white p-6 shadow-pg-card">
        <h2 className="text-[20px]">Cambiar contraseña</h2>
        <p className="mt-1 text-[14px] text-pg-muted">
          Usa una que no ocupes en otros sitios. Mínimo 8 caracteres.
        </p>
        <div className="mt-5">
          <FormularioPassword />
        </div>
      </div>
    </div>
  );
}
