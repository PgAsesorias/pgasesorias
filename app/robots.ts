import type { MetadataRoute } from "next";
import { sitio } from "@/lib/site";

/**
 * Mientras el sitio vive en una URL de pruebas (*.vercel.app) se bloquea
 * entero: si Google indexara esa copia, competiría con pgasesorias.cl por los
 * mismos textos y repartiría el posicionamiento entre dos dominios.
 * Al apuntar el dominio real, `NEXT_PUBLIC_SITE_URL` cambia y esto se abre solo.
 */
const esPruebas = /vercel\.app|localhost/.test(sitio.url);

export default function robots(): MetadataRoute.Robots {
  if (esPruebas) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${sitio.url}/sitemap.xml`,
  };
}
