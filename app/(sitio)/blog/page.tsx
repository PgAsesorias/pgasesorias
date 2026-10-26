import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { BotonPrincipal } from "@/components/ui/Botones";
import { IconoAuto } from "@/components/ui/Iconos";
import { listarArticulos, minutosDeLectura, obtenerArticulo } from "@/lib/blog";
import { fechaCorta } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Consejos para comprar, vender y mantener tu vehículo en Chile: precios del mercado, cómo evitar estafas, mantención preventiva y venta de autos usados.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const articulos = listarArticulos();

  return (
    <>
      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor py-14 lg:py-20">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">Blog</p>
          <h1 className="mt-3 max-w-3xl text-[36px] leading-tight lg:text-[52px]">
            Consejos para comprar, vender y mantener tu auto
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] text-white/80">
            Lo que hemos aprendido revisando, vendiendo y reparando autos en Santiago.
          </p>
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-20 pt-8">
        {articulos.length === 0 ? (
          <EncabezadoSeccion
            prefijo="Próximamente"
            titulo="Estamos preparando los primeros artículos"
          />
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {articulos.map((a, i) => {
              const completo = obtenerArticulo(a.slug);
              return (
                <li key={a.slug}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-card bg-pg-white shadow-pg-card transition-transform duration-300 hover:-translate-y-1">
                    {a.portada ? (
                      <div className="relative aspect-16/10 overflow-hidden bg-pg-bg">
                        <Image
                          src={a.portada}
                          alt={a.portadaAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          priority={i === 0}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-1 flex-col p-6">
                      <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-pg-muted">
                        {a.categorias[0] ? (
                          <span className="font-bold uppercase tracking-wide text-pg-red">
                            {a.categorias[0]}
                          </span>
                        ) : null}
                        <time dateTime={a.fecha}>{fechaCorta(a.fecha)}</time>
                        {completo ? <span>· {minutosDeLectura(completo.contenido)} min de lectura</span> : null}
                      </p>

                      <h2 className="mt-3 text-[21px] leading-snug">
                        <Link
                          href={`/blog/${a.slug}`}
                          className="text-pg-ink no-underline transition-colors hover:text-pg-red"
                        >
                          {a.titulo}
                        </Link>
                      </h2>

                      <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-pg-gray">
                        {a.resumen}
                      </p>

                      <span className="mt-5 inline-block text-[15px] font-semibold text-pg-red">
                        Leer más →
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-14 flex justify-center">
          <BotonPrincipal href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />}>
            Ver vehículos en venta
          </BotonPrincipal>
        </div>
      </section>
    </>
  );
}
