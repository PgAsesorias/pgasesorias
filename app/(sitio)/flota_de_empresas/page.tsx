import type { Metadata } from "next";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { FormularioConsulta } from "@/components/formularios/FormularioConsulta";
import { BotonPrincipal } from "@/components/ui/Botones";
import { IconoAuto, IconoCheck, IconoLlave, IconoLupa, IconoReloj } from "@/components/ui/Iconos";
import { whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Flota de Empresas",
  description:
    "Mantención de flotas para empresas en Santiago: retiro y entrega en tus oficinas, informes por vehículo, revisión técnica coordinada y un solo contacto para todo.",
  alternates: { canonical: "/flota_de_empresas" },
};

const beneficios = [
  {
    Icono: IconoReloj,
    titulo: "Tus vehículos siguen trabajando",
    texto:
      "Retiramos y devolvemos en tus oficinas, en el horario que menos afecte la operación. Nadie pierde una jornada llevando el auto al taller.",
  },
  {
    Icono: IconoLupa,
    titulo: "Informe por cada vehículo",
    texto:
      "Cada intervención queda documentada: qué se hizo, qué repuestos se usaron y qué conviene revisar en la próxima mantención.",
  },
  {
    Icono: IconoLlave,
    titulo: "Mantención preventiva",
    texto:
      "Programamos las mantenciones por kilometraje para que no te enteres de un problema cuando el vehículo ya está detenido.",
  },
  {
    Icono: IconoAuto,
    titulo: "Revisión técnica coordinada",
    texto:
      "Nos encargamos del traslado a planta y de la documentación, para que ningún vehículo circule con la revisión vencida.",
  },
];

const incluye = [
  "Mantención preventiva y correctiva",
  "Diagnóstico electrónico con scanner",
  "Desabolladura y pintura",
  "Traslado a revisión técnica",
  "Inspección pre-compra para renovar flota",
  "Gestión de transferencias y documentación",
];

export default function FlotaPage() {
  return (
    <>
      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor py-14 lg:py-20">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">
            Flota para empresas
          </p>
          <h1 className="mt-3 max-w-4xl text-[36px] leading-tight lg:text-[52px]">
            Un solo contacto para toda tu flota
          </h1>
          <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-white/80">
            Mantenemos los vehículos de tu empresa funcionando, con retiro y entrega en tus
            oficinas, informes por vehículo y mantenciones programadas. Tú te preocupas de
            tu negocio; nosotros, de que los autos estén listos.
          </p>
          <div className="mt-9">
            <BotonPrincipal href="#cotizar">Cotizar para mi empresa</BotonPrincipal>
          </div>
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-16 pt-8">
        <EncabezadoSeccion prefijo="Por qué PG" titulo="Pensado para que la flota no se detenga" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {beneficios.map(({ Icono, titulo, texto }) => (
            <Tarjeta key={titulo} padding="compacto" className="flex gap-5">
              <span className="pg-degradado flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-pg-white">
                <Icono width={26} height={26} />
              </span>
              <div>
                <h3 className="text-[21px]">{titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-pg-gray">{texto}</p>
              </div>
            </Tarjeta>
          ))}
        </div>
      </section>

      <section className="bg-pg-white py-16">
        <div className="pg-contenedor grid gap-10 lg:grid-cols-2">
          <div>
            <EncabezadoSeccion prefijo="Qué incluye" titulo="Todos los servicios, un solo proveedor" alineacion="izquierda" />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {incluye.map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-[16px] text-pg-gray">
                  <IconoCheck width={18} height={18} className="mt-1 shrink-0 text-pg-check" />
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card bg-pg-black p-8 text-pg-white lg:p-10">
            <h3 className="text-[24px] text-pg-white">¿Cómo partimos?</h3>
            <ol className="mt-6 space-y-5">
              {[
                "Nos cuentas cuántos vehículos tienes y de qué tipo.",
                "Revisamos el estado de la flota y proponemos un plan de mantención.",
                "Coordinamos retiros y entregas según tu operación.",
                "Recibes informes por vehículo y un historial completo.",
              ].map((paso, i) => (
                <li key={paso} className="flex gap-4">
                  <span className="pg-degradado flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-titulo font-bold text-pg-white">
                    {i + 1}
                  </span>
                  <p className="text-[16px] text-white/85">{paso}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="cotizar" className="pg-contenedor py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <EncabezadoSeccion
              prefijo="Cotización"
              titulo="Cuéntanos de tu flota"
              alineacion="izquierda"
              descripcion="Te respondemos con una propuesta a la medida. Sin compromiso."
            />
            <p className="mt-6 text-[15px] text-pg-muted">
              ¿Prefieres conversarlo?{" "}
              <a
                href={whatsappUrl("Hola PG! Quiero cotizar mantención para la flota de mi empresa 🚗")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-pg-red"
              >
                Escríbenos por WhatsApp
              </a>
            </p>
          </div>

          <FormularioConsulta
            origen="flota"
            titulo="Cotizar para empresa"
            textoBoton="Solicitar propuesta"
            placeholderMensaje="Tipo de vehículos, ciudad de operación, qué servicios necesitas…"
            camposExtra={[
              { nombre: "empresa", etiqueta: "Empresa", requerido: true },
              { nombre: "rut_empresa", etiqueta: "RUT de la empresa" },
              { nombre: "cantidad_vehiculos", etiqueta: "Cantidad de vehículos", tipo: "number" },
              {
                nombre: "tipo_flota",
                etiqueta: "Tipo de flota",
                tipo: "select",
                opciones: ["Autos", "Camionetas", "Furgones", "Mixta"],
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
