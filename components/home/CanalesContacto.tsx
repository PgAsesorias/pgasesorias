import { contacto, redes, whatsappUrl } from "@/lib/site";
import {
  IconoCorreo,
  IconoInstagram,
  IconoTelefono,
  IconoTikTok,
  IconoWhatsApp,
} from "@/components/ui/Iconos";

const canales = [
  {
    etiqueta: "Teléfono",
    valor: contacto.telefono,
    href: `tel:${contacto.telefonoE164}`,
    Icono: IconoTelefono,
    externo: false,
  },
  {
    etiqueta: "WhatsApp",
    valor: contacto.telefono,
    href: whatsappUrl(),
    Icono: IconoWhatsApp,
    externo: true,
  },
  {
    etiqueta: "Instagram",
    valor: redes.instagram.usuario,
    href: redes.instagram.url,
    Icono: IconoInstagram,
    externo: true,
  },
  {
    etiqueta: "TikTok",
    valor: redes.tiktok.usuario,
    href: redes.tiktok.url,
    Icono: IconoTikTok,
    externo: true,
  },
  {
    etiqueta: "Correo electrónico",
    valor: contacto.email,
    href: `mailto:${contacto.email}`,
    Icono: IconoCorreo,
    externo: false,
  },
] as const;

/** Los 5 canales de contacto de la home. */
export function CanalesContacto() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {canales.map(({ etiqueta, valor, href, Icono, externo }) => (
        <li key={etiqueta}>
          <a
            href={href}
            {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="flex h-full flex-col items-center gap-3 rounded-card bg-pg-white p-6 text-center no-underline shadow-pg-card transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="pg-degradado flex h-14 w-14 items-center justify-center rounded-full text-pg-white">
              <Icono width={26} height={26} />
            </span>
            <span className="font-titulo text-[19px] text-pg-ink">{etiqueta}</span>
            <span className="break-all text-[15px] text-pg-gray">{valor}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
