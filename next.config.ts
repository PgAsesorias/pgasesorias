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
