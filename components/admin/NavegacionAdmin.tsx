"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/acciones/auth";
import { cn } from "@/lib/cn";
import { IconoAuto, IconoCorreo } from "@/components/ui/Iconos";

const enlaces = [
  { href: "/admin", etiqueta: "Vehículos", Icono: IconoAuto, exacto: true },
  { href: "/admin/consultas", etiqueta: "Consultas", Icono: IconoCorreo, exacto: false },
];

export function NavegacionAdmin({ nombre }: { nombre: string }) {
  const pathname = usePathname();

  const activo = (href: string, exacto: boolean) =>
    exacto ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-pg-black text-pg-white">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 lg:px-8">
        <Link href="/admin" className="font-titulo text-lg font-bold text-pg-white no-underline">
          PG <span className="text-pg-orange">Panel</span>
        </Link>

        <nav aria-label="Secciones del panel" className="flex items-center gap-1">
          {enlaces.map(({ href, etiqueta, Icono, exacto }) => (
            <Link
              key={href}
              href={href}
              aria-current={activo(href, exacto) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-pill px-3 py-1.5 text-[14px] font-semibold no-underline transition-colors",
                activo(href, exacto)
                  ? "bg-white/15 text-pg-white"
                  : "text-white/70 hover:text-pg-white",
              )}
            >
              <Icono width={16} height={16} />
              <span className="hidden sm:inline">{etiqueta}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden text-[13px] text-white/60 no-underline hover:text-pg-orange sm:inline"
          >
            Ver sitio ↗
          </Link>
          <Link
            href="/admin/cuenta"
            className="hidden max-w-[14ch] truncate text-[13px] text-white/60 no-underline hover:text-pg-orange md:inline"
          >
            {nombre}
          </Link>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="rounded-pill border border-white/20 px-3 py-1.5 text-[13px] font-semibold text-pg-white transition-colors hover:bg-white/10"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
