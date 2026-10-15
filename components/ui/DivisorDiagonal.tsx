import { cn } from "@/lib/cn";

type Props = {
  /** Color del triángulo: el de la sección que sigue. */
  color?: string;
  /** Hacia dónde apunta la diagonal. */
  variante?: "arriba" | "abajo";
  /** Alto en px (60–85 en el sitio). */
  alto?: number;
  className?: string;
};

/**
 * Divisor diagonal entre secciones (el mismo path del sitio actual).
 * Es decorativo: no aporta contenido y queda oculto para lectores de pantalla.
 */
export function DivisorDiagonal({
  color = "var(--pg-bg)",
  variante = "abajo",
  alto = 72,
  className,
}: Props) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none w-full overflow-hidden leading-none", className)}
      style={{ height: alto }}
    >
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        className="block h-full w-full"
        style={{ transform: variante === "arriba" ? "rotate(180deg)" : undefined }}
        focusable="false"
      >
        <path d="M0,6V0h1000v100L0,6z" fill={color} />
      </svg>
    </div>
  );
}
