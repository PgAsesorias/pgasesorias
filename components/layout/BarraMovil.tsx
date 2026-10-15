import Link from "next/link";
import { whatsappUrl } from "@/lib/site";
import { IconoAuto, IconoWhatsApp } from "@/components/ui/Iconos";

/**
 * Barra inferior fija en móvil con las dos acciones principales.
 * Es nueva: el sitio actual obliga a volver arriba para contactar.
 */
export function BarraMovil() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-pg-black/95 backdrop-blur xl:hidden">
      <div className="mx-auto flex max-w-xl items-stretch gap-2 p-2">
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="pg-degradado flex flex-1 items-center justify-center gap-2 rounded-pill px-4 py-3 text-[15px] font-semibold text-pg-white no-underline"
        >
          <IconoWhatsApp width={18} height={18} />
          WhatsApp
        </a>
        <Link
          href="/vehiculos-en-venta"
          className="flex flex-1 items-center justify-center gap-2 rounded-pill border-2 border-pg-white px-4 py-3 text-[15px] font-semibold text-pg-white no-underline"
        >
          <IconoAuto width={18} height={18} />
          Ver autos
        </Link>
      </div>
    </div>
  );
}
