"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { IconoCerrar, IconoFlecha } from "@/components/ui/Iconos";

export type FotoGaleria = { url: string; alt: string; ancho: number | null; alto: number | null };

/**
 * Galería con miniaturas y lightbox a pantalla completa.
 * Funciona con teclado (flechas y Escape) y con deslizar en móvil.
 */
export function Galeria({ fotos, titulo }: { fotos: FotoGaleria[]; titulo: string }) {
  const [actual, setActual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const tiras = useRef<HTMLDivElement>(null);
  const tocoEn = useRef<number | null>(null);

  const ir = useCallback(
    (delta: number) => setActual((i) => (i + delta + fotos.length) % fotos.length),
    [fotos.length],
  );

  useEffect(() => {
    if (!ampliada) return;
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(false);
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", alTeclado);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = previo;
    };
  }, [ampliada, ir]);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-card bg-pg-ink/5 text-pg-muted">
        Sin fotos
      </div>
    );
  }

  const foto = fotos[actual];

  return (
    <div>
      {/* Foto principal */}
      <div
        className="group relative aspect-4/3 overflow-hidden rounded-card bg-pg-ink/5"
        onTouchStart={(e) => (tocoEn.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (tocoEn.current == null) return;
          const dx = e.changedTouches[0].clientX - tocoEn.current;
          if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
          tocoEn.current = null;
        }}
      >
        <Image
          src={foto.url}
          alt={foto.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setAmpliada(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label="Ver la foto a pantalla completa"
        />

        {fotos.length > 1 ? (
          <>
            <Flecha direccion="izquierda" onClick={() => ir(-1)} />
            <Flecha direccion="derecha" onClick={() => ir(1)} />
            <span className="absolute bottom-4 right-4 rounded-pill bg-pg-black/70 px-3 py-1 text-[13px] font-semibold text-pg-white">
              {actual + 1} / {fotos.length}
            </span>
          </>
        ) : null}
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 ? (
        <div ref={tiras} className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {fotos.map((f, i) => (
            <button
              key={f.url}
              type="button"
              onClick={() => setActual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === actual}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl transition-opacity",
                i === actual ? "ring-2 ring-pg-red" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={f.url} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {ampliada ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${titulo}`}
          className="fixed inset-0 z-[60] flex flex-col bg-pg-black/95"
          onTouchStart={(e) => (tocoEn.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (tocoEn.current == null) return;
            const dx = e.changedTouches[0].clientX - tocoEn.current;
            if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
            tocoEn.current = null;
          }}
        >
          <div className="flex items-center justify-between p-4 text-pg-white">
            <span className="text-[15px]">
              {actual + 1} / {fotos.length}
            </span>
            <button
              type="button"
              onClick={() => setAmpliada(false)}
              className="rounded-full p-2 hover:bg-white/10"
              autoFocus
            >
              <IconoCerrar width={26} height={26} />
              <span className="sr-only">Cerrar</span>
            </button>
          </div>

          <div className="relative flex-1">
            <Image src={foto.url} alt={foto.alt} fill sizes="100vw" className="object-contain" />
            {fotos.length > 1 ? (
              <>
                <Flecha direccion="izquierda" onClick={() => ir(-1)} claro />
                <Flecha direccion="derecha" onClick={() => ir(1)} claro />
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Flecha({
  direccion,
  onClick,
  claro = false,
}: {
  direccion: "izquierda" | "derecha";
  onClick: () => void;
  claro?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direccion === "izquierda" ? "Foto anterior" : "Foto siguiente"}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-3 transition-colors",
        direccion === "izquierda" ? "left-3" : "right-3",
        claro
          ? "bg-white/10 text-pg-white hover:bg-white/20"
          : "bg-pg-white/90 text-pg-ink hover:bg-pg-white hover:text-pg-red-dark",
      )}
    >
      <IconoFlecha
        width={22}
        height={22}
        className={direccion === "izquierda" ? "rotate-180" : undefined}
      />
    </button>
  );
}
