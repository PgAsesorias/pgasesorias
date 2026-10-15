"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card bg-pg-white p-5 shadow-pg-card lg:p-7">
      <h2 className="text-[20px]">{titulo}</h2>
      {descripcion ? <p className="mt-1 text-[14px] text-pg-muted">{descripcion}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Campo({
  etiqueta,
  htmlFor,
  error,
  ayuda,
  requerido,
  className,
  children,
}: {
  etiqueta: string;
  htmlFor?: string;
  error?: string;
  ayuda?: ReactNode;
  requerido?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-semibold text-pg-ink">
        {etiqueta}
        {requerido ? <span className="text-pg-red"> *</span> : null}
      </label>
      {children}
      {ayuda && !error ? <div className="mt-1.5 text-[13px] text-pg-muted">{ayuda}</div> : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-[13px] font-semibold text-pg-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const claseCampo = (error?: string) =>
  cn(
    "w-full rounded-2xl border bg-pg-white px-4 py-2.5 text-[16px] text-pg-ink",
    "placeholder:text-pg-muted focus:border-pg-orange",
    error ? "border-pg-red" : "border-pg-border",
  );

export function Chip({
  etiqueta,
  name,
  value,
  defaultChecked,
}: {
  etiqueta: string;
  name: string;
  value: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        className={cn(
          "inline-block rounded-pill border px-3.5 py-2 text-[14px] transition-colors",
          "border-pg-border text-pg-gray",
          "peer-checked:border-pg-ink peer-checked:bg-pg-ink peer-checked:text-pg-white",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-pg-orange",
        )}
      >
        {etiqueta}
      </span>
    </label>
  );
}
