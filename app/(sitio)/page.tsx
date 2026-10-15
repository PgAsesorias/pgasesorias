import Image from "next/image";
import Link from "next/link";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IconoAuto, IconoCheck, IconoWhatsApp } from "@/components/ui/Iconos";
import { Contadores } from "@/components/home/Contadores";
import { Servicios } from "@/components/home/Servicios";
import { Instagram } from "@/components/home/Instagram";
import { CanalesContacto } from "@/components/home/CanalesContacto";
import { TarjetaVehiculo } from "@/components/vehiculos/TarjetaVehiculo";
import { listarVehiculos } from "@/lib/vehiculos";
import { marca, pasosAgenda, whatsappUrl } from "@/lib/site";

/** La home se regenera cada 10 minutos, o al guardar desde el admin. */
export const revalidate = 600;

export default async function Home() {
  const { vehiculos } = await listarVehiculos({ porPagina: 3 });

  return (
    <>
      {/* ───────── 1. Hero ───────── */}
      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor pg-seccion">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">
            Bienvenido a PG Asesorías
          </p>

          <h1 className="mt-3 max-w-4xl text-[40px] leading-tight lg:text-[64px]">
            Servicios Automotrices
          </h1>

          <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-white/80">
            <Link href="/vehiculos-en-venta" className="font-semibold text-pg-orange underline-offset-4 hover:underline">
              Compra
            </Link>
            ,{" "}
            <Link href="/vende_tu_vehiculo" className="font-semibold text-pg-orange underline-offset-4 hover:underline">
              vende
            </Link>{" "}
            o{" "}
            <Link href="/servicios" className="font-semibold text-pg-orange underline-offset-4 hover:underline">
              repara
            </Link>{" "}
            tu vehículo con total confianza. Somos expertos en soluciones automotrices de todo
            tipo. Te ayudamos con tu mantención, mecánica vehicular, repuestos o cualquier
            problema automotriz.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <BotonPrincipal href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />}>
              Vehículos en venta
            </BotonPrincipal>
            <BotonSecundario
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              icono={<IconoWhatsApp width={20} height={20} />}
              className="border-pg-white bg-transparent hover:bg-pg-white hover:text-pg-ink"
            >
              Agendar Servicio Automotriz
            </BotonSecundario>
          </div>
        </div>

        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      {/* ───────── 2. Instagram ───────── */}
      <section className="pg-contenedor py-16">
        <Instagram />
      </section>

      {/* ───────── 3. Agendar un servicio ───────── */}
      <section className="pg-contenedor pb-16">
        <EncabezadoSeccion
          prefijo="Agenda online"
          titulo="¿Quieres agendar un Servicio Automotriz?"
          descripcion="¿Problemas con tu auto? En PG Asesorías estamos para ayudarte desde la comodidad de tu hogar. Reserva online el servicio automotriz que necesitas: consignación virtual, mantención automotriz, revisiones pre-compra, mecánica general, desabolladura/pintura, entre otros."
        />

        <ol className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pasosAgenda.map((paso, i) => (
            <Tarjeta key={paso.titulo} padding="compacto" interactiva como="li">
              <span className="pg-degradado inline-flex h-11 w-11 items-center justify-center rounded-full font-titulo text-xl font-bold text-pg-white">
                {i + 1}
              </span>
              <h3 className="mt-5 text-[22px]">{paso.titulo}</h3>
              <p className="mt-2 text-[15px] text-pg-gray">{paso.descripcion}</p>
            </Tarjeta>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <BotonPrincipal href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            Agendar mi servicio automotriz
          </BotonPrincipal>
        </div>
      </section>

      {/* ───────── 4. Contadores ───────── */}
      <section className="bg-pg-black text-pg-white">
        <DivisorDiagonal color="var(--pg-bg)" variante="arriba" alto={64} />
        <div className="pg-contenedor pb-20 pt-6">
          <Contadores />
        </div>
        <DivisorDiagonal color="var(--pg-bg)" alto={64} />
      </section>

      {/* ───────── 5. Servicios ───────── */}
      <section className="pg-contenedor pb-16">
        <EncabezadoSeccion
          prefijo="Servicios automotrices"
          titulo="¿En qué te podemos ayudar?"
          descripcion="Somos expertos en soluciones automotrices integrales. Te ayudamos a vender, revisar, mantener y reparar tu vehículo desde un solo lugar."
        />

        <div className="mt-14">
          <Servicios />
        </div>

        <div className="mt-12 flex justify-center">
          <BotonPrincipal href="/servicios">Nuestros servicios automotrices</BotonPrincipal>
        </div>
      </section>

      {/* ───────── 6. Compramos tu vehículo ───────── */}
      <section className="pg-contenedor pb-16">
        <div className="grid items-center gap-10 overflow-hidden rounded-card bg-pg-black p-8 text-pg-white lg:grid-cols-2 lg:p-14">
          <div>
            <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">
              Compramos tu vehículo
            </p>
            <h2 className="mt-3 text-[32px] text-pg-white lg:text-[40px]">
              ¿Quieres venderlo hoy mismo?
            </h2>
            <ul className="mt-6 space-y-3 text-[17px] text-white/85">
              {["Pago inmediato", "Total confianza", "Trato seguro y transparente"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <IconoCheck width={20} height={20} className="shrink-0 text-pg-check" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <BotonPrincipal href="/vende_tu_vehiculo">Quiero vender mi vehículo</BotonPrincipal>
            </div>
          </div>

          <Link href="/vende_tu_vehiculo" className="block justify-self-center" aria-hidden tabIndex={-1}>
            <Image
              src="/marca/compramos-tu-auto.webp"
              alt=""
              width={900}
              height={1125}
              sizes="(max-width: 1024px) 80vw, 420px"
              className="h-auto w-full max-w-sm rounded-card"
            />
          </Link>
        </div>
      </section>

      {/* ───────── 7. Sobre nosotros ───────── */}
      <section className="pg-contenedor pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Image
            src={marca.fotoTaller}
            alt="Mecánico de PG Asesorías trabajando en el taller"
            width={1200}
            height={800}
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="h-auto w-full rounded-card object-cover shadow-pg-card"
          />

          <div>
            <EncabezadoSeccion
              prefijo="Sobre nosotros"
              titulo="PG Asesorías: liderazgo en soluciones automotrices en Chile"
              alineacion="izquierda"
            />
            <p className="mt-6 text-[17px] leading-relaxed text-pg-gray">
              En PG Asesorías nos especializamos en brindar soluciones automotrices integrales
              para personas que buscan un servicio profesional, transparente y personalizado.
              Con años de experiencia en el rubro, ayudamos a nuestros clientes a tomar
              decisiones informadas al momento de comprar, vender, mantener o reparar su vehículo.
            </p>
            <p className="mt-5 flex items-start gap-3 text-[17px] font-semibold text-pg-ink">
              <IconoCheck width={22} height={22} className="mt-1 shrink-0 text-pg-check" />
              Asesoría automotriz experta en Santiago de Chile para compra, venta y mantención
              de vehículos.
            </p>
            <div className="mt-8">
              <BotonSecundario href="/nosotros">Conoce más sobre nosotros</BotonSecundario>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 8. Vehículos en venta ───────── */}
      <section className="bg-pg-white">
        <DivisorDiagonal color="var(--pg-bg)" variante="arriba" alto={64} />
        <div className="pg-contenedor pb-20">
          <EncabezadoSeccion prefijo="Catálogo" titulo="Vehículos en venta" />

          {vehiculos.length > 0 ? (
            <>
              <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {vehiculos.map((v, i) => (
                  <TarjetaVehiculo key={v.id} vehiculo={v} prioridad={i === 0} />
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <BotonPrincipal href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />}>
                  Ver catálogo completo
                </BotonPrincipal>
              </div>
            </>
          ) : (
            <p className="mt-10 text-center text-pg-gray">
              Estamos actualizando el catálogo.{" "}
              <a href={whatsappUrl()} className="font-semibold text-pg-red">
                Escríbenos por WhatsApp
              </a>{" "}
              y te contamos qué tenemos disponible.
            </p>
          )}
        </div>
        <DivisorDiagonal color="var(--pg-bg)" alto={64} />
      </section>

      {/* ───────── 9. Contacto ───────── */}
      <section className="pg-contenedor pb-24">
        <EncabezadoSeccion
          prefijo="Contacto"
          titulo="¡Escríbenos o agenda tu servicio automotriz!"
          descripcion="¿Tienes dudas o necesitas un servicio automotriz a domicilio? Estamos disponibles por teléfono, WhatsApp, Instagram y TikTok. También puedes agendar tu cita directamente con nosotros."
        />
        <div className="mt-14">
          <CanalesContacto />
        </div>
      </section>
    </>
  );
}
