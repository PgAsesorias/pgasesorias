import Link from "next/link";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IconoAuto, IconoWhatsApp } from "@/components/ui/Iconos";
import { pasosAgenda, whatsappUrl } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ───────── Hero ───────── */}
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

      {/* ───────── Agendar un servicio ───────── */}
      <section className="pg-contenedor pg-seccion">
        <EncabezadoSeccion
          prefijo="Agenda online"
          titulo="¿Quieres agendar un Servicio Automotriz?"
          descripcion={
            <>
              ¿Problemas con tu auto? En PG Asesorías estamos para ayudarte desde la comodidad de
              tu hogar. Reserva online el servicio automotriz que necesitas: consignación virtual,
              mantención automotriz, revisiones pre-compra, mecánica general,
              desabolladura/pintura, entre otros.
            </>
          }
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

      {/* Las secciones restantes de la home (Instagram, contadores, servicios,
          banner, nosotros, vehículos y contacto) se construyen en la fase 4. */}
    </>
  );
}
