"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { IconoCerrar } from "@/components/ui/Iconos";

export type FotoEnPanel = {
  /** id de la fila en vehiculo_fotos, si ya existía */
  id?: string;
  storage_path: string;
  ancho?: number | null;
  alto?: number | null;
  estado: "comprimiendo" | "subiendo" | "listo" | "error";
  progreso: number;
  error?: string;
  previsualizacion?: string;
};

const MAX_LADO = 1920;
const CALIDAD = 0.8;
const BUCKET = "vehiculos";

/** Comprime una foto en el navegador: máx 1920px, WebP ~80%. */
async function comprimir(archivo: File): Promise<{ blob: Blob; ancho: number; alto: number }> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    lienzo.toBlob(resolve, "image/webp", CALIDAD),
  );
  if (!blob) throw new Error("No se pudo comprimir la imagen.");

  return { blob, ancho, alto };
}

export function SubidorFotos({
  vehiculoId,
  fotos,
  onCambio,
  titulo,
}: {
  vehiculoId?: string;
  fotos: FotoEnPanel[];
  onCambio: (fotos: FotoEnPanel[]) => void;
  titulo: string;
}) {
  // Carpeta donde viven las fotos: el id del vehículo, o una nueva si aún no existe.
  const [prefijo] = useState(() => vehiculoId ?? crypto.randomUUID());
  const [arrastrando, setArrastrando] = useState(false);
  const [moviendo, setMoviendo] = useState<number | null>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const camara = useRef<HTMLInputElement>(null);

  const subir = useCallback(
    async (archivos: FileList | File[]) => {
      const lista = [...archivos].filter((a) => a.type.startsWith("image/"));
      if (lista.length === 0) return;

      const supabase = crearClienteNavegador();
      const base = fotos.length;

      // Marcar todas como "comprimiendo" de inmediato para dar señal visual.
      const nuevas: FotoEnPanel[] = lista.map((archivo) => ({
        storage_path: "",
        estado: "comprimiendo",
        progreso: 0,
        previsualizacion: URL.createObjectURL(archivo),
      }));
      let actuales = [...fotos, ...nuevas];
      onCambio(actuales);

      await Promise.all(
        lista.map(async (archivo, i) => {
          const indice = base + i;
          const actualizar = (cambios: Partial<FotoEnPanel>) => {
            actuales = actuales.map((f, j) => (j === indice ? { ...f, ...cambios } : f));
            onCambio(actuales);
          };

          try {
            const { blob, ancho, alto } = await comprimir(archivo);
            actualizar({ estado: "subiendo", progreso: 40, ancho, alto });

            const ruta = `${prefijo}/${Date.now()}-${i}.webp`;
            const { error } = await supabase.storage
              .from(BUCKET)
              .upload(ruta, blob, { contentType: "image/webp", upsert: false });

            if (error) throw new Error(error.message);

            actualizar({ estado: "listo", progreso: 100, storage_path: ruta });
          } catch (e) {
            actualizar({
              estado: "error",
              progreso: 0,
              error: e instanceof Error ? e.message : "No se pudo subir",
            });
          }
        }),
      );
    },
    [fotos, onCambio, prefijo],
  );

  const quitar = (indice: number) => onCambio(fotos.filter((_, i) => i !== indice));

  const mover = (desde: number, hasta: number) => {
    if (desde === hasta) return;
    const copia = [...fotos];
    const [elemento] = copia.splice(desde, 1);
    copia.splice(hasta, 0, elemento);
    onCambio(copia);
  };

  const listas = fotos.filter((f) => f.estado === "listo");

  return (
    <div>
      {/* Campo que viaja con el formulario */}
      <input
        type="hidden"
        name="fotos"
        value={JSON.stringify(
          listas.map((f, i) => ({
            id: f.id,
            storage_path: f.storage_path,
            orden: i,
            ancho: f.ancho ?? null,
            alto: f.alto ?? null,
            alt: `${titulo} - foto ${i + 1}`,
          })),
        )}
      />

      {/* Zona de arrastre */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          if (e.dataTransfer.files?.length) void subir(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          arrastrando ? "border-pg-orange bg-pg-orange/5" : "border-pg-border",
        )}
      >
        <p className="text-[15px] text-pg-gray">
          Arrastra las fotos aquí, o
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            className="rounded-pill bg-pg-ink px-5 py-2.5 text-[14px] font-semibold text-pg-white"
          >
            Elegir fotos
          </button>
          <button
            type="button"
            onClick={() => camara.current?.click()}
            className="rounded-pill border border-pg-border px-5 py-2.5 text-[14px] font-semibold text-pg-ink"
          >
            Tomar foto
          </button>
        </div>
        <p className="mt-3 text-[12px] text-pg-muted">
          Se achican a 1920px y se convierten a WebP antes de subir.
        </p>

        <input
          ref={entrada}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void subir(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={camara}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            if (e.target.files) void subir(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Galería */}
      {fotos.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {fotos.map((foto, i) => (
            <li
              key={foto.storage_path || foto.previsualizacion || i}
              draggable={foto.estado === "listo"}
              onDragStart={() => setMoviendo(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (moviendo != null) mover(moviendo, i);
                setMoviendo(null);
              }}
              className={cn(
                "group relative aspect-4/3 overflow-hidden rounded-2xl bg-pg-bg",
                foto.estado === "listo" && "cursor-grab active:cursor-grabbing",
                moviendo === i && "opacity-50",
              )}
            >
              {foto.previsualizacion || foto.storage_path ? (
                <Image
                  src={
                    foto.previsualizacion ??
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${foto.storage_path}`
                  }
                  alt=""
                  fill
                  sizes="200px"
                  unoptimized={Boolean(foto.previsualizacion)}
                  className="object-cover"
                />
              ) : null}

              {i === 0 && foto.estado === "listo" ? (
                <span className="pg-degradado absolute left-2 top-2 rounded-pill px-2 py-0.5 text-[11px] font-bold text-pg-white">
                  Portada
                </span>
              ) : null}

              {foto.estado !== "listo" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-pg-black/60 text-pg-white">
                  {foto.estado === "error" ? (
                    <>
                      <span className="text-[12px] font-bold">Error</span>
                      <span className="px-2 text-center text-[10px]">{foto.error}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[12px] font-semibold">
                        {foto.estado === "comprimiendo" ? "Comprimiendo…" : "Subiendo…"}
                      </span>
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/30">
                        <span
                          className="block h-full bg-pg-orange transition-all duration-300"
                          style={{ width: `${foto.progreso}%` }}
                        />
                      </span>
                    </>
                  )}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Quitar foto ${i + 1}`}
                className="absolute right-2 top-2 rounded-full bg-pg-black/70 p-1.5 text-pg-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <IconoCerrar width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {listas.length > 0 ? (
        <p className="mt-3 text-[13px] text-pg-muted">
          {listas.length} foto{listas.length === 1 ? "" : "s"} lista
          {listas.length === 1 ? "" : "s"}. La primera es la portada; arrástralas para cambiar el orden.
        </p>
      ) : null}
    </div>
  );
}
