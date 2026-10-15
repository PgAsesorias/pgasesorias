import Image from "next/image";
import Link from "next/link";
import {
  contacto,
  marca,
  menuFooter,
  redes,
  sitio,
  whatsappUrl,
} from "@/lib/site";
import {
  IconoCorreo,
  IconoEstrella,
  IconoInstagram,
  IconoPin,
  IconoReloj,
  IconoTelefono,
  IconoTikTok,
  IconoWhatsApp,
} from "@/components/ui/Iconos";

const direccionCompleta = `${contacto.direccion.calle}, ${contacto.direccion.comuna}, ${contacto.direccion.ciudad}`;
const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed&hl=es`;

export function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-pg-footer text-pg-white">
      <div className="pg-contenedor grid gap-12 py-16 lg:grid-cols-4 lg:gap-10">
        {/* Marca + tagline */}
        <div className="lg:col-span-1">
          <Link href="/" aria-label={`${sitio.nombre} — ir al inicio`} className="inline-block">
            <Image
              src={marca.logo}
              alt={sitio.nombre}
              width={marca.logoAncho}
              height={marca.logoAlto}
              className="h-14 w-auto"
            />
          </Link>
          <p className="mt-5 text-[15px] leading-relaxed text-white/75">{sitio.tagline}</p>

          <div className="mt-6 flex items-center gap-5">
            <a
              href={redes.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${redes.instagram.usuario}`}
              className="text-pg-white transition-colors hover:text-pg-orange"
            >
              <IconoInstagram width={24} height={24} />
            </a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp"
              className="text-pg-white transition-colors hover:text-pg-orange"
            >
              <IconoWhatsApp width={24} height={24} />
            </a>
            <a
              href={redes.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`TikTok ${redes.tiktok.usuario}`}
              className="text-pg-white transition-colors hover:text-pg-orange"
            >
              <IconoTikTok width={24} height={24} />
            </a>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h2 className="text-[22px] text-pg-white">Contacto</h2>
          <span aria-hidden className="pg-degradado mt-3 block h-1 w-12 rounded-full" />

          <ul className="mt-5 space-y-4 text-[15px] text-white/80">
            <li className="flex items-start gap-3">
              <IconoTelefono className="mt-1 shrink-0 text-pg-orange" width={18} height={18} />
              <a href={`tel:${contacto.telefonoE164}`} className="no-underline hover:text-pg-orange">
                {contacto.telefono}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <IconoCorreo className="mt-1 shrink-0 text-pg-orange" width={18} height={18} />
              <a href={`mailto:${contacto.email}`} className="break-all no-underline hover:text-pg-orange">
                {contacto.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <IconoPin className="mt-1 shrink-0 text-pg-orange" width={18} height={18} />
              <a
                href={contacto.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline hover:text-pg-orange"
              >
                {direccionCompleta}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <IconoReloj className="mt-1 shrink-0 text-pg-orange" width={18} height={18} />
              <span>{contacto.horario}</span>
            </li>
          </ul>
        </div>

        {/* Contenido */}
        <div>
          <h2 className="text-[22px] text-pg-white">Contenido</h2>
          <span aria-hidden className="pg-degradado mt-3 block h-1 w-12 rounded-full" />

          <nav aria-label="Enlaces del sitio">
            <ul className="mt-5 space-y-3 text-[15px] text-white/80">
              {menuFooter.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="no-underline hover:text-pg-orange">
                    {item.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mapa + reseña de Google */}
        <div>
          <h2 className="text-[22px] text-pg-white">Dónde estamos</h2>
          <span aria-hidden className="pg-degradado mt-3 block h-1 w-12 rounded-full" />

          <div className="mt-5 overflow-hidden rounded-card">
            <iframe
              src={mapaEmbed}
              title={`Ubicación de ${sitio.nombre} en Google Maps`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-44 w-full border-0"
            />
          </div>

          <a
            href={contacto.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-4 rounded-card bg-white/5 p-4 no-underline transition-colors hover:bg-white/10"
          >
            <div>
              <p className="font-titulo text-xl leading-none text-pg-white">{sitio.nombre}</p>
              <p className="mt-1 text-[13px] text-white/60">Servicio automotriz integral</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-titulo text-2xl leading-none text-pg-white">
                {contacto.mapsCalificacion}
              </p>
              <p className="mt-1 flex gap-0.5 text-pg-yellow" aria-label="5 de 5 estrellas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconoEstrella key={i} width={13} height={13} />
                ))}
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="pg-contenedor flex flex-col items-center justify-between gap-2 py-6 text-[14px] text-white/60 sm:flex-row">
          <p>Copyright © {anio} pgasesorias.cl</p>
          <p>{sitio.razonSocial}</p>
        </div>
      </div>

      {/* Espacio para la barra inferior fija en móvil */}
      <div aria-hidden className="h-16 xl:hidden" />
    </footer>
  );
}
