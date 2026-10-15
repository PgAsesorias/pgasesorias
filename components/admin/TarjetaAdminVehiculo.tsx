import Image from "next/image";
import Link from "next/link";
import { clp, fechaCorta, km } from "@/lib/formato";
import { urlFoto } from "@/lib/vehiculos";
import { ETIQUETA_ESTADO } from "@/lib/esquemas/vehiculo";
import type { VehiculoAdmin } from "@/lib/admin/vehiculos";
import { AccionesVehiculo } from "./AccionesVehiculo";
import { cn } from "@/lib/cn";
import { IconoAuto, IconoCheck } from "@/components/ui/Iconos";

const COLOR_ESTADO: Record<string, string> = {
  borrador: "bg-pg-muted/15 text-pg-gray",
  publicado: "bg-pg-check/15 text-[#2e7d32]",
  reservado: "bg-pg-orange/20 text-[#9a5a00]",
  vendido: "bg-pg-red/15 text-pg-red-dark",
};

export function TarjetaAdminVehiculo({ vehiculo }: { vehiculo: VehiculoAdmin }) {
  const portada = vehiculo.fotos[0];
  const sinFotos = vehiculo.fotos.length === 0;

  return (
    <li className="rounded-card bg-pg-white p-4 shadow-pg-card">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Foto */}
        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-2xl bg-pg-bg sm:w-40">
          {portada ? (
            <Image
              src={urlFoto(portada.storage_path)}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-pg-muted">
              <IconoAuto width={28} height={28} />
              <span className="text-[12px]">Sin fotos</span>
            </div>
          )}
        </div>

        {/* Datos */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-pill px-2.5 py-0.5 text-[12px] font-bold",
                COLOR_ESTADO[vehiculo.estado],
              )}
            >
              {ETIQUETA_ESTADO[vehiculo.estado]}
            </span>
            {vehiculo.destacado ? (
              <span className="rounded-pill bg-pg-orange/20 px-2.5 py-0.5 text-[12px] font-bold text-[#9a5a00]">
                Destacado
              </span>
            ) : null}
            {vehiculo.revisado_pg ? (
              <span className="flex items-center gap-1 rounded-pill bg-pg-check/15 px-2.5 py-0.5 text-[12px] font-bold text-[#2e7d32]">
                <IconoCheck width={11} height={11} /> Revisado
              </span>
            ) : null}
            {sinFotos ? (
              <span className="rounded-pill bg-pg-red/15 px-2.5 py-0.5 text-[12px] font-bold text-pg-red-dark">
                Falta subir fotos
              </span>
            ) : (
              <span className="text-[12px] text-pg-muted">{vehiculo.fotos.length} fotos</span>
            )}
          </div>

          <h2 className="mt-2 text-[18px] leading-snug">
            <Link
              href={`/admin/vehiculos/${vehiculo.id}`}
              className="text-pg-ink no-underline hover:text-pg-red"
            >
              {vehiculo.titulo}
            </Link>
          </h2>

          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 text-[15px]">
            <span className="font-titulo text-[22px] font-bold text-pg-ink">
              {clp(vehiculo.precio_oferta ?? vehiculo.precio)}
            </span>
            {vehiculo.precio_oferta ? (
              <span className="text-pg-muted line-through">{clp(vehiculo.precio)}</span>
            ) : null}
          </p>

          <p className="mt-1 text-[13px] text-pg-muted">
            {vehiculo.anio} · {km(vehiculo.kilometraje)} · {vehiculo.combustible} ·{" "}
            {vehiculo.transmision} · editado {fechaCorta(vehiculo.updated_at)}
          </p>
        </div>

        {/* Acciones */}
        <div className="sm:self-center">
          <AccionesVehiculo
            id={vehiculo.id}
            slug={vehiculo.slug}
            estado={vehiculo.estado}
            destacado={vehiculo.destacado}
            titulo={vehiculo.titulo}
          />
        </div>
      </div>
    </li>
  );
}
