"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  alternarDestacado,
  cambiarEstadoVehiculo,
  duplicarVehiculo,
  eliminarVehiculo,
} from "@/app/acciones/vehiculos";
import type { EstadoPublicacion } from "@/lib/database.types";
import { ESTADOS, ETIQUETA_ESTADO } from "@/lib/esquemas/vehiculo";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  slug: string;
  titulo: string;
  estado: EstadoPublicacion;
  destacado: boolean;
};

export function AccionesVehiculo({ id, slug, titulo, estado, destacado }: Props) {
  const [pendiente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = (accion: () => Promise<unknown>) =>
    iniciar(async () => {
      setError(null);
      try {
        await accion();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo completar la acción.");
      }
    });

  if (confirmando) {
    return (
      <div className="rounded-2xl border-2 border-pg-red bg-pg-red/5 p-4 text-center">
        <p className="text-[14px] font-semibold text-pg-ink">¿Eliminar este vehículo?</p>
        <p className="mt-1 text-[13px] text-pg-gray">
          Se borran también sus fotos. No se puede deshacer.
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            disabled={pendiente}
            onClick={() => ejecutar(() => eliminarVehiculo(id))}
            className="rounded-pill bg-pg-red-dark px-4 py-2 text-[13px] font-bold text-pg-white"
          >
            {pendiente ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="rounded-pill border border-pg-border px-4 py-2 text-[13px] font-semibold text-pg-ink"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:w-52 sm:justify-end">
      <Link
        href={`/admin/vehiculos/${id}`}
        className="rounded-pill bg-pg-ink px-4 py-2 text-[13px] font-semibold text-pg-white no-underline"
      >
        Editar
      </Link>

      {estado !== "borrador" ? (
        <a
          href={`/vehiculos-en-venta/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-pill border border-pg-border px-4 py-2 text-[13px] font-semibold text-pg-ink no-underline"
        >
          Ver ↗
        </a>
      ) : null}

      <select
        aria-label={`Estado de ${titulo}`}
        value={estado}
        disabled={pendiente}
        onChange={(e) =>
          ejecutar(() => cambiarEstadoVehiculo(id, e.target.value as EstadoPublicacion))
        }
        className="rounded-pill border border-pg-border bg-pg-white px-3 py-2 text-[13px] font-semibold text-pg-ink"
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {ETIQUETA_ESTADO[e]}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={pendiente}
        onClick={() => ejecutar(() => alternarDestacado(id, !destacado))}
        title={destacado ? "Quitar de destacados" : "Marcar como destacado"}
        className={cn(
          "rounded-pill border px-3 py-2 text-[13px] font-semibold transition-colors",
          destacado
            ? "border-pg-orange bg-pg-orange/15 text-[#9a5a00]"
            : "border-pg-border text-pg-gray hover:text-pg-ink",
        )}
      >
        ★
      </button>

      <button
        type="button"
        disabled={pendiente}
        onClick={() => ejecutar(() => duplicarVehiculo(id))}
        className="rounded-pill border border-pg-border px-3 py-2 text-[13px] font-semibold text-pg-gray hover:text-pg-ink"
      >
        Duplicar
      </button>

      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="rounded-pill border border-pg-border px-3 py-2 text-[13px] font-semibold text-pg-red hover:bg-pg-red/10"
      >
        Eliminar
      </button>

      {error ? (
        <p role="alert" className="w-full text-right text-[12px] font-semibold text-pg-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
