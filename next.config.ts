import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de caché clásico (ISR + revalidatePath), como define CLAUDE.md.
  // create-next-app activa cacheComponents por defecto; lo dejamos fuera para
  // que las páginas con filtros en la URL y el revalidate del admin sean directos.
  cacheComponents: false,
  images: {
    // Fase 2 agrega aquí el dominio de Supabase Storage.
    remotePatterns: [],
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
