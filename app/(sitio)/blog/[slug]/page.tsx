import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { IconoAuto, IconoWhatsApp } from "@/components/ui/Iconos";
import { listarArticulos, minutosDeLectura, obtenerArticulo } from "@/lib/blog";
import { fechaCorta } from "@/lib/formato";
import { sitio, whatsappUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listarArticulos().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articulo = obtenerArticulo(slug);
  if (!articulo) return { title: "Artículo no encontrado", robots: { index: false } };

  return {
    title: articulo.titulo,
    description: articulo.resumen,
    alternates: { canonical: `/blog/${articulo.slug}` },
    openGraph: {
      type: "article",
      title: articulo.titulo,
      description: articulo.resumen,
      url: `/blog/${articulo.slug}`,
      publishedTime: articulo.fecha,
      modifiedTime: articulo.actualizado,
      images: articulo.portada ? [{ url: articulo.portada, alt: articulo.portadaAlt }] : undefined,
    },
  };
}

export default async function ArticuloPage({ params }: Props) {
  const { slug } = await params;
  const articulo = obtenerArticulo(slug);
  if (!articulo) notFound();

  const otros = listarArticulos()
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: articulo.titulo,
    description: articulo.resumen,
    datePublished: articulo.fecha,
    dateModified: articulo.actualizado,
    author: { "@type": "Organization", name: sitio.nombre, url: sitio.url },
    publisher: {
      "@type": "Organization",
      name: sitio.nombre,
      logo: { "@type": "ImageObject", url: `${sitio.url}/pg/logo-pg-asesorias.webp` },
    },
    mainEntityOfPage: `${sitio.url}/blog/${articulo.slug}`,
    ...(articulo.portada ? { image: `${sitio.url}${articulo.portada}` } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="pg-contenedor py-10 lg:py-16">
        <nav aria-label="Ruta" className="mb-8 text-[14px] text-pg-muted">
          <Link href="/" className="no-underline hover:text-pg-red">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="no-underline hover:text-pg-red">Blog</Link>
        </nav>

        <header className="mx-auto max-w-3xl">
          <p className="flex flex-wrap items-center gap-x-3 text-[14px] text-pg-muted">
            {articulo.categorias[0] ? (
              <span className="font-bold uppercase tracking-wide text-pg-red">
                {articulo.categorias[0]}
              </span>
            ) : null}
            <time dateTime={articulo.fecha}>{fechaCorta(articulo.fecha)}</time>
            <span>· {minutosDeLectura(articulo.contenido)} min de lectura</span>
          </p>

          <h1 className="mt-4 text-[34px] leading-tight lg:text-[44px]">{articulo.titulo}</h1>
          <p className="mt-5 text-[19px] leading-relaxed text-pg-gray">{articulo.resumen}</p>
        </header>

        {articulo.portada ? (
          <div className="relative mx-auto mt-10 aspect-16/9 max-w-4xl overflow-hidden rounded-card bg-pg-bg">
            <Image
              src={articulo.portada}
              alt={articulo.portadaAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div
          className="pg-articulo mx-auto mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: articulo.contenido }}
        />

        {articulo.etiquetas.length > 0 ? (
          <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap gap-2">
            {articulo.etiquetas.map((e) => (
              <li
                key={e}
                className="rounded-pill bg-pg-white px-3 py-1 text-[13px] text-pg-gray shadow-sm"
              >
                {e}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Llamado a la acción */}
        <aside className="mx-auto mt-14 max-w-3xl rounded-card bg-pg-black p-8 text-pg-white lg:p-10">
          <h2 className="text-[26px] text-pg-white">¿Buscas un auto o necesitas una revisión?</h2>
          <p className="mt-3 text-[17px] text-white/80">
            Revisamos cada vehículo antes de publicarlo y hacemos inspecciones pre-compra
            para que no te lleves sorpresas.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <BotonPrincipal href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />}>
              Ver vehículos
            </BotonPrincipal>
            <BotonSecundario
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              icono={<IconoWhatsApp width={20} height={20} />}
              className="border-pg-white bg-transparent hover:bg-pg-white hover:text-pg-ink"
            >
              Consultar por WhatsApp
            </BotonSecundario>
          </div>
        </aside>
      </article>

      {otros.length > 0 ? (
        <section className="bg-pg-white py-16">
          <div className="pg-contenedor">
            <EncabezadoSeccion prefijo="Seguir leyendo" titulo="Otros artículos" />
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {otros.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="group block h-full rounded-card bg-pg-bg p-6 no-underline transition-transform duration-300 hover:-translate-y-1"
                  >
                    <time className="text-[13px] text-pg-muted">{fechaCorta(a.fecha)}</time>
                    <h3 className="mt-2 text-[18px] leading-snug text-pg-ink group-hover:text-pg-red">
                      {a.titulo}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
