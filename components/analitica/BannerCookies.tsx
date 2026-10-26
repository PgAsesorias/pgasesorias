"use client";

import Link from "next/link";
import { useConsentimiento } from "./Consentimiento";

export function BannerCookies() {
  const { estado, decidir } = useConsentimiento();

  if (estado !== "pendiente") return null;

  return (
    <div
      role="dialog"
      aria-label="Uso de cookies"
      className="fixed inset-x-0 bottom-16 z-50 px-3 pb-3 xl:bottom-0"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-card bg-pg-white p-5 shadow-pg-card sm:flex-row sm:items-center">
        <p className="text-[14px] leading-relaxed text-pg-gray">
          Usamos cookies para medir qué vehículos y servicios te interesan y mejorar el
          sitio. Puedes rechazarlas y seguir navegando con normalidad.{" "}
          <Link href="/contacto" className="font-semibold text-pg-red underline-offset-2 hover:underline">
            Más información
          </Link>
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decidir("rechazado")}
            className="rounded-pill border border-pg-border px-4 py-2 text-[14px] font-semibold text-pg-ink"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => decidir("aceptado")}
            className="pg-degradado rounded-pill px-5 py-2 text-[14px] font-semibold text-pg-white"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
