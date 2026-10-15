"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enviarEnlaceMagico, iniciarSesion, type EstadoLogin } from "@/app/acciones/auth";
import { BotonPrincipal } from "@/components/ui/Botones";
import { cn } from "@/lib/cn";

const inicial: EstadoLogin = null;

export function FormularioLogin() {
  const params = useSearchParams();
  const volver = params.get("volver") ?? "/admin";
  const [modo, setModo] = useState<"password" | "enlace">("password");

  const [estadoPass, accionPass, enviandoPass] = useActionState(iniciarSesion, inicial);
  const [estadoLink, accionLink, enviandoLink] = useActionState(enviarEnlaceMagico, inicial);

  const estado = modo === "password" ? estadoPass : estadoLink;
  const enviando = modo === "password" ? enviandoPass : enviandoLink;

  return (
    <div className="rounded-card bg-pg-white p-7 shadow-pg-card">
      <div className="mb-6 flex rounded-pill bg-pg-bg p-1">
        {(["password", "enlace"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={cn(
              "flex-1 rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors",
              modo === m ? "bg-pg-ink text-pg-white" : "text-pg-gray hover:text-pg-ink",
            )}
          >
            {m === "password" ? "Con contraseña" : "Con enlace al correo"}
          </button>
        ))}
      </div>

      <form action={modo === "password" ? accionPass : accionLink} className="space-y-4">
        <input type="hidden" name="volver" value={volver} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold text-pg-ink">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full rounded-pill border border-pg-border px-5 py-3 text-[16px]"
            placeholder="tucorreo@ejemplo.cl"
          />
        </div>

        {modo === "password" ? (
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold text-pg-ink">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-pill border border-pg-border px-5 py-3 text-[16px]"
              placeholder="••••••••"
            />
          </div>
        ) : (
          <p className="text-[14px] text-pg-muted">
            Te mandamos un enlace al correo. Lo abres desde el celular y entras, sin contraseña.
          </p>
        )}

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

        <BotonPrincipal type="submit" disabled={enviando} icono={null} ancho>
          {enviando ? "Entrando…" : modo === "password" ? "Entrar" : "Enviar enlace"}
        </BotonPrincipal>
      </form>
    </div>
  );
}
