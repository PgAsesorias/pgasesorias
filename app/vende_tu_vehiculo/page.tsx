import type { Metadata } from "next";
import Image from "next/image";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { FormularioConsulta } from "@/components/formularios/FormularioConsulta";
import { BotonPrincipal } from "@/components/ui/Botones";
import { IconoCheck, IconoWhatsApp } from "@/components/ui/Iconos";
import { whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compramos tu Vehículo",
  description:
    "Vende tu auto con PG Asesorías: pago inmediato, trato seguro y transparente, o consignación virtual donde nos encargamos de todo. Tasación sin costo en Santiago.",
  alternates: { canonical: "/vende_tu_vehiculo" },
};

const anioActual = new Date().getFullYear();

const opciones = [
  {
    titulo: "Te lo compramos",
    texto:
      "Evaluamos tu vehículo y te hacemos una oferta. Si la aceptas, pago inmediato y nos encargamos de la transferencia.",
    ventajas: ["Pago inmediato", "Sin publicar ni mostrar el auto", "Transferencia incluida"],
  },
  {
    titulo: "Consignación virtual",
    texto:
      "Lo publicamos, filtramos interesados, coordinamos las visitas y cerramos la venta por ti. Tú recibes el pago.",
    ventajas: [
      "Mejor precio de venta",
      "Nosotros atendemos a los interesados",
      "Trámites y notaría supervisados",
    ],
  },
];

export default function VendeTuVehiculoPage() {
  return (
    <>
      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor grid items-center gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:py-20">
          <div>
            <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">
              Compramos tu vehículo
            </p>
            <h1 className="mt-3 text-[36px] leading-tight lg:text-[52px]">
              ¡Véndelo hoy mismo!
            </h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/80">
              Cuéntanos qué tienes y te damos una tasación sin costo. Si prefieres sacarle
              el mejor precio, lo vendemos por ti con nuestra consignación virtual.
            </p>
            <ul className="mt-7 space-y-3 text-[17px] text-white/85">
              {["Pago inmediato", "Total confianza", "Trato seguro y transparente"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <IconoCheck width={20} height={20} className="shrink-0 text-pg-check" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <BotonPrincipal
                href={whatsappUrl("Hola PG! Quiero vender mi vehículo, me pueden tasar? 🚗")}
                target="_blank"
                rel="noopener noreferrer"
                icono={<IconoWhatsApp width={20} height={20} />}
              >
                Tasar por WhatsApp
              </BotonPrincipal>
            </div>
          </div>

          <Image
            src="/marca/compramos-tu-auto.webp"
            alt="PG Asesorías compra tu auto: pago inmediato, total confianza, trato seguro"
            width={900}
            height={1125}
            sizes="(max-width: 1024px) 80vw, 400px"
            priority
            className="h-auto w-full max-w-sm justify-self-center rounded-card"
          />
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-16 pt-8">
        <EncabezadoSeccion
          prefijo="Dos formas de vender"
          titulo="Elige la que más te acomode"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {opciones.map((o) => (
            <Tarjeta key={o.titulo}>
              <h3 className="text-[24px]">{o.titulo}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-pg-gray">{o.texto}</p>
              <ul className="mt-5 space-y-2.5">
                {o.ventajas.map((v) => (
                  <li key={v} className="flex items-center gap-2.5 text-[16px] text-pg-ink">
                    <IconoCheck width={18} height={18} className="shrink-0 text-pg-check" />
                    {v}
                  </li>
                ))}
              </ul>
            </Tarjeta>
          ))}
        </div>
      </section>

      <section className="pg-contenedor pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <EncabezadoSeccion
              prefijo="Tasación sin costo"
              titulo="Cuéntanos de tu vehículo"
              alineacion="izquierda"
              descripcion="Mientras más datos nos des, más precisa es la tasación. Te respondemos con un rango de precio y las opciones que tienes."
            />
            <p className="mt-6 text-[15px] text-pg-muted">
              ¿Prefieres hacerlo por WhatsApp? También funciona: mándanos fotos y el
              kilometraje y te respondemos igual de rápido.
            </p>
          </div>

          <FormularioConsulta
            origen="vende_tu_vehiculo"
            titulo="Pedir tasación"
            textoBoton="Pedir tasación"
            placeholderMensaje="Estado general, detalles conocidos, si tiene mantenciones al día…"
            camposExtra={[
              { nombre: "patente", etiqueta: "Patente", ayuda: "Opcional. Nos ayuda a verificar el modelo exacto." },
              { nombre: "marca_modelo", etiqueta: "Marca y modelo", requerido: true },
              { nombre: "anio", etiqueta: "Año", tipo: "number" },
              { nombre: "kilometraje", etiqueta: "Kilometraje", tipo: "number" },
              {
                nombre: "precio_esperado",
                etiqueta: "Precio esperado (CLP)",
                tipo: "number",
                ayuda: "Opcional",
              },
              {
                nombre: "modalidad",
                etiqueta: "¿Qué prefieres?",
                tipo: "select",
                opciones: ["Que me lo compren", "Consignación virtual", "Aún no lo sé"],
              },
            ]}
          />
        </div>
        <p className="mt-6 text-center text-[13px] text-pg-muted">
          Tasación referencial sujeta a inspección del vehículo. Vigente para vehículos
          desde 1990 hasta {anioActual + 1}.
        </p>
      </section>
    </>
  );
}
