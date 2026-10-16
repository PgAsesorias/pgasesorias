import Image from "next/image";
import { urlPublicacion, type PublicacionInstagram } from "@/lib/instagram";
import { redes } from "@/lib/site";
import { IconoInstagram } from "@/components/ui/Iconos";

/** Ícono de reel: triángulo de reproducción. */
function IconoReproducir({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 6.5v11a.6.6 0 0 0 .92.5l8.3-5.5a.6.6 0 0 0 0-1l-8.3-5.5A.6.6 0 0 0 9 6.5Z" />
    </svg>
  );
}

/** Ícono de carrusel: dos tarjetas superpuestas. */
function IconoCarrusel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="8" y="3" width="13" height="13" rx="2.5" />
      <path d="M16 20H5.5A2.5 2.5 0 0 1 3 17.5V7" strokeLinecap="round" />
    </svg>
  );
}

export function GrillaInstagram({ publicaciones }: { publicaciones: PublicacionInstagram[] }) {
  if (publicaciones.length === 0) return null;

  return (
    <div className="rounded-card bg-pg-black/80 p-4 shadow-pg-card backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="pg-degradado flex h-9 w-9 items-center justify-center rounded-full text-pg-white">
          <IconoInstagram width={18} height={18} />
        </span>
        <div className="min-w-0">
          <p className="font-titulo text-[17px] leading-none text-pg-white">
            {redes.instagram.usuario}
          </p>
          <p className="mt-1 text-[12px] text-white/60">Lo último del taller</p>
        </div>
        <a
          href={redes.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 rounded-pill border border-white/25 px-4 py-1.5 text-[13px] font-semibold text-pg-white no-underline transition-colors hover:border-pg-orange hover:text-pg-orange"
        >
          Seguir
        </a>
      </div>

      <ul className="grid grid-cols-3 gap-2">
        {publicaciones.map((p, i) => (
          <li key={p.id}>
            <a
              href={p.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={urlPublicacion(p.imagen)}
                alt={`Publicación de ${redes.instagram.usuario} en Instagram`}
                fill
                sizes="(max-width: 1024px) 30vw, 180px"
                priority={i < 3}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <span
                aria-hidden
                className="absolute inset-0 bg-pg-black/0 transition-colors duration-300 group-hover:bg-pg-black/25"
              />

              {p.tipo !== "imagen" ? (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 text-pg-white drop-shadow-[0_1px_3px_rgba(0,0,0,.6)]"
                >
                  {p.tipo === "video" ? (
                    <IconoReproducir className="h-4 w-4" />
                  ) : (
                    <IconoCarrusel className="h-3.5 w-3.5" />
                  )}
                </span>
              ) : null}

              <span className="sr-only">
                Ver {p.tipo === "video" ? "el reel" : "la publicación"} en Instagram
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
