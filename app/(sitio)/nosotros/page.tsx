import type { Metadata } from "next";
import Image from "next/image";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IconoCheck, IconoWhatsApp } from "@/components/ui/Iconos";
import { Contadores } from "@/components/home/Contadores";
import { contacto, marca, sitio, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "PG Asesorías: asesoría automotriz experta en Santiago. Compra, venta, mantención y reparación de vehículos con un servicio profesional, transparente y personalizado.",
  alternates: { canonical: "/nosotros" },
};

const valores = [
  {
    titulo: "Transparencia",
    texto:
      "Te mostramos el estado real del vehículo, con sus detalles buenos y malos. Preferimos perder una venta antes que un cliente.",
  },
  {
    titulo: "Respaldo técnico",
    texto:
      "Cada auto que publicamos pasa por revisión mecánica, estética, electrónica y legal antes de llegar a la vitrina.",
  },
  {
    titulo: "Acompañamiento completo",
    texto:
      "Nos hacemos cargo de la transferencia, la documentación notarial y las validaciones vía Autofact. Tú solo recibes el pago o las llaves.",
  },
  {
    titulo: "Tu tiempo vale",
    texto:
      "Retiramos y entregamos el vehículo donde estés. No pierdes mañanas en un taller esperando novedades.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: sitio.nombre,
  legalName: sitio.razonSocial,
  url: sitio.url,
  telephone: contacto.telefonoE164,
  email: contacto.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: contacto.direccion.calle,
    addressLocality: contacto.direccion.comuna,
    addressRegion: contacto.direccion.region,
    addressCountry: contacto.direccion.pais,
  },
  openingHours: "Mo-Fr 09:00-17:00",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5", bestRating: "5", ratingCount: "1" },
};

export default function NosotrosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor py-16 lg:py-24">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">
            Sobre nosotros
          </p>
          <h1 className="mt-3 max-w-4xl text-[36px] leading-tight lg:text-[52px]">
            PG Asesorías: liderazgo en soluciones automotrices en Chile
          </h1>
          <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-white/80">
            Nos especializamos en brindar soluciones automotrices integrales para personas
            que buscan un servicio profesional, transparente y personalizado. Con años de
            experiencia en el rubro, ayudamos a nuestros clientes a tomar decisiones
            informadas al momento de comprar, vender, mantener o reparar su vehículo.
          </p>
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-16 pt-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Image
            src={marca.fotoTaller}
            alt="Mecánico de PG Asesorías trabajando en un vehículo"
            width={1200}
            height={800}
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="h-auto w-full rounded-card object-cover shadow-pg-card"
            priority
          />
          <div>
            <EncabezadoSeccion
              prefijo="Qué hacemos"
              titulo="Un solo lugar para todo lo que tenga que ver con tu auto"
              alineacion="izquierda"
            />
            <p className="mt-6 text-[17px] leading-relaxed text-pg-gray">
              Partimos ayudando a amigos y familiares a no equivocarse comprando un auto
              usado. Hoy hacemos lo mismo de forma profesional: revisamos, vendemos,
              mantenemos y reparamos vehículos, con el mismo criterio de siempre.
            </p>
            <p className="mt-5 flex items-start gap-3 text-[17px] font-semibold text-pg-ink">
              <IconoCheck width={22} height={22} className="mt-1 shrink-0 text-pg-check" />
              Asesoría automotriz experta en Santiago de Chile para compra, venta y
              mantención de vehículos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotonPrincipal href="/vehiculos-en-venta">Ver vehículos en venta</BotonPrincipal>
              <BotonSecundario href="/servicios">Nuestros servicios</BotonSecundario>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pg-black text-pg-white">
        <DivisorDiagonal color="var(--pg-bg)" variante="arriba" alto={64} />
        <div className="pg-contenedor pb-20 pt-6">
          <Contadores />
        </div>
        <DivisorDiagonal color="var(--pg-bg)" alto={64} />
      </section>

      <section className="pg-contenedor pb-16">
        <EncabezadoSeccion prefijo="Cómo trabajamos" titulo="Lo que nos importa" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {valores.map((v) => (
            <Tarjeta key={v.titulo} padding="compacto">
              <h3 className="text-[22px]">{v.titulo}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-pg-gray">{v.texto}</p>
            </Tarjeta>
          ))}
        </div>
      </section>

      <section className="pg-contenedor pb-24">
        <div className="rounded-card bg-pg-white p-8 text-center shadow-pg-card lg:p-14">
          <h2 className="text-[28px] lg:text-[36px]">¿Conversamos?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] text-pg-gray">
            Estamos en {contacto.direccion.calle}, {contacto.direccion.comuna}.
            {" "}Atendemos {contacto.horario.toLowerCase()}.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotonPrincipal
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              icono={<IconoWhatsApp width={20} height={20} />}
            >
              Escríbenos por WhatsApp
            </BotonPrincipal>
            <BotonSecundario href="/contacto">Ir a contacto</BotonSecundario>
          </div>
        </div>
      </section>
    </>
  );
}
