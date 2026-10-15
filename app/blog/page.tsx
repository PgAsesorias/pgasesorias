import type { Metadata } from "next";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { DivisorDiagonal } from "@/components/ui/DivisorDiagonal";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { IconoInstagram } from "@/components/ui/Iconos";
import { redes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Consejos para comprar, vender y mantener tu vehículo en Chile, escritos por el equipo de PG Asesorías.",
  alternates: { canonical: "/blog" },
  // Mientras no haya artículos publicados, no tiene sentido indexarla.
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return (
    <>
      <section className="bg-pg-black text-pg-white">
        <div className="pg-contenedor py-14 lg:py-20">
          <p className="text-[18px] font-bold uppercase tracking-wide text-pg-orange">Blog</p>
          <h1 className="mt-3 max-w-3xl text-[36px] leading-tight lg:text-[52px]">
            Consejos para comprar, vender y mantener tu auto
          </h1>
        </div>
        <DivisorDiagonal color="var(--pg-bg)" />
      </section>

      <section className="pg-contenedor pb-24 pt-8">
        <EncabezadoSeccion
          prefijo="Próximamente"
          titulo="Estamos preparando los primeros artículos"
          descripcion="Qué revisar antes de comprar un usado, cada cuánto hacer la mantención, cómo funciona la transferencia y en qué fijarse al financiar. Mientras tanto, publicamos todo el día a día en Instagram."
        />

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <BotonPrincipal
            href={redes.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            icono={<IconoInstagram width={20} height={20} />}
          >
            Seguir en Instagram
          </BotonPrincipal>
          <BotonSecundario href="/vehiculos-en-venta">Ver vehículos en venta</BotonSecundario>
        </div>
      </section>
    </>
  );
}
