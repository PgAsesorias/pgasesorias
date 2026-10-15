import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Galeria, type FotoGaleria } from "@/components/vehiculos/Galeria";
import { TarjetaVehiculo } from "@/components/vehiculos/TarjetaVehiculo";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Servicios } from "@/components/home/Servicios";
import {
  IconoAuto,
  IconoCheck,
  IconoFlecha,
  IconoPin,
  IconoWhatsApp,
} from "@/components/ui/Iconos";
import { clp, km as fmtKm } from "@/lib/formato";
import {
  listarOpcionesEquipamiento,
  listarSlugsPublicados,
  obtenerRelacionados,
  obtenerVecinos,
  obtenerVehiculoPorSlug,
  urlFoto,
} from "@/lib/vehiculos";
import { etiquetaOpcion } from "@/lib/equipamiento";
import { sitio, whatsappUrl } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listarSlugsPublicados();
  return slugs.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehiculo = await obtenerVehiculoPorSlug(slug);

  if (!vehiculo) {
    return { title: "Vehículo no encontrado", robots: { index: false, follow: true } };
  }

  const precio = clp(vehiculo.precio_oferta ?? vehiculo.precio);
  const descripcion =
    vehiculo.descripcion?.slice(0, 155) ??
    `${vehiculo.titulo} en ${precio}. ${fmtKm(vehiculo.kilometraje)}, ${vehiculo.combustible}, ${vehiculo.transmision}. Revisado por PG Asesorías en Santiago.`;

  const portada = vehiculo.fotos[0];
  const url = `/vehiculos-en-venta/${vehiculo.slug}`;

  return {
    title: vehiculo.titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${vehiculo.titulo} — ${precio}`,
      description: descripcion,
      // Cada ficha usa su propia foto: hoy todas comparten el logo.
      images: portada
        ? [
            {
              url: urlFoto(portada.storage_path),
              width: portada.ancho ?? 1200,
              height: portada.alto ?? 900,
              alt: vehiculo.titulo,
            },
          ]
        : undefined,
    },
  };
}

export default async function FichaVehiculo({ params }: Props) {
  const { slug } = await params;
  const vehiculo = await obtenerVehiculoPorSlug(slug);

  if (!vehiculo) notFound();

  const [opciones, relacionados, vecinos] = await Promise.all([
    listarOpcionesEquipamiento(),
    obtenerRelacionados(vehiculo),
    obtenerVecinos(vehiculo),
  ]);

  const etiqueta = (slugOpcion: string) => etiquetaOpcion(slugOpcion, opciones);

  const fotos: FotoGaleria[] = vehiculo.fotos.map((f, i) => ({
    url: urlFoto(f.storage_path),
    alt: f.alt ?? `${vehiculo.titulo} — foto ${i + 1}`,
    ancho: f.ancho,
    alto: f.alto,
  }));

  const enOferta = vehiculo.precio_oferta != null;
  const urlFicha = `${sitio.url}/vehiculos-en-venta/${vehiculo.slug}`;

  const general = [
    { etiqueta: "Año", valor: String(vehiculo.anio) },
    { etiqueta: "Combustible", valor: vehiculo.combustible },
    { etiqueta: "Transmisión", valor: vehiculo.transmision },
    { etiqueta: "Kilometraje", valor: fmtKm(vehiculo.kilometraje) },
    ...(vehiculo.traccion ? [{ etiqueta: "Tracción", valor: vehiculo.traccion.toUpperCase() }] : []),
    ...(vehiculo.puertas ? [{ etiqueta: "Puertas", valor: String(vehiculo.puertas) }] : []),
    ...(vehiculo.carroceria ? [{ etiqueta: "Carrocería", valor: vehiculo.carroceria }] : []),
    ...(vehiculo.condicion ? [{ etiqueta: "Estado", valor: vehiculo.condicion }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehiculo.titulo,
    brand: { "@type": "Brand", name: vehiculo.marca },
    model: vehiculo.modelo,
    vehicleModelDate: String(vehiculo.anio),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehiculo.kilometraje, unitCode: "KMT" },
    fuelType: vehiculo.combustible,
    vehicleTransmission: vehiculo.transmision,
    ...(vehiculo.puertas ? { numberOfDoors: vehiculo.puertas } : {}),
    image: fotos.slice(0, 5).map((f) => f.url),
    url: urlFicha,
    offers: {
      "@type": "Offer",
      price: vehiculo.precio_oferta ?? vehiculo.precio,
      priceCurrency: "CLP",
      availability:
        vehiculo.estado === "vendido"
          ? "https://schema.org/SoldOut"
          : vehiculo.estado === "reservado"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock",
      url: urlFicha,
      seller: { "@type": "AutoDealer", name: sitio.nombre, url: sitio.url },
    },
  };

  const migas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: sitio.url },
      { "@type": "ListItem", position: 2, name: "Vehículos en venta", item: `${sitio.url}/vehiculos-en-venta` },
      { "@type": "ListItem", position: 3, name: vehiculo.titulo, item: urlFicha },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(migas) }} />

      <div className="pg-contenedor py-10 lg:py-16">
        {/* Migas de pan */}
        <nav aria-label="Ruta" className="mb-8 text-[14px] text-pg-muted">
          <Link href="/" className="no-underline hover:text-pg-red">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/vehiculos-en-venta" className="no-underline hover:text-pg-red">Vehículos en venta</Link>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Galería */}
          <div>
            <Galeria fotos={fotos} titulo={vehiculo.titulo} />
          </div>

          {/* Datos y acciones */}
          <div>
            <p className="flex items-center gap-2 text-[15px] text-pg-muted">
              <IconoPin width={18} height={18} className="text-pg-red" />
              {vehiculo.ubicacion}
            </p>

            <h1 className="mt-3 text-[30px] leading-tight lg:text-[38px]">{vehiculo.titulo}</h1>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-pg-gray">
              <li>{vehiculo.anio}</li>
              <li>{fmtKm(vehiculo.kilometraje)}</li>
              <li>{vehiculo.combustible}</li>
              <li>{vehiculo.transmision}</li>
            </ul>

            {vehiculo.revisado_pg ? (
              <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-pg-check/10 px-4 py-2 text-[15px] font-semibold text-pg-ink">
                <IconoCheck width={18} height={18} className="text-pg-check" />
                Revisado por PG
              </p>
            ) : null}

            <div className="mt-7 rounded-card bg-pg-white p-6 shadow-pg-card">
              {enOferta ? (
                <>
                  <p className="text-[15px] text-pg-muted">
                    Antes <span className="line-through">{clp(vehiculo.precio)}</span>
                  </p>
                  <p className="mt-1 text-[15px] font-bold uppercase tracking-wide text-pg-red">
                    Precio oferta
                  </p>
                  <p className="font-titulo text-[40px] font-bold leading-none text-pg-ink">
                    {clp(vehiculo.precio_oferta!)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-bold uppercase tracking-wide text-pg-red">Precio</p>
                  <p className="font-titulo text-[40px] font-bold leading-none text-pg-ink">
                    {clp(vehiculo.precio)}
                  </p>
                </>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <BotonPrincipal
                  href={whatsappUrl(`Hola PG! Me interesa el ${vehiculo.titulo} publicado en ${urlFicha}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  icono={<IconoWhatsApp width={20} height={20} />}
                  ancho
                >
                  Consultar por WhatsApp
                </BotonPrincipal>
                <BotonSecundario href={`/contacto?vehiculo=${vehiculo.slug}`} ancho>
                  Cotizar
                </BotonSecundario>
              </div>
            </div>
          </div>
        </div>

        {/* General */}
        <section className="mt-16">
          <h2 className="text-[26px]">General</h2>
          <span aria-hidden className="pg-degradado mt-3 block h-1 w-16 rounded-full" />

          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {general.map((d) => (
              <div key={d.etiqueta} className="flex items-center justify-between border-b border-pg-border/60 pb-3">
                <dt className="text-[15px] text-pg-muted">{d.etiqueta}</dt>
                <dd className="text-[16px] font-semibold text-pg-ink">{d.valor}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Equipamiento y seguridad */}
        {vehiculo.equipamiento.length > 0 || vehiculo.seguridad.length > 0 ? (
          <section className="mt-14 grid gap-12 lg:grid-cols-2">
            {vehiculo.equipamiento.length > 0 ? (
              <div>
                <h2 className="text-[26px]">Equipamiento</h2>
                <span aria-hidden className="pg-degradado mt-3 block h-1 w-16 rounded-full" />
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {vehiculo.equipamiento.map((e) => (
                    <li key={e} className="flex items-center gap-2.5 text-[16px] text-pg-gray">
                      <IconoCheck width={18} height={18} className="shrink-0 text-pg-check" />
                      {etiqueta(e)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {vehiculo.seguridad.length > 0 ? (
              <div>
                <h2 className="text-[26px]">Seguridad</h2>
                <span aria-hidden className="pg-degradado mt-3 block h-1 w-16 rounded-full" />
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {vehiculo.seguridad.map((s) => (
                    <li key={s} className="flex items-center gap-2.5 text-[16px] text-pg-gray">
                      <IconoCheck width={18} height={18} className="shrink-0 text-pg-check" />
                      {etiqueta(s)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Descripción */}
        {vehiculo.descripcion ? (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-[26px]">Descripción</h2>
            <span aria-hidden className="pg-degradado mt-3 block h-1 w-16 rounded-full" />
            <div className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-pg-gray">
              {vehiculo.descripcion}
            </div>
          </section>
        ) : null}

        {/* Anterior / siguiente */}
        {vecinos.anterior || vecinos.siguiente ? (
          <nav aria-label="Otros vehículos" className="mt-16 flex flex-wrap justify-between gap-4 border-t border-pg-border/60 pt-8">
            {vecinos.anterior ? (
              <Link
                href={`/vehiculos-en-venta/${vecinos.anterior.slug}`}
                className="group flex max-w-[48%] items-center gap-3 text-pg-ink no-underline"
              >
                <IconoFlecha width={20} height={20} className="rotate-180 text-pg-red transition-transform group-hover:-translate-x-1" />
                <span>
                  <span className="block text-[13px] uppercase text-pg-muted">Anterior</span>
                  <span className="text-[15px] font-semibold group-hover:text-pg-red">
                    {vecinos.anterior.titulo}
                  </span>
                </span>
              </Link>
            ) : <span />}

            {vecinos.siguiente ? (
              <Link
                href={`/vehiculos-en-venta/${vecinos.siguiente.slug}`}
                className="group flex max-w-[48%] items-center gap-3 text-right text-pg-ink no-underline"
              >
                <span>
                  <span className="block text-[13px] uppercase text-pg-muted">Siguiente</span>
                  <span className="text-[15px] font-semibold group-hover:text-pg-red">
                    {vecinos.siguiente.titulo}
                  </span>
                </span>
                <IconoFlecha width={20} height={20} className="text-pg-red transition-transform group-hover:translate-x-1" />
              </Link>
            ) : <span />}
          </nav>
        ) : null}
      </div>

      {/* Otros vehículos */}
      {relacionados.length > 0 ? (
        <section className="bg-pg-white py-16">
          <div className="pg-contenedor">
            <EncabezadoSeccion prefijo="También te puede interesar" titulo="Otros vehículos en venta" />
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {relacionados.map((v) => (
                <TarjetaVehiculo key={v.id} vehiculo={v} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <BotonPrincipal href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />}>
                Ver catálogo completo
              </BotonPrincipal>
            </div>
          </div>
        </section>
      ) : null}

      {/* Servicios */}
      <section className="pg-contenedor py-16">
        <EncabezadoSeccion
          prefijo="Servicios automotrices"
          titulo="¿Compras con nosotros? También lo mantenemos"
          descripcion="Inspección pre-compra, mantención a domicilio, traslado a revisión técnica y mecánica general."
        />
        <div className="mt-12">
          <Servicios limite={4} />
        </div>
      </section>
    </>
  );
}
