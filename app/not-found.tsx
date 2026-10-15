import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarraMovil } from "@/components/layout/BarraMovil";
import { Contenido404 } from "@/components/layout/Contenido404";

export const metadata = { title: "Página no encontrada" };

/**
 * 404 para rutas que no calzan con ningún grupo. Repite el armazón público
 * porque la raíz no pasa por el layout del sitio.
 */
export default function NoEncontradaRaiz() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Contenido404 />
      </main>
      <Footer />
      <BarraMovil />
    </>
  );
}
