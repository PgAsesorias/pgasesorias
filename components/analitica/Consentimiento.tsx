"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type EstadoConsentimiento = "pendiente" | "aceptado" | "rechazado";

const CLAVE = "pg-cookies";
const EVENTO = "pg-cookies-cambio";

function leer(): EstadoConsentimiento {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado === "aceptado" || guardado === "rechazado" ? guardado : "pendiente";
  } catch {
    // Navegación privada o almacenamiento bloqueado: se pregunta de nuevo.
    return "pendiente";
  }
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

const Contexto = createContext<{
  estado: EstadoConsentimiento;
  decidir: (valor: "aceptado" | "rechazado") => void;
}>({ estado: "pendiente", decidir: () => {} });

export const useConsentimiento = () => useContext(Contexto);

/**
 * Guarda si el visitante aceptó las cookies de medición.
 *
 * Mientras no acepte no se carga ningún script de Google ni de Meta. La
 * analítica propia (tabla `eventos`) no usa cookies ni identifica a nadie, así
 * que sigue funcionando igual.
 */
export function ProveedorConsentimiento({ children }: { children: React.ReactNode }) {
  // En el servidor siempre "pendiente": el banner aparece recién en el navegador.
  const estado = useSyncExternalStore(suscribir, leer, () => "pendiente" as const);

  const decidir = useCallback((valor: "aceptado" | "rechazado") => {
    try {
      localStorage.setItem(CLAVE, valor);
    } catch {
      /* no se puede guardar: se volverá a preguntar */
    }
    window.dispatchEvent(new Event(EVENTO));
  }, []);

  return <Contexto.Provider value={{ estado, decidir }}>{children}</Contexto.Provider>;
}
