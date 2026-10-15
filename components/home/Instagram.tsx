import { redes } from "@/lib/site";
import { BotonPrincipal } from "@/components/ui/Botones";
import { IconoInstagram } from "@/components/ui/Iconos";

/**
 * Banda de Instagram.
 *
 * El sitio actual usa un plugin que hoy muestra imágenes rotas (placeholders).
 * Mientras no se suban las publicaciones reales al Storage (o se conecte la
 * Instagram Graph API, fase 2 de upgrades), se muestra una invitación honesta
 * en vez de fotos falsas.
 */
export function Instagram() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="pg-degradado flex h-16 w-16 items-center justify-center rounded-full text-pg-white">
        <IconoInstagram width={32} height={32} />
      </span>
      <p className="max-w-2xl text-[18px] text-pg-gray">
        Publicamos cada vehículo que entra, los servicios que hacemos y el detrás de
        escena del taller en <strong>{redes.instagram.usuario}</strong>.
      </p>
      <BotonPrincipal
        href={redes.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        icono={<IconoInstagram width={20} height={20} />}
      >
        Seguir en Instagram
      </BotonPrincipal>
    </div>
  );
}
