import type { Metadata } from "next";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { Servicios } from "@/components/home/Servicios";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IconoAuto, IconoCheck, IconoWhatsApp } from "@/components/ui/Iconos";
import { pasosAgenda, servicios, sitio, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Servicios Automotrices",
  description:
    "Consignación virtual, inspección pre-compra, mantención a domicilio, traslado a revisión técnica, desabolladura y pintura, mecánica general y diagnóstico con scanner en Santiago.",
  alternates: { canonical: "/servicios" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: sitio.nombre,
  url: `${sitio.url}/servicios`,
  areaServed: "Santiago, Chile",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios automotrices",
    itemListElement: servicios.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.titulo, description: s.descripcion },
    })),
  },
};

export default function ServiciosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor py-16 lg:py-24">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">
            Servicios automotrices
          </p>
          <h1 className="mt-3 max-w-4xl text-[36px] leading-tight lg:text-[56px]">
            Todo lo que tu auto necesita, sin que pierdas el día
          </h1>
          <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-white/80">
            Retiramos tu vehículo donde estés, hacemos el trabajo con repuestos de calidad
            y te lo devolvemos limpio con un informe de lo realizado. Atendemos en Santiago
            y alrededores.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <BotonPrincipal
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              icono={<IconoWhatsApp width={20} height={20} />}
            >
              Agendar un servicio
            </BotonPrincipal>
            <BotonSecundario
              href="/contacto"
              className="border-pg-white bg-transparent hover:bg-pg-white hover:text-pg-ink"
            >
              Pedir una cotización
            </BotonSecundario>
          </div>
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-16 pt-8">
        <EncabezadoSeccion
          prefijo="Nuestros servicios"
          titulo="¿En qué te podemos ayudar?"
          descripcion="Somos expertos en soluciones automotrices integrales. Te ayudamos a vender, revisar, mantener y reparar tu vehículo desde un solo lugar."
        />
        <div className="mt-14">
          <Servicios />
        </div>
      </section>

      <section className="bg-pg-white py-16">
        <div className="pg-contenedor">
          <EncabezadoSeccion prefijo="Cómo funciona" titulo="Agendar toma menos de 5 minutos" />
          <ol className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pasosAgenda.map((paso, i) => (
              <Tarjeta key={paso.titulo} como="li" padding="compacto" interactiva>
                <span className="pg-degradado inline-flex h-11 w-11 items-center justify-center rounded-full font-titulo text-xl font-bold text-pg-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-[22px]">{paso.titulo}</h3>
                <p className="mt-2 text-[15px] text-pg-gray">{paso.descripcion}</p>
              </Tarjeta>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-contenedor py-16">
        <div className="grid items-center gap-10 rounded-card bg-pg-black p-8 text-pg-white lg:grid-cols-[1.4fr_1fr] lg:p-14">
          <div>
            <h2 className="text-[30px] text-pg-white lg:text-[38px]">
              ¿No sabes qué servicio necesitas?
            </h2>
            <p className="mt-4 text-[17px] text-white/80">
              Cuéntanos qué le pasa a tu auto y te decimos qué conviene hacer, cuánto
              demora y cuánto cuesta. Sin compromiso.
            </p>
            <ul className="mt-6 space-y-3 text-[16px] text-white/85">
              {[
                "Diagnóstico claro, en palabras simples",
                "Presupuesto antes de empezar cualquier trabajo",
                "Retiro y entrega a domicilio",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <IconoCheck width={20} height={20} className="shrink-0 text-pg-check" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <BotonPrincipal
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              icono={<IconoWhatsApp width={20} height={20} />}
              ancho
            >
              Consultar por WhatsApp
            </BotonPrincipal>
            <BotonSecundario href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />} ancho>
              Ver vehículos en venta
            </BotonSecundario>
          </div>
        </div>
      </section>
    </>
  );
}
