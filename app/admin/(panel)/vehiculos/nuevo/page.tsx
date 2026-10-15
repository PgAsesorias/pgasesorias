import Link from "next/link";
import { opcionesEquipamiento } from "@/lib/admin/vehiculos";
import { FormularioVehiculo } from "@/components/admin/FormularioVehiculo";

export const metadata = { title: "Nuevo vehículo" };

export default async function NuevoVehiculoPage() {
  const opciones = await opcionesEquipamiento();

  return (
    <>
      <nav className="mb-4 text-[14px]">
        <Link href="/admin" className="text-pg-muted no-underline hover:text-pg-ink">
          ← Vehículos
        </Link>
      </nav>
      <h1 className="mb-6 text-[30px]">Nuevo vehículo</h1>
      <FormularioVehiculo opciones={opciones} />
    </>
  );
}
