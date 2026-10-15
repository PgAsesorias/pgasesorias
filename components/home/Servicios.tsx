import Image from "next/image";
import { servicios } from "@/lib/site";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IconoAuto, IconoLlave, IconoLupa } from "@/components/ui/Iconos";

/** Los 8 servicios con los textos del sitio actual. */
export function Servicios({ limite }: { limite?: number }) {
  const lista = limite ? servicios.slice(0, limite) : servicios;

  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {lista.map((s) => (
        <Tarjeta key={s.slug} como="li" padding="compacto" interactiva className="flex flex-col">
          <span className="pg-degradado flex h-16 w-16 items-center justify-center rounded-full text-pg-white">
            {s.icono ? (
              <Image src={s.icono} alt="" aria-hidden width={34} height={34} className="h-8 w-8" />
            ) : s.slug === "inspeccion-pre-compra" ? (
              <IconoLupa width={30} height={30} />
            ) : s.slug === "mecanica-general" ? (
              <IconoLlave width={30} height={30} />
            ) : (
              <IconoAuto width={30} height={30} />
            )}
          </span>

          <h3 className="mt-5 text-[21px]">{s.titulo}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-pg-gray">{s.descripcion}</p>
        </Tarjeta>
      ))}
    </ul>
  );
}
