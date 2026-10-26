"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { rastrear } from "@/lib/analitica";

/** Slug del vehículo si estamos en una ficha. */
function slugDeLaRuta(pathname: string): string | null {
  const m = pathname.match(/^\/vehiculos-en-venta\/([^/]+)$/);
  return m ? m[1] : null;
}

/**
 * Registra solo lo que importa para vender, sin tocar cada componente:
 * escucha los clics del documento y detecta los enlaces de WhatsApp y teléfono,
 * y cuenta la visita a cada ficha de vehículo.
 */
export function Rastreador() {
  const pathname = usePathname();

  // Vista de ficha
  useEffect(() => {
    const vehiculo = slugDeLaRuta(pathname);
    if (!vehiculo) return;
    const id = setTimeout(() => rastrear({ tipo: "vista_ficha", vehiculo, pagina: pathname }), 1200);
    return () => clearTimeout(id);
  }, [pathname]);

  // Clics en WhatsApp y teléfono, en cualquier parte del sitio
  useEffect(() => {
    const alHacerClic = (e: MouseEvent) => {
      const destino = (e.target as HTMLElement | null)?.closest?.("a");
      if (!destino) return;

      const href = destino.getAttribute("href") ?? "";
      const vehiculo = slugDeLaRuta(window.location.pathname);

      if (href.includes("wa.me/")) {
        rastrear({ tipo: "clic_whatsapp", vehiculo, pagina: window.location.pathname });
      } else if (href.startsWith("tel:")) {
        rastrear({ tipo: "clic_telefono", vehiculo, pagina: window.location.pathname });
      }
    };

    document.addEventListener("click", alHacerClic, { capture: true });
    return () => document.removeEventListener("click", alHacerClic, { capture: true });
  }, []);

  return null;
}
