"use client";

import { useState, useTransition } from "react";
import { marcarAtendida } from "@/app/acciones/consultas-admin";
import { IconoWhatsApp } from "@/components/ui/Iconos";

export function AccionesConsulta({
  id,
  atendida,
  telefono,
  nombre,
}: {
  id: string;
  atendida: boolean;
  telefono: string | null;
  nombre: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const numero = telefono?.replace(/\D/g, "");
  const wa = numero
    ? `https://wa.me/${numero.startsWith("56") ? numero : `56${numero}`}?text=${encodeURIComponent(
        `Hola ${nombre.split(" ")[0]}! Te escribo de PG Asesorías por tu consulta en nuestro sitio 🚗`,
      )}`
    : null;

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="pg-degradado flex items-center justify-center gap-2 rounded-pill px-4 py-2 text-[13px] font-semibold text-pg-white no-underline"
        >
          <IconoWhatsApp width={16} height={16} />
          Responder
        </a>
      ) : null}

      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          iniciar(async () => {
            setError(null);
            try {
              await marcarAtendida(id, !atendida);
            } catch (e) {
              setError(e instanceof Error ? e.message : "No se pudo actualizar.");
            }
          })
        }
        className="rounded-pill border border-pg-border px-4 py-2 text-[13px] font-semibold text-pg-ink"
      >
        {pendiente ? "…" : atendida ? "Marcar pendiente" : "Marcar atendida"}
      </button>

      {error ? (
        <p role="alert" className="text-[12px] font-semibold text-pg-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
