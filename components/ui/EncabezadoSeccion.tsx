import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Texto corto en mayúsculas, color rojo de marca. */
  prefijo?: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  /** `h2` por defecto; usar `h1` solo en el encabezado principal de la página. */
  nivel?: "h1" | "h2";
  alineacion?: "izquierda" | "centro";
  /** Para secciones de fondo negro. */
  tono?: "claro" | "oscuro";
  className?: string;
};

/** Prefijo + título + barra separadora: el patrón de encabezado del sitio. */
export function EncabezadoSeccion({
  prefijo,
  titulo,
  descripcion,
  nivel = "h2",
  alineacion = "centro",
  tono = "claro",
  className,
}: Props) {
  const Titulo = nivel;
  const centrado = alineacion === "centro";

  return (
    <div className={cn("flex flex-col", centrado ? "items-center text-center" : "items-start text-left", className)}>
      {prefijo ? (
        <p className="mb-2 text-[18px] font-bold uppercase tracking-wide text-pg-red">{prefijo}</p>
      ) : null}

      <Titulo
        className={cn(
          "text-[32px] lg:text-[40px]",
          tono === "oscuro" ? "text-pg-white" : "text-pg-ink",
        )}
      >
        {titulo}
      </Titulo>

      <span aria-hidden className="pg-degradado mt-5 block h-1 w-20 rounded-full" />

      {descripcion ? (
        <div
          className={cn(
            "mt-6 max-w-3xl text-[17px]",
            tono === "oscuro" ? "text-white/80" : "text-pg-gray",
          )}
        >
          {descripcion}
        </div>
      ) : null}
    </div>
  );
}
