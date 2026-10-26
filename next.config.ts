import type { NextConfig } from "next";

/**
 * Host del Storage de Supabase, tomado de la URL del proyecto.
 * Si la variable aún no está, no se agrega el patrón (el build no se cae).
 */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Modelo de caché clásico (ISR + revalidatePath), como define CLAUDE.md.
  // create-next-app activa cacheComponents por defecto; lo dejamos fuera para
  // que las páginas con filtros en la URL y el revalidate del admin sean directos.
  cacheComponents: false,
  images: {
    // Fotos de vehículos servidas desde el bucket público de Supabase Storage.
    remotePatterns: supabaseHost
      ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
    formats: ["image/webp"],
  },

  /**
   * Redirecciones 301 desde el WordPress anterior.
   *
   * Cada una de estas URLs está indexada en Google hoy. Un 301 traspasa el
   * posicionamiento a la URL nueva; un 404 lo pierde. La lista salió de los
   * sitemaps del sitio actual (64 URLs revisadas una por una).
   */
  async redirects() {
    // Nota: las reglas con :slug((?!.*\.).*) excluyen a propósito cualquier
    // ruta con punto (archivos). Sin eso, /marca/:resto* capturaba también
    // /marca/logo-pg-asesorias.webp y el logo dejaba de cargarse.
    const marcas = ["toyota", "nissan", "peugeot", "mitsubishi", "maxus", "renault"];
    const anios = ["2004", "2013", "2018", "2022", "2023"];

    return [
      // Artículos del blog: en WordPress viven en la raíz.
      ...[
        "autos-nuevos-son-malos",
        "como-evitar-estafas-al-comprar-un-auto-usado-en-chile",
        "consejos-para-vender-tu-auto-mas-rapido-y-al-mejor-precio",
        "la-importancia-de-la-mantencion-preventiva-de-tu-vehiculo",
      ].map((slug) => ({
        source: `/${slug}`,
        destination: `/blog/${slug}`,
        permanent: true,
      })),

      // Categorías y etiquetas del blog: no se replican, van al índice.
      { source: "/category/blog", destination: "/blog", permanent: true },
      { source: "/category/blog/:slug((?!.*\\.).*)", destination: "/blog", permanent: true },
      { source: "/tag/:slug((?!.*\\.).*)", destination: "/blog", permanent: true },

      // Archivos por marca y año → catálogo filtrado.
      ...marcas.map((m) => ({
        source: `/marca/${m}`,
        destination: `/vehiculos-en-venta?marca=${m.charAt(0).toUpperCase() + m.slice(1)}`,
        permanent: true,
      })),
      ...anios.map((a) => ({
        source: `/ano/${a}`,
        destination: `/vehiculos-en-venta?anio=${a}`,
        permanent: true,
      })),
      { source: "/estado-del-vehiculo/seminuevo", destination: "/vehiculos-en-venta?condicion=Seminuevo", permanent: true },
      { source: "/estado-del-vehiculo/usado", destination: "/vehiculos-en-venta?condicion=Usado", permanent: true },
      { source: "/tipo-de-combustible/diesel", destination: "/vehiculos-en-venta?combustible=Di%C3%A9sel", permanent: true },
      { source: "/tipo-de-combustible/gasolina", destination: "/vehiculos-en-venta?combustible=Gasolina", permanent: true },
      { source: "/transmision/automatica", destination: "/vehiculos-en-venta?transmision=Autom%C3%A1tica", permanent: true },
      { source: "/transmision/manual", destination: "/vehiculos-en-venta?transmision=Manual", permanent: true },
      { source: "/marca/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/ano/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/estado-del-vehiculo/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/tipo-de-combustible/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/transmision/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },

      // Restos de plugins y rutas internas que no se replican.
      { source: "/shop", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/shop/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/vehiculos/:slug((?!.*\\.).*)", destination: "/vehiculos-en-venta", permanent: true },
      { source: "/agendamiento-amelia-interno", destination: "/contacto", permanent: true },
      { source: "/reserva_lista", destination: "/contacto", permanent: true },

      // Variantes de Flota que conviven en el sitio actual.
      { source: "/Flota-Empresarial", destination: "/flota_de_empresas", permanent: true },
      { source: "/flota-empresarial", destination: "/flota_de_empresas", permanent: true },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
