import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconoFlecha } from "./Iconos";

type Comun = {
  children: ReactNode;
  /** Ícono a la derecha. Por defecto, la flecha de marca. `null` lo quita. */
  icono?: ReactNode | null;
  className?: string;
  /** Ocupa todo el ancho disponible (útil en móvil). */
  ancho?: boolean;
};

type ComoEnlace = Comun & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type ComoBoton = Comun & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

type PropsBoton = ComoEnlace | ComoBoton;

const baseClases =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-pill px-7 py-3.5 " +
  "text-[17px] font-semibold leading-tight no-underline " +
  "transition-[box-shadow,background-color,color,transform] duration-200 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

function Contenido({ children, icono }: Pick<Comun, "children" | "icono">) {
  return (
    <>
      <span>{children}</span>
      {icono === null ? null : (icono ?? <IconoFlecha width={18} height={18} />)}
    </>
  );
}

/** Botón principal: degradado naranja→rojo, sombra que desaparece al hover. */
export function BotonPrincipal({ children, icono, className, ancho, ...resto }: PropsBoton) {
  const clases = cn(
    baseClases,
    "pg-degradado text-pg-white shadow-pg-btn hover:shadow-none",
    ancho && "w-full",
    className,
  );

  if ("href" in resto && resto.href) {
    const { href, ...enlace } = resto as ComoEnlace;
    return (
      <Link href={href} className={clases} {...enlace}>
        <Contenido icono={icono}>{children}</Contenido>
      </Link>
    );
  }

  return (
    <button className={clases} {...(resto as ComoBoton)}>
      <Contenido icono={icono}>{children}</Contenido>
    </button>
  );
}

/** Botón secundario: tinta sólida, se invierte al hover. */
export function BotonSecundario({ children, icono, className, ancho, ...resto }: PropsBoton) {
  const clases = cn(
    baseClases,
    "border-2 border-pg-ink bg-pg-ink text-pg-white hover:bg-pg-white hover:text-pg-ink",
    ancho && "w-full",
    className,
  );

  if ("href" in resto && resto.href) {
    const { href, ...enlace } = resto as ComoEnlace;
    return (
      <Link href={href} className={clases} {...enlace}>
        <Contenido icono={icono}>{children}</Contenido>
      </Link>
    );
  }

  return (
    <button className={clases} {...(resto as ComoBoton)}>
      <Contenido icono={icono}>{children}</Contenido>
    </button>
  );
}
