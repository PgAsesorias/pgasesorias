"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { marca, menuPrincipal, redes, sitio, whatsappUrl } from "@/lib/site";
import { BotonPrincipal } from "@/components/ui/Botones";
import {
  IconoCerrar,
  IconoInstagram,
  IconoMenu,
  IconoTikTok,
  IconoWhatsApp,
} from "@/components/ui/Iconos";

/** ¿La ruta actual corresponde a este item del menú? */
function esActivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);

  // El header se compacta al hacer scroll (mejora sobre el sitio actual).
  useEffect(() => {
    const alScroll = () => setCompacto(window.scrollY > 24);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  // Menú abierto: bloquear el scroll del fondo y permitir cerrar con Escape.
  useEffect(() => {
    if (!abierto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", alTeclado);

    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", alTeclado);
    };
  }, [abierto]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-pg-black text-pg-white",
        "border-b border-white/10 transition-shadow duration-300",
        compacto && "shadow-[0_6px_24px_-12px_rgba(0,0,0,.8)]",
      )}
    >
      <div
        className={cn(
          "pg-contenedor flex items-center justify-between gap-6 transition-[height] duration-300",
          compacto ? "h-[58px]" : "h-[70px]",
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${sitio.nombre} — ir al inicio`}>
          <Image
            src={marca.logo}
            alt={sitio.nombre}
            width={marca.logoAncho}
            height={marca.logoAlto}
            priority
            className={cn("w-auto transition-[height] duration-300", compacto ? "h-9" : "h-11")}
          />
        </Link>

        {/* Menú de escritorio */}
        <nav aria-label="Menú principal" className="hidden xl:block">
          <ul className="flex items-center gap-6">
            {menuPrincipal.map((item) => {
              const activo = esActivo(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "relative block py-2 text-[15px] font-semibold no-underline transition-colors",
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left",
                      "after:scale-x-0 after:bg-pg-orange after:transition-transform after:duration-200",
                      "hover:text-pg-orange hover:after:scale-x-100",
                      activo ? "text-pg-orange after:scale-x-100" : "text-pg-white",
                    )}
                  >
                    {item.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Redes (escritorio) */}
        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <a
            href={redes.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pg-white transition-colors hover:text-pg-orange"
            aria-label={`Instagram ${redes.instagram.usuario}`}
          >
            <IconoInstagram />
          </a>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pg-white transition-colors hover:text-pg-orange"
            aria-label="Escribir por WhatsApp"
          >
            <IconoWhatsApp />
          </a>
          <a
            href={redes.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pg-white transition-colors hover:text-pg-orange"
            aria-label={`TikTok ${redes.tiktok.usuario}`}
          >
            <IconoTikTok />
          </a>
        </div>

        {/* Botón hamburguesa (móvil y tablet) */}
        <button
          ref={botonMenu}
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          className="-mr-2 inline-flex items-center gap-2 rounded-pill p-2 text-pg-white xl:hidden"
        >
          {abierto ? <IconoCerrar width={26} height={26} /> : <IconoMenu width={26} height={26} />}
          <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
      </div>

      {/* Menú móvil a pantalla completa */}
      <div
        id="menu-movil"
        hidden={!abierto}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-pg-black xl:hidden",
          compacto ? "top-[58px]" : "top-[70px]",
        )}
      >
        <nav aria-label="Menú principal (móvil)" className="pg-contenedor py-6">
          <ul className="flex flex-col divide-y divide-white/10">
            {menuPrincipal.map((item) => {
              const activo = esActivo(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={activo ? "page" : undefined}
                    onClick={() => setAbierto(false)}
                    className={cn(
                      "block py-4 font-titulo text-2xl no-underline transition-colors",
                      activo ? "text-pg-orange" : "text-pg-white hover:text-pg-orange",
                    )}
                  >
                    {item.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>

          <BotonPrincipal
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(false)}
            className="mt-8"
            ancho
            icono={<IconoWhatsApp width={20} height={20} />}
          >
            Escríbenos por WhatsApp
          </BotonPrincipal>

          <div className="mt-8 flex items-center justify-center gap-8 pb-10 text-pg-white">
            <a
              href={redes.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${redes.instagram.usuario}`}
              className="transition-colors hover:text-pg-orange"
            >
              <IconoInstagram width={28} height={28} />
            </a>
            <a
              href={redes.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`TikTok ${redes.tiktok.usuario}`}
              className="transition-colors hover:text-pg-orange"
            >
              <IconoTikTok width={28} height={28} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
