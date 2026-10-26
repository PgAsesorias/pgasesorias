import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarraMovil } from "@/components/layout/BarraMovil";
import { ProveedorConsentimiento } from "@/components/analitica/Consentimiento";
import { BannerCookies } from "@/components/analitica/BannerCookies";
import { ScriptsAnalitica } from "@/components/analitica/Scripts";
import { Rastreador } from "@/components/analitica/Rastreador";

/**
 * Envoltorio del sitio público: header, footer y barra inferior en móvil.
 * El panel (/admin) queda fuera a propósito: tiene su propia navegación, y su
 * botón de guardar quedaba tapado por la barra fija de WhatsApp en el celular.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorConsentimiento>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-pg-white focus:px-5 focus:py-2 focus:font-semibold focus:text-pg-ink"
      >
        Ir al contenido
      </a>

      <Header />

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <Footer />
      <BarraMovil />

      <BannerCookies />
      <ScriptsAnalitica />
      <Rastreador />
    </ProveedorConsentimiento>
  );
}
