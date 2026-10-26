import type { MetadataRoute } from "next";
import { listarSlugsPublicados } from "@/lib/vehiculos";
import { listarArticulos } from "@/lib/blog";
import { sitio } from "@/lib/site";

export const revalidate = 3600;

/** Sitemap dinámico: las páginas fijas más cada vehículo publicado. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // En el dominio de pruebas no se publica sitemap: evita que Google
  // descubra e indexe la copia.
  if (/vercel\.app|localhost/.test(sitio.url)) return [];

  const fijas: MetadataRoute.Sitemap = [
    { url: `${sitio.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${sitio.url}/vehiculos-en-venta`, changeFrequency: "daily", priority: 0.9 },
    { url: `${sitio.url}/servicios`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${sitio.url}/vende_tu_vehiculo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${sitio.url}/flota_de_empresas`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${sitio.url}/nosotros`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${sitio.url}/contacto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${sitio.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Los artículos migrados de WordPress conservan su slug: siguen indexados.
  const articulos = listarArticulos().map((a) => ({
    url: `${sitio.url}/blog/${a.slug}`,
    lastModified: new Date(a.actualizado),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const vehiculos = await listarSlugsPublicados();

  return [
    ...fijas,
    ...articulos,
    ...vehiculos.map((v) => ({
      url: `${sitio.url}/vehiculos-en-venta/${v.slug}`,
      lastModified: new Date(v.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
