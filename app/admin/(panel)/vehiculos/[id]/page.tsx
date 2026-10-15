import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerParaAdmin, opcionesEquipamiento } from "@/lib/admin/vehiculos";
import { FormularioVehiculo } from "@/components/admin/FormularioVehiculo";
import { ETIQUETA_ESTADO } from "@/lib/esquemas/vehiculo";

export const metadata = { title: "Editar vehículo" };

type Props = { params: Promise<{ id: string }> };

export default async function EditarVehiculoPage({ params }: Props) {
  const { id } = await params;
  const [vehiculo, opciones] = await Promise.all([
    obtenerParaAdmin(id),
    opcionesEquipamiento(),
  ]);

  if (!vehiculo) notFound();

  return (
    <>
      <nav className="mb-4 text-[14px]">
        <Link href="/admin" className="text-pg-muted no-underline hover:text-pg-ink">
          ← Vehículos
        </Link>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] leading-snug">{vehiculo.titulo}</h1>
          <p className="mt-1 text-[14px] text-pg-muted">
            {ETIQUETA_ESTADO[vehiculo.estado]} · {vehiculo.fotos.length} fotos
          </p>
        </div>
        {vehiculo.estado !== "borrador" ? (
          <a
            href={`/vehiculos-en-venta/${vehiculo.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill border border-pg-border px-4 py-2 text-[14px] font-semibold text-pg-ink no-underline"
          >
            Ver en el sitio ↗
          </a>
        ) : null}
      </div>

      <FormularioVehiculo vehiculo={vehiculo} opciones={opciones} />
    </>
  );
}
