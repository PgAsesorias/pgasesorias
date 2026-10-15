import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { BotonPrincipal } from "@/components/ui/Botones";
import { FiltrosCatalogo } from "@/components/vehiculos/FiltrosCatalogo";
import { TarjetaVehiculo } from "@/components/vehiculos/TarjetaVehiculo";
import { contarFacetas, listarVehiculos, type FiltrosVehiculos, type OrdenCatalogo } from "@/lib/vehiculos";
import { whatsappUrl } from "@/lib/site";
import type { Combustible, Condicion, Transmision } from "@/lib/database.types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Vehículos en venta",
  description:
    "Autos usados y seminuevos revisados en Santiago. Filtra por marca, año, precio, transmisión y combustible. Financiamiento y transferencia incluidos.",
  alternates: { canonical: "/vehiculos-en-venta" },
};

const ORDENES_VALIDOS: OrdenCatalogo[] = [
  "recientes",
  "precio-asc",
  "precio-desc",
  "km-asc",
  "anio-desc",
];

type Params = Promise<Record<string, string | string[] | undefined>>;

function uno(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function entero(v: string | string[] | undefined): number | undefined {
  const n = Number(uno(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export default async function CatalogoPage({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;

  const ordenPedido = uno(sp.orden) as OrdenCatalogo | undefined;
  const filtros: FiltrosVehiculos = {
    marca: uno(sp.marca),
    condicion: uno(sp.condicion) as Condicion | undefined,
    anio: entero(sp.anio),
    precioMax: entero(sp.precioMax),
    precioMin: entero(sp.precioMin),
    transmision: uno(sp.transmision) as Transmision | undefined,
    combustible: uno(sp.combustible) as Combustible | undefined,
    q: uno(sp.q),
    orden: ordenPedido && ORDENES_VALIDOS.includes(ordenPedido) ? ordenPedido : "recientes",
    pagina: entero(sp.pagina) ?? 1,
    porPagina: 12,
  };

  const [{ vehiculos, total, pagina, totalPaginas }, facetas] = await Promise.all([
    listarVehiculos(filtros),
    contarFacetas(),
  ]);

  const qs = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const valor = uno(v);
      if (valor && k !== "pagina") params.set(k, valor);
    }
    if (p > 1) params.set("pagina", String(p));
    const s = params.toString();
    return s ? `/vehiculos-en-venta?${s}` : "/vehiculos-en-venta";
  };

  return (
    <div className="pg-contenedor pg-seccion">
      <EncabezadoSeccion
        prefijo="Catálogo"
        titulo="Vehículos en venta"
        nivel="h1"
        alineacion="izquierda"
        descripcion="Cada vehículo pasa por nuestra revisión antes de publicarse. Si buscas algo que no está acá, escríbenos y lo conseguimos."
      />

      <div className="mt-10">
        <Suspense fallback={<div className="h-48 rounded-card bg-pg-white shadow-pg-card" />}>
          <FiltrosCatalogo
            marcas={facetas.marcas}
            anios={facetas.anios}
            condiciones={facetas.condiciones}
            transmisiones={facetas.transmisiones}
            combustibles={facetas.combustibles}
            total={total}
          />
        </Suspense>
      </div>

      {vehiculos.length > 0 ? (
        <>
          <p className="mt-10 text-[15px] text-pg-muted">
            {total} {total === 1 ? "vehículo disponible" : "vehículos disponibles"}
            {totalPaginas > 1 ? ` · página ${pagina} de ${totalPaginas}` : ""}
          </p>

          <div className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {vehiculos.map((v, i) => (
              <TarjetaVehiculo key={v.id} vehiculo={v} prioridad={i < 3} />
            ))}
          </div>

          {totalPaginas > 1 ? (
            <nav aria-label="Paginación" className="mt-12 flex items-center justify-center gap-2">
              {pagina > 1 ? (
                <Link
                  href={qs(pagina - 1)}
                  className="rounded-pill border-2 border-pg-ink px-5 py-2 text-[15px] font-semibold text-pg-ink no-underline hover:bg-pg-ink hover:text-pg-white"
                >
                  Anterior
                </Link>
              ) : null}

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={qs(p)}
                  aria-current={p === pagina ? "page" : undefined}
                  className={
                    p === pagina
                      ? "pg-degradado rounded-pill px-4 py-2 text-[15px] font-bold text-pg-white no-underline"
                      : "rounded-pill px-4 py-2 text-[15px] font-semibold text-pg-ink no-underline hover:text-pg-red"
                  }
                >
                  {p}
                </Link>
              ))}

              {pagina < totalPaginas ? (
                <Link
                  href={qs(pagina + 1)}
                  className="rounded-pill border-2 border-pg-ink px-5 py-2 text-[15px] font-semibold text-pg-ink no-underline hover:bg-pg-ink hover:text-pg-white"
                >
                  Siguiente
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      ) : (
        <div className="mt-12 rounded-card bg-pg-white p-10 text-center shadow-pg-card">
          <h2 className="text-[24px]">No encontramos vehículos con esos filtros</h2>
          <p className="mx-auto mt-3 max-w-xl text-pg-gray">
            Prueba quitando algún filtro, o cuéntanos qué buscas: trabajamos con pedidos
            y te avisamos apenas llegue algo que calce.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotonPrincipal href="/vehiculos-en-venta">Ver todos los vehículos</BotonPrincipal>
            <a
              href={whatsappUrl("Hola PG! Estoy buscando un vehículo en particular, me pueden ayudar? 🚗")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-pg-red underline-offset-4 hover:underline"
            >
              Contarles qué busco por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
