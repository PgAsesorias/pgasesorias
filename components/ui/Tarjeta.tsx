import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** `padding="ninguno"` para tarjetas con foto a sangre (vehículos). */
  padding?: "normal" | "compacto" | "ninguno";
  /** Eleva la tarjeta al pasar el mouse. */
  interactiva?: boolean;
  como?: ElementType;
  className?: string;
};

/** Tarjeta blanca, radio 20px y sombra de marca. */
export function Tarjeta({
  children,
  padding = "normal",
  interactiva = false,
  como: Como = "div",
  className,
}: Props) {
  return (
    <Como
      className={cn(
        "rounded-card bg-pg-white shadow-pg-card",
        padding === "normal" && "p-8 lg:p-10",
        padding === "compacto" && "p-6",
        interactiva &&
          "transition-transform duration-300 hover:-translate-y-1 focus-within:-translate-y-1",
        className,
      )}
    >
      {children}
    </Como>
  );
}
