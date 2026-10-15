import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { CanalesContacto } from "@/components/home/CanalesContacto";
import { FormularioConsulta } from "@/components/formularios/FormularioConsulta";
import { IconoPin, IconoReloj } from "@/components/ui/Iconos";
import { contacto, sitio } from "@/lib/site";
import { obtenerVehiculoPorSlug } from "@/lib/vehiculos";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos o agenda tu servicio automotriz. Teléfono, WhatsApp, Instagram, TikTok y correo. Av. Apoquindo 6410, Las Condes, Santiago.",
  alternates: { canonical: "/contacto" },
};

const direccion = `${contacto.direccion.calle}, ${contacto.direccion.comuna}, ${contacto.direccion.ciudad}`;
const mapa = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed&hl=es`;

type Props = { searchParams: Promise<{ vehiculo?: string }> };

export default async function ContactoPage({ searchParams }: Props) {
  const { vehiculo: slug } = await searchParams;
  const vehiculo = slug ? await obtenerVehiculoPorSlug(slug) : null;

  return (
    <>
      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor py-14 lg:py-20">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">Contacto</p>
          <h1 className="mt-3 max-w-4xl text-[34px] leading-tight lg:text-[52px]">
            ¡Escríbenos o agenda tu servicio automotriz!
          </h1>
          <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-white/80">
            ¿Tienes dudas o necesitas un servicio automotriz a domicilio? Estamos
            disponibles por teléfono, WhatsApp, Instagram y TikTok. Escríbenos y te
            respondemos a la brevedad.
          </p>
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-16 pt-8">
        <CanalesContacto />
      </section>

      <section className="pg-contenedor pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {vehiculo ? (
              <div className="mb-6 rounded-card border-2 border-pg-orange bg-pg-white p-5">
                <p className="text-[13px] font-bold uppercase tracking-wide text-pg-red">
                  Cotización por este vehículo
                </p>
                <p className="mt-1 font-titulo text-[20px] text-pg-ink">{vehiculo.titulo}</p>
              </div>
            ) : null}

            <Suspense fallback={<div className="h-96 rounded-card bg-pg-white shadow-pg-card" />}>
              <FormularioConsulta
                origen={vehiculo ? "cotizar" : "contacto"}
                vehiculoSlug={vehiculo?.slug}
                titulo={vehiculo ? "Pide tu cotización" : "Envíanos un mensaje"}
                textoBoton={vehiculo ? "Pedir cotización" : "Enviar mensaje"}
                placeholderMensaje={
                  vehiculo
                    ? "¿Necesitas financiamiento, una prueba de manejo o tienes un auto en parte de pago?"
                    : "Cuéntanos en qué te podemos ayudar"
                }
              />
            </Suspense>
          </div>

          <div>
            <EncabezadoSeccion prefijo="Dónde estamos" titulo="Visítanos" alineacion="izquierda" />

            <ul className="mt-6 space-y-4 text-[16px] text-pg-gray">
              <li className="flex items-start gap-3">
                <IconoPin width={20} height={20} className="mt-1 shrink-0 text-pg-red" />
                <a
                  href={contacto.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:text-pg-red"
                >
                  {direccion}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconoReloj width={20} height={20} className="mt-1 shrink-0 text-pg-red" />
                {contacto.horario}
              </li>
            </ul>

            <div className="mt-6 overflow-hidden rounded-card shadow-pg-card">
              <iframe
                src={mapa}
                title={`Ubicación de ${sitio.nombre}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
