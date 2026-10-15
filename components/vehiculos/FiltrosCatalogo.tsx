"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { IconoCerrar } from "@/components/ui/Iconos";

type Opcion = { valor: string; etiqueta: string; total?: number };

type Props = {
  marcas: Array<{ marca: string; total: number }>;
  anios: Array<{ anio: number; total: number }>;
  condiciones: Array<{ condicion: string; total: number }>;
  transmisiones: Array<{ transmision: string; total: number }>;
  combustibles: Array<{ combustible: string; total: number }>;
  total: number;
};

const ORDENES: Opcion[] = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "km-asc", etiqueta: "Menos kilómetros" },
  { valor: "anio-desc", etiqueta: "Año: más nuevo" },
];

/**
 * Filtros del catálogo. Todo vive en la URL (?marca=toyota&anio=2018), así que
 * un filtro se puede compartir por WhatsApp, guardar en favoritos e indexar.
 * El render de los resultados es en el servidor.
 */
export function FiltrosCatalogo({
  marcas,
  anios,
  condiciones,
  transmisiones,
  combustibles,
  total,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const primerRender = useRef(true);

  const aplicar = (cambios: Record<string, string | null>) => {
    const siguientes = new URLSearchParams(params.toString());
    for (const [clave, valor] of Object.entries(cambios)) {
      if (!valor) siguientes.delete(clave);
      else siguientes.set(clave, valor);
    }
    siguientes.delete("pagina"); // cualquier filtro vuelve a la página 1
    const query = siguientes.toString();
    router.push(query ? `/vehiculos-en-venta?${query}` : "/vehiculos-en-venta", { scroll: false });
  };

  // La búsqueda por texto se aplica sola, un momento después de escribir.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) aplicar({ q: q.trim() || null });
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activos = [...params.entries()].filter(([k]) => k !== "pagina" && k !== "orden");

  return (
    <div className="rounded-card bg-pg-white p-6 shadow-pg-card">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Campo etiqueta="Buscar">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej: Toyota 4Runner"
            className="w-full rounded-pill border border-pg-border bg-pg-white px-5 py-2.5 text-[15px] text-pg-ink placeholder:text-pg-muted"
          />
        </Campo>

        <Campo etiqueta="Marca">
          <Select
            valor={params.get("marca") ?? ""}
            onChange={(v) => aplicar({ marca: v || null })}
            placeholder="Todas las marcas"
            opciones={marcas.map((m) => ({ valor: m.marca, etiqueta: m.marca, total: m.total }))}
          />
        </Campo>

        <Campo etiqueta="Estado del vehículo">
          <Select
            valor={params.get("condicion") ?? ""}
            onChange={(v) => aplicar({ condicion: v || null })}
            placeholder="Todos"
            opciones={condiciones.map((c) => ({
              valor: c.condicion,
              etiqueta: c.condicion,
              total: c.total,
            }))}
          />
        </Campo>

        <Campo etiqueta="Año">
          <Select
            valor={params.get("anio") ?? ""}
            onChange={(v) => aplicar({ anio: v || null })}
            placeholder="Todos los años"
            opciones={anios.map((a) => ({
              valor: String(a.anio),
              etiqueta: String(a.anio),
              total: a.total,
            }))}
          />
        </Campo>

        <Campo etiqueta="Transmisión">
          <Select
            valor={params.get("transmision") ?? ""}
            onChange={(v) => aplicar({ transmision: v || null })}
            placeholder="Todas"
            opciones={transmisiones.map((t) => ({
              valor: t.transmision,
              etiqueta: t.transmision,
              total: t.total,
            }))}
          />
        </Campo>

        <Campo etiqueta="Combustible">
          <Select
            valor={params.get("combustible") ?? ""}
            onChange={(v) => aplicar({ combustible: v || null })}
            placeholder="Todos"
            opciones={combustibles.map((c) => ({
              valor: c.combustible,
              etiqueta: c.combustible,
              total: c.total,
            }))}
          />
        </Campo>

        <Campo etiqueta="Precio máximo">
          <Select
            valor={params.get("precioMax") ?? ""}
            onChange={(v) => aplicar({ precioMax: v || null })}
            placeholder="Sin tope"
            opciones={[5, 10, 15, 20, 25, 30].map((m) => ({
              valor: String(m * 1_000_000),
              etiqueta: `Hasta $${m}.000.000`,
            }))}
          />
        </Campo>

        <Campo etiqueta="Ordenar por">
          <Select
            valor={params.get("orden") ?? "recientes"}
            onChange={(v) => aplicar({ orden: v === "recientes" ? null : v })}
            opciones={ORDENES}
          />
        </Campo>
      </div>

      {/* Filtros activos */}
      {activos.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-pg-border/60 pt-5">
          <span className="text-[14px] text-pg-muted">
            {total} {total === 1 ? "vehículo" : "vehículos"} ·
          </span>
          {activos.map(([clave, valor]) => (
            <button
              key={clave}
              type="button"
              onClick={() => {
                if (clave === "q") setQ("");
                aplicar({ [clave]: null });
              }}
              className="inline-flex items-center gap-1.5 rounded-pill bg-pg-ink px-3 py-1 text-[13px] font-semibold text-pg-white"
            >
              {etiquetaFiltro(clave, valor)}
              <IconoCerrar width={13} height={13} />
              <span className="sr-only">Quitar filtro</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setQ("");
              router.push("/vehiculos-en-venta", { scroll: false });
            }}
            className="text-[13px] font-semibold text-pg-red underline-offset-4 hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      ) : null}
    </div>
  );
}

function etiquetaFiltro(clave: string, valor: string): string {
  if (clave === "precioMax") return `Hasta $${Number(valor).toLocaleString("es-CL")}`;
  if (clave === "q") return `"${valor}"`;
  return valor;
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold uppercase tracking-wide text-pg-red">
        {etiqueta}
      </span>
      {children}
    </label>
  );
}

function Select({
  valor,
  onChange,
  opciones,
  placeholder,
}: {
  valor: string;
  onChange: (v: string) => void;
  opciones: Opcion[];
  placeholder?: string;
}) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full appearance-none rounded-pill border border-pg-border bg-pg-white px-5 py-2.5",
        "text-[15px] text-pg-ink",
      )}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.etiqueta}
          {o.total != null ? ` (${o.total})` : ""}
        </option>
      ))}
    </select>
  );
}
