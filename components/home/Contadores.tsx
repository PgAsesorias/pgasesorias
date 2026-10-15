"use client";

import { useEffect, useRef, useState } from "react";
import { contadores } from "@/lib/site";
import { numero } from "@/lib/formato";

/**
 * Contadores con animación al entrar en pantalla.
 * El sitio actual muestra solo un "+" sin número: acá sí se ven.
 * Si el navegador pide menos animación, aparece el número final de inmediato.
 */
export function Contadores() {
  const contenedor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;

    // Si la sección ya está a la vista al cargar, no se anima: se deja el
    // número final (que ya viene renderizado desde el servidor).
    let primeraMedicion = true;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (primeraMedicion) {
          primeraMedicion = false;
          if (entrada.isIntersecting) {
            observador.disconnect();
            return;
          }
          return;
        }
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={contenedor} className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
      {contadores.map((c) => (
        <div key={c.etiqueta} className="text-center">
          <p className="font-titulo text-[56px] font-bold leading-none">
            <span className="pg-texto-degradado">
              <Conteo hasta={c.valor} activo={visible} />
              {c.sufijo}
            </span>
          </p>
          <p className="mx-auto mt-3 max-w-[16rem] text-[16px] text-white/75">{c.etiqueta}</p>
        </div>
      ))}
    </div>
  );
}

function Conteo({ hasta, activo }: { hasta: number; activo: boolean }) {
  // Sin JavaScript, o antes de animar, se muestra el número final: nunca un 0.
  const [valor, setValor] = useState<number | null>(null);

  useEffect(() => {
    if (!activo) return;

    const menosAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duracion = 1400;
    let inicio: number | null = null;
    let frame = 0;

    const paso = (t: number) => {
      inicio ??= t;
      const avance = Math.min((t - inicio) / duracion, 1);
      // easing suave al final
      setValor(Math.round(hasta * (1 - Math.pow(1 - avance, 3))));
      if (avance < 1) frame = requestAnimationFrame(paso);
    };

    // Quien pide menos animación ve el número final de inmediato.
    frame = requestAnimationFrame(menosAnimacion ? () => setValor(hasta) : paso);
    return () => cancelAnimationFrame(frame);
  }, [activo, hasta]);

  return <>{numero(valor ?? hasta)}</>;
}
