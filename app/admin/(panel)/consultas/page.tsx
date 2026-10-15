import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { fechaCorta } from "@/lib/formato";
import { AccionesConsulta } from "@/components/admin/AccionesConsulta";
import { cn } from "@/lib/cn";

export const metadata = { title: "Consultas" };

const ORIGEN_ETIQUETA: Record<string, string> = {
  contacto: "Contacto",
  cotizar: "Cotización",
  vende_tu_vehiculo: "Tasación",
  flota: "Flota",
  financiamiento: "Financiamiento",
  tasacion: "Tasación",
  agenda: "Agenda",
};

type Props = { searchParams: Promise<{ ver?: string }> };

export default async function ConsultasPage({ searchParams }: Props) {
  const { ver = "pendientes" } = await searchParams;
  const supabase = await crearClienteServidor();

  let consulta = supabase
    .from("consultas")
    .select("*, vehiculo:vehiculos(titulo, slug)")
    .order("created_at", { ascending: false });

  if (ver === "pendientes") consulta = consulta.eq("atendida", false);
  if (ver === "atendidas") consulta = consulta.eq("atendida", true);

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);

  const consultas = data ?? [];
  const pendientes = consultas.filter((c) => !c.atendida).length;

  return (
    <>
      <h1 className="text-[30px]">Consultas</h1>
      <p className="mt-1 text-[15px] text-pg-muted">
        Todo lo que llega por los formularios del sitio.
      </p>

      <nav aria-label="Filtrar consultas" className="mt-6 flex flex-wrap gap-2">
        {[
          { valor: "pendientes", etiqueta: "Pendientes" },
          { valor: "atendidas", etiqueta: "Atendidas" },
          { valor: "todas", etiqueta: "Todas" },
        ].map((p) => (
          <Link
            key={p.valor}
            href={`/admin/consultas?ver=${p.valor}`}
            aria-current={ver === p.valor ? "page" : undefined}
            className={cn(
              "rounded-pill px-4 py-2 text-[14px] font-semibold no-underline transition-colors",
              ver === p.valor ? "bg-pg-ink text-pg-white" : "bg-pg-white text-pg-gray hover:text-pg-ink",
            )}
          >
            {p.etiqueta}
            {p.valor === "pendientes" && pendientes > 0 ? (
              <span className="ml-1.5 rounded-pill bg-pg-red px-1.5 text-[12px] text-pg-white">
                {pendientes}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {consultas.length === 0 ? (
        <div className="mt-8 rounded-card bg-pg-white p-10 text-center shadow-pg-card">
          <h2 className="text-[20px]">
            {ver === "pendientes" ? "No hay consultas pendientes" : "No hay consultas"}
          </h2>
          <p className="mt-2 text-pg-gray">
            Cuando alguien escriba desde el sitio, aparecerá acá con su teléfono y el auto
            por el que preguntó.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {consultas.map((c) => {
            const extra = (c.datos ?? null) as Record<string, string> | null;
            const vehiculo = c.vehiculo as { titulo: string; slug: string } | null;

            return (
              <li
                key={c.id}
                className={cn(
                  "rounded-card bg-pg-white p-5 shadow-pg-card",
                  c.atendida && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-pill bg-pg-ink/10 px-2.5 py-0.5 text-[12px] font-bold text-pg-ink">
                        {ORIGEN_ETIQUETA[c.origen] ?? c.origen}
                      </span>
                      {c.atendida ? (
                        <span className="rounded-pill bg-pg-check/15 px-2.5 py-0.5 text-[12px] font-bold text-[#2e7d32]">
                          Atendida
                        </span>
                      ) : null}
                      <span className="text-[12px] text-pg-muted">
                        {fechaCorta(c.created_at)}
                      </span>
                    </div>

                    <h2 className="mt-2 text-[19px]">{c.nombre}</h2>

                    <p className="mt-1 flex flex-wrap gap-x-4 text-[15px]">
                      {c.telefono ? (
                        <a href={`tel:${c.telefono}`} className="font-semibold text-pg-ink no-underline hover:text-pg-red">
                          {c.telefono}
                        </a>
                      ) : null}
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-pg-gray no-underline hover:text-pg-red">
                          {c.email}
                        </a>
                      ) : null}
                    </p>

                    {vehiculo ? (
                      <p className="mt-2 text-[14px] text-pg-gray">
                        Por:{" "}
                        <a
                          href={`/vehiculos-en-venta/${vehiculo.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-pg-ink no-underline hover:text-pg-red"
                        >
                          {vehiculo.titulo}
                        </a>
                      </p>
                    ) : null}

                    {c.mensaje ? (
                      <p className="mt-3 whitespace-pre-line rounded-2xl bg-pg-bg p-3 text-[15px] text-pg-gray">
                        {c.mensaje}
                      </p>
                    ) : null}

                    {extra && Object.keys(extra).length > 0 ? (
                      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                        {Object.entries(extra).map(([k, v]) => (
                          <div key={k} className="flex gap-1.5">
                            <dt className="text-pg-muted">{k.replace(/_/g, " ")}:</dt>
                            <dd className="font-semibold text-pg-ink">{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    {c.pagina ? (
                      <p className="mt-3 text-[12px] text-pg-muted">Desde: {c.pagina}</p>
                    ) : null}
                  </div>

                  <AccionesConsulta
                    id={c.id}
                    atendida={c.atendida}
                    telefono={c.telefono}
                    nombre={c.nombre}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
