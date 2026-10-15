"use client";

import { useState } from "react";
import { claseCampo } from "./campos";

/** Precio con formato CLP mientras se escribe: 23990000 → $23.990.000 */
export function CampoPrecio({
  name,
  id,
  defaultValue,
  error,
  onValor,
}: {
  name: string;
  id?: string;
  defaultValue?: number | null;
  error?: string;
  onValor?: (valor: number | null) => void;
}) {
  const [texto, setTexto] = useState(
    defaultValue != null ? new Intl.NumberFormat("es-CL").format(defaultValue) : "",
  );

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-pg-muted">
        $
      </span>
      <input
        id={id}
        name={name}
        inputMode="numeric"
        autoComplete="off"
        value={texto}
        onChange={(e) => {
          const digitos = e.target.value.replace(/\D/g, "");
          setTexto(digitos ? new Intl.NumberFormat("es-CL").format(Number(digitos)) : "");
          onValor?.(digitos ? Number(digitos) : null);
        }}
        className={`${claseCampo(error)} pl-8`}
        placeholder="0"
      />
    </div>
  );
}
