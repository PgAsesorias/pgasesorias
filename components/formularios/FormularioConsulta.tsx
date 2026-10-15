"use client";

import { useActionState, useId } from "react";
import { usePathname } from "next/navigation";
import { enviarConsulta } from "@/app/acciones/consultas";
import type { Origen, ResultadoEnvio } from "@/lib/consultas";
import { BotonPrincipal } from "@/components/ui/Botones";
import { IconoCheck, IconoWhatsApp } from "@/components/ui/Iconos";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

type CampoExtra = {
  nombre: string;
  etiqueta: string;
  tipo?: "text" | "number" | "select";
  opciones?: string[];
  requerido?: boolean;
  ayuda?: string;
};

type Props = {
  origen: Origen;
  /** Slug del vehículo, si la consulta viene de una ficha. */
  vehiculoSlug?: string;
  titulo?: string;
  textoBoton?: string;
  /** Campos propios del formulario (tasación, flota…). Se guardan en `datos`. */
  camposExtra?: CampoExtra[];
  placeholderMensaje?: string;
};

const estadoInicial: ResultadoEnvio | null = null;

export function FormularioConsulta({
  origen,
  vehiculoSlug,
  titulo,
  textoBoton = "Enviar mensaje",
  camposExtra = [],
  placeholderMensaje = "Cuéntanos en qué te podemos ayudar",
}: Props) {
  const [estado, accion, enviando] = useActionState(enviarConsulta, estadoInicial);
  const pathname = usePathname();
  const id = useId();

  if (estado?.ok) {
    return (
      <div className="rounded-card bg-pg-white p-8 text-center shadow-pg-card">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pg-check/10">
          <IconoCheck width={32} height={32} className="text-pg-check" />
        </span>
        <h3 className="mt-5 text-[24px]">¡Mensaje enviado!</h3>
        <p className="mt-3 text-pg-gray">{estado.mensaje}</p>
        <p className="mt-6 text-[15px] text-pg-muted">
          ¿Es urgente?{" "}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-pg-red"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    );
  }

  const error = (campo: string) => (estado?.ok === false ? estado.errores[campo] : undefined);

  /** Lo que el visitante ya había escrito, para no hacerlo tipear de nuevo. */
  const previo = (campo: string) =>
    estado?.ok === false ? (estado.valores?.[campo] ?? "") : "";

  return (
    <form action={accion} className="rounded-card bg-pg-white p-6 shadow-pg-card lg:p-8" noValidate>
      {titulo ? <h3 className="mb-6 text-[24px]">{titulo}</h3> : null}

      <input type="hidden" name="origen" value={origen} />
      <input type="hidden" name="pagina" value={pathname} />
      {vehiculoSlug ? <input type="hidden" name="vehiculo_slug" value={vehiculoSlug} /> : null}

      {/* Campo trampa para robots: invisible y fuera del orden de tabulación */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>No llenar</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id={`${id}-nombre`} etiqueta="Nombre" error={error("nombre")} requerido>
          <input
            id={`${id}-nombre`}
            name="nombre"
            defaultValue={previo("nombre")}
            autoComplete="name"
            className={claseInput(error("nombre"))}
            placeholder="Tu nombre"
          />
        </Campo>

        <Campo id={`${id}-telefono`} etiqueta="Teléfono" error={error("telefono")}>
          <input
            id={`${id}-telefono`}
            name="telefono"
            defaultValue={previo("telefono")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={claseInput(error("telefono"))}
            placeholder="+56 9 1234 5678"
          />
        </Campo>

        <Campo
          id={`${id}-email`}
          etiqueta="Correo electrónico"
          error={error("email")}
          className="sm:col-span-2"
        >
          <input
            id={`${id}-email`}
            name="email"
            defaultValue={previo("email")}
            type="email"
            autoComplete="email"
            className={claseInput(error("email"))}
            placeholder="tucorreo@ejemplo.cl"
          />
        </Campo>

        {camposExtra.map((campo) => (
          <Campo
            key={campo.nombre}
            id={`${id}-${campo.nombre}`}
            etiqueta={campo.etiqueta}
            ayuda={campo.ayuda}
            requerido={campo.requerido}
          >
            {campo.tipo === "select" ? (
              <select
                // Tras enviar, React reinicia el formulario: la `key` fuerza a
                // montar de nuevo el select para que recupere lo elegido.
                key={previo(`datos.${campo.nombre}`)}
                id={`${id}-${campo.nombre}`}
                name={`datos.${campo.nombre}`}
                className={claseInput()}
                defaultValue={previo(`datos.${campo.nombre}`)}
              >
                <option value="">Selecciona…</option>
                {campo.opciones?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`${id}-${campo.nombre}`}
                name={`datos.${campo.nombre}`}
                defaultValue={previo(`datos.${campo.nombre}`)}
                type={campo.tipo ?? "text"}
                inputMode={campo.tipo === "number" ? "numeric" : undefined}
                className={claseInput()}
              />
            )}
          </Campo>
        ))}

        <Campo
          id={`${id}-mensaje`}
          etiqueta="Mensaje"
          error={error("mensaje")}
          className="sm:col-span-2"
        >
          <textarea
            id={`${id}-mensaje`}
            name="mensaje"
            rows={4}
            defaultValue={previo("mensaje")}
            className={cn(claseInput(error("mensaje")), "rounded-3xl")}
            placeholder={placeholderMensaje}
          />
        </Campo>
      </div>

      {estado?.ok === false && estado.mensaje ? (
        <p role="alert" className="mt-5 rounded-2xl bg-pg-red/10 p-4 text-[15px] text-pg-red-dark">
          {estado.mensaje}
        </p>
      ) : null}

      <p className="mt-5 text-[13px] text-pg-muted">
        Tus datos se usan solo para responder tu consulta. No los compartimos con terceros.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <BotonPrincipal type="submit" disabled={enviando} icono={null}>
          {enviando ? "Enviando…" : textoBoton}
        </BotonPrincipal>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-[15px] font-semibold text-pg-ink no-underline hover:text-pg-red"
        >
          <IconoWhatsApp width={18} height={18} />
          o escríbenos por WhatsApp
        </a>
      </div>
    </form>
  );
}

function claseInput(error?: string) {
  return cn(
    "w-full rounded-pill border px-5 py-3 text-[16px] text-pg-ink",
    "placeholder:text-pg-muted focus:border-pg-orange",
    error ? "border-pg-red" : "border-pg-border",
  );
}

function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  requerido,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-pg-ink">
        {etiqueta}
        {requerido ? <span className="text-pg-red"> *</span> : null}
      </label>
      {children}
      {ayuda && !error ? <p className="mt-1.5 text-[13px] text-pg-muted">{ayuda}</p> : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-[13px] font-semibold text-pg-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
