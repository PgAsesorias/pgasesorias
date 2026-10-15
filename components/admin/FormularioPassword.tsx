"use client";

import { useActionState } from "react";
import { cambiarPassword, type EstadoLogin } from "@/app/acciones/auth";
import { BotonPrincipal } from "@/components/ui/Botones";

const inicial: EstadoLogin = null;

export function FormularioPassword() {
  const [estado, accion, enviando] = useActionState(cambiarPassword, inicial);

  return (
    <form action={accion} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold text-pg-ink">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-pg-border px-4 py-2.5 text-[16px]"
        />
      </div>

      <div>
        <label htmlFor="password2" className="mb-1.5 block text-[14px] font-semibold text-pg-ink">
          Repetir contraseña
        </label>
        <input
          id="password2"
          name="password2"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-pg-border px-4 py-2.5 text-[16px]"
        />
      </div>

      {estado?.error ? (
        <p role="alert" className="rounded-2xl bg-pg-red/10 p-3 text-[14px] text-pg-red-dark">
          {estado.error}
        </p>
      ) : null}
      {estado?.aviso ? (
        <p role="status" className="rounded-2xl bg-pg-check/10 p-3 text-[14px] text-pg-ink">
          {estado.aviso}
        </p>
      ) : null}

      <BotonPrincipal type="submit" disabled={enviando} icono={null}>
        {enviando ? "Guardando…" : "Cambiar contraseña"}
      </BotonPrincipal>
    </form>
  );
}
