import Image from "next/image";
import Link from "next/link";
import { clp, km as fmtKm } from "@/lib/formato";
import { fotoPortada, urlFoto, type VehiculoConFotos } from "@/lib/vehiculos";
import { cn } from "@/lib/cn";
import {
  IconoAuto,
  IconoCheck,
  IconoFlecha,
} from "@/components/ui/Iconos";

type Props = {
  vehiculo: VehiculoConFotos;
  /** La primera tarjeta visible carga su foto con prioridad. */
  prioridad?: boolean;
  className?: string;
};

const ETIQUETA_ESTADO: Record<string, { texto: string; clase: string }> = {
  reservado: { texto: "Reservado", clase: "bg-pg-ink text-pg-white" },
  vendido: { texto: "Vendido", clase: "bg-pg-red-dark text-pg-white" },
};

export function TarjetaVehiculo({ vehiculo, prioridad = false, className }: Props) {
  const portada = fotoPortada(vehiculo);
  const href = `/vehiculos-en-venta/${vehiculo.slug}`;
  const enOferta = vehiculo.precio_oferta != null;
  const estado = ETIQUETA_ESTADO[vehiculo.estado];

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card bg-pg-white shadow-pg-card",
        "transition-transform duration-300 hover:-translate-y-1 focus-within:-translate-y-1",
        className,
      )}
    >
      {/* Foto */}
      <div className="relative aspect-4/3 overflow-hidden bg-pg-ink/5">
        {portada ? (
          <Image
            src={urlFoto(portada.storage_path)}
            alt={portada.alt ?? vehiculo.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={prioridad}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-pg-muted">
            <IconoAuto width={48} height={48} />
          </div>
        )}

        {/* Estado y sello de revisión */}
        <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
          {estado ? (
            <span className={cn("rounded-pill px-3 py-1 text-[13px] font-bold", estado.clase)}>
              {estado.texto}
            </span>
          ) : null}
          {vehiculo.revisado_pg ? (
            <span className="flex items-center gap-1.5 rounded-pill bg-pg-white px-3 py-1 text-[13px] font-bold text-pg-ink shadow">
              <IconoCheck width={14} height={14} className="text-pg-check" />
              Revisado por PG
            </span>
          ) : null}
        </div>

        {enOferta ? (
          <span className="pg-degradado absolute right-4 top-4 rounded-pill px-3 py-1 text-[13px] font-bold text-pg-white">
            Oferta
          </span>
        ) : null}
      </div>

      {/* Datos */}
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-titulo text-[30px] font-bold leading-none text-pg-ink">
            {clp(vehiculo.precio_oferta ?? vehiculo.precio)}
          </span>
          {enOferta ? (
            <span className="text-[16px] text-pg-muted line-through">{clp(vehiculo.precio)}</span>
          ) : null}
        </p>

        <h3 className="mt-3 text-[19px] leading-snug">
          <Link
            href={href}
            className="text-pg-ink no-underline transition-colors hover:text-pg-red after:absolute after:inset-0"
          >
            {vehiculo.titulo}
          </Link>
        </h3>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-pg-border/60 pt-4 text-[14px] text-pg-gray">
          <li>{vehiculo.anio}</li>
          <li>{vehiculo.combustible}</li>
          <li>{vehiculo.transmision}</li>
          <li>{fmtKm(vehiculo.kilometraje)}</li>
        </ul>

        <span className="mt-6 inline-flex items-center gap-2 self-start text-[16px] font-semibold text-pg-red">
          Detalles
          <IconoFlecha
            width={18}
            height={18}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  );
}
