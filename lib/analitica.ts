/**
 * Analítica del sitio.
 *
 * Se registra en dos lugares a la vez:
 *  1. La base propia (tabla `eventos`): no depende de cookies ni de scripts
 *     externos, así que **ningún bloqueador de publicidad la puede tumbar**.
 *     Es la que alimenta el panel de PG.
 *  2. Google Analytics y Meta Pixel, solo si el visitante aceptó cookies y si
 *     están configurados.
 */

export const TIPOS_EVENTO = [
  "vista_ficha",
  "clic_whatsapp",
  "clic_telefono",
  "simulador",
  "compartir",
  "favorito",
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number];

export type DatosEvento = {
  tipo: TipoEvento;
  /** Slug del vehículo, si el evento ocurrió en una ficha. */
  vehiculo?: string | null;
  pagina?: string;
};

/** Parámetros utm_* de la visita, para saber de qué campaña llegó. */
export function leerUtm(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const clave of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = params.get(clave);
    if (v) utm[clave] = v.slice(0, 120);
  }
  return Object.keys(utm).length > 0 ? utm : null;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Registra un evento. Nunca lanza: la analítica no puede romper el sitio. */
export function rastrear({ tipo, vehiculo, pagina }: DatosEvento): void {
  if (typeof window === "undefined") return;

  const cuerpo = JSON.stringify({
    tipo,
    vehiculo: vehiculo ?? null,
    pagina: pagina ?? window.location.pathname,
    utm: leerUtm(),
  });

  try {
    // sendBeacon sobrevive a que el usuario se vaya de la página.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/evento", new Blob([cuerpo], { type: "application/json" }));
    } else {
      void fetch("/api/evento", {
        method: "POST",
        body: cuerpo,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    /* la analítica propia falló: no importa */
  }

  try {
    window.gtag?.("event", tipo, { vehiculo: vehiculo ?? undefined });
  } catch {
    /* GA no cargó (bloqueador o sin consentimiento) */
  }

  try {
    // Meta usa nombres propios para las conversiones que importan.
    const nombreMeta =
      tipo === "clic_whatsapp" || tipo === "clic_telefono"
        ? "Contact"
        : tipo === "vista_ficha"
          ? "ViewContent"
          : null;
    if (nombreMeta) window.fbq?.("track", nombreMeta, { content_name: vehiculo ?? undefined });
  } catch {
    /* Meta Pixel no cargó */
  }
}
