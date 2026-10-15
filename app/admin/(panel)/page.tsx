import Link from "next/link";
import { listarParaAdmin, contarPorEstado } from "@/lib/admin/vehiculos";
import { TarjetaAdminVehiculo } from "@/components/admin/TarjetaAdminVehiculo";
import { ETIQUETA_ESTADO, ESTADOS } from "@/lib/esquemas/vehiculo";
import type { EstadoPublicacion } from "@/lib/database.types";
import { cn } from "@/lib/cn";

export const metadata = { title: "Vehículos" };

type Props = { searchParams: Promise<{ estado?: string; q?: string }> };

export default async function AdminVehiculosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const estado = (sp.estado ?? "todos") as EstadoPublicacion | "todos";

  const [vehiculos, conteo] = await Promise.all([
    listarParaAdmin({ estado, q: sp.q }),
    contarPorEstado(),
  ]);

  const pestanas = [
    { valor: "todos", etiqueta: "Todos" },
    ...ESTADOS.map((e) => ({ valor: e, etiqueta: ETIQUETA_ESTADO[e] })),
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px]">Vehículos</h1>
          <p className="mt-1 text-[15px] text-pg-muted">
            {conteo.todos ?? 0} en total · {conteo.publicado ?? 0} publicados
          </p>
        </div>

        <Link
          href="/admin/vehiculos/nuevo"
          className="pg-degradado rounded-pill px-6 py-3 text-[16px] font-semibold text-pg-white no-underline shadow-pg-btn hover:shadow-none"
        >
          + Nuevo vehículo
        </Link>
      </div>

      {/* Filtros por estado */}
      <nav aria-label="Filtrar por estado" className="mt-6 flex flex-wrap gap-2">
        {pestanas.map((p) => {
          const activa = estado === p.valor;
          const n = conteo[p.valor] ?? 0;
          return (
            <Link
              key={p.valor}
              href={p.valor === "todos" ? "/admin" : `/admin?estado=${p.valor}`}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "rounded-pill px-4 py-2 text-[14px] font-semibold no-underline transition-colors",
                activa
                  ? "bg-pg-ink text-pg-white"
                  : "bg-pg-white text-pg-gray hover:text-pg-ink",
              )}
            >
              {p.etiqueta} <span className={activa ? "text-white/60" : "text-pg-muted"}>{n}</span>
            </Link>
          );
        })}
      </nav>

      {vehiculos.length === 0 ? (
        <div className="mt-10 rounded-card bg-pg-white p-10 text-center shadow-pg-card">
          <h2 className="text-[22px]">
            {estado === "todos" ? "Todavía no hay vehículos" : `No hay vehículos en ${ETIQUETA_ESTADO[estado as EstadoPublicacion].toLowerCase()}`}
          </h2>
          <p className="mt-2 text-pg-gray">Carga el primero y aparecerá en el sitio.</p>
          <Link
            href="/admin/vehiculos/nuevo"
            className="pg-degradado mt-6 inline-block rounded-pill px-6 py-3 font-semibold text-pg-white no-underline"
          >
            + Nuevo vehículo
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {vehiculos.map((v) => (
            <TarjetaAdminVehiculo key={v.id} vehiculo={v} />
          ))}
        </ul>
      )}
    </>
  );
}
