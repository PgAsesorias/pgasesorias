import Link from "next/link";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { BotonPrincipal, BotonSecundario } from "@/components/ui/Botones";
import { IconoAuto, IconoWhatsApp } from "@/components/ui/Iconos";
import { menuPrincipal, whatsappUrl } from "@/lib/site";

/** Contenido de la página 404, compartido por el sitio y la raíz. */
export function Contenido404() {
  return (
    <div className="pg-contenedor pg-seccion text-center">
      <p className="font-titulo text-[88px] font-bold leading-none">
        <span className="pg-texto-degradado">404</span>
      </p>

      <EncabezadoSeccion
        titulo="No encontramos esta página"
        descripcion="Puede que el enlace esté antiguo o que el vehículo ya se haya vendido. Te dejamos por dónde seguir."
        className="mt-6"
      />

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BotonPrincipal href="/vehiculos-en-venta" icono={<IconoAuto width={20} height={20} />}>
          Ver vehículos en venta
        </BotonPrincipal>
        <BotonSecundario
          href={whatsappUrl("Hola PG! Estaba buscando algo en la web y no lo encontré 🚗")}
          target="_blank"
          rel="noopener noreferrer"
          icono={<IconoWhatsApp width={20} height={20} />}
        >
          Preguntar por WhatsApp
        </BotonSecundario>
      </div>

      <nav aria-label="Otras páginas" className="mt-14">
        <p className="text-[14px] font-bold uppercase tracking-wide text-pg-red">O ve directo a</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {menuPrincipal.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[16px] font-semibold text-pg-ink no-underline hover:text-pg-red"
              >
                {item.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
