"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { guardarVehiculo, type ResultadoGuardado } from "@/app/acciones/vehiculos";
import type { VehiculoAdmin } from "@/lib/admin/vehiculos";
import type { OpcionEquipamiento, Transmision, Traccion } from "@/lib/database.types";
import { generarTitulo, slugificar } from "@/lib/titulo";
import { verificarVehiculo } from "@/lib/coherencia";
import { clp } from "@/lib/formato";
import {
  CARROCERIAS,
  COMBUSTIBLES,
  CONDICIONES,
  ESTADOS,
  ETIQUETA_ESTADO,
  TRACCIONES,
  TRANSMISIONES,
} from "@/lib/esquemas/vehiculo";
import { Campo, Chip, Seccion, claseCampo } from "./campos";
import { CampoPrecio } from "./CampoPrecio";
import { SubidorFotos, type FotoEnPanel } from "./SubidorFotos";
import { BotonPrincipal } from "@/components/ui/Botones";
import { IconoCheck } from "@/components/ui/Iconos";

const inicial: ResultadoGuardado | null = null;

type Props = {
  vehiculo?: VehiculoAdmin;
  opciones: OpcionEquipamiento[];
};

export function FormularioVehiculo({ vehiculo, opciones }: Props) {
  const [estado, accion, guardando] = useActionState(guardarVehiculo, inicial);

  // Campos que alimentan el título automático y las advertencias en vivo.
  const [marca, setMarca] = useState(vehiculo?.marca ?? "");
  const [modelo, setModelo] = useState(vehiculo?.modelo ?? "");
  const [version, setVersion] = useState(vehiculo?.version ?? "");
  const [motor, setMotor] = useState(vehiculo?.motor ?? "");
  const [transmision, setTransmision] = useState<Transmision | "">(vehiculo?.transmision ?? "");
  const [traccion, setTraccion] = useState<Traccion | "">(vehiculo?.traccion ?? "");
  const [puertas, setPuertas] = useState(vehiculo?.puertas ? String(vehiculo.puertas) : "");
  const [anio, setAnio] = useState(vehiculo?.anio ? String(vehiculo.anio) : "");
  const [combustible, setCombustible] = useState(vehiculo?.combustible ?? "");
  const [kilometraje, setKilometraje] = useState(
    vehiculo?.kilometraje != null ? String(vehiculo.kilometraje) : "",
  );
  const [precio, setPrecio] = useState<number | null>(vehiculo?.precio ?? null);
  const [precioOferta, setPrecioOferta] = useState<number | null>(vehiculo?.precio_oferta ?? null);

  const [tituloManual, setTituloManual] = useState(vehiculo?.titulo ?? "");
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [slugManual, setSlugManual] = useState(vehiculo?.slug ?? "");
  const [fotos, setFotos] = useState<FotoEnPanel[]>(
    (vehiculo?.fotos ?? []).map((f) => ({
      id: f.id,
      storage_path: f.storage_path,
      estado: "listo" as const,
      progreso: 100,
    })),
  );

  const tituloAutomatico = useMemo(
    () =>
      generarTitulo({
        marca,
        modelo,
        version,
        motor,
        transmision: transmision || null,
        puertas: puertas ? Number(puertas) : null,
        traccion: traccion || null,
        anio: anio ? Number(anio) : null,
      }),
    [marca, modelo, version, motor, transmision, puertas, traccion, anio],
  );

  const titulo = editandoTitulo ? tituloManual : tituloAutomatico;

  // El slug de un vehículo ya publicado no cambia: rompería su URL.
  const esNuevo = !vehiculo;
  const slug = esNuevo ? (slugManual || slugificar(titulo)) : vehiculo.slug;

  const hallazgos = useMemo(
    () =>
      verificarVehiculo({
        titulo,
        anio: anio ? Number(anio) : null,
        kilometraje: kilometraje ? Number(kilometraje) : null,
        transmision: (transmision || null) as Transmision | null,
        combustible: (combustible || null) as never,
        traccion: (traccion || null) as Traccion | null,
        puertas: puertas ? Number(puertas) : null,
        precio,
        precio_oferta: precioOferta,
        fotos,
      }),
    [titulo, anio, kilometraje, transmision, combustible, traccion, puertas, precio, precioOferta, fotos],
  );

  const errores = estado?.ok === false ? estado.errores : {};

  // No se puede guardar mientras haya fotos en camino: se perderían sin aviso.
  const fotosEnCurso = fotos.filter(
    (f) => f.estado === "comprimiendo" || f.estado === "subiendo",
  ).length;
  const fotosConError = fotos.filter((f) => f.estado === "error").length;
  const equipamiento = opciones.filter((o) => o.tipo === "equipamiento");
  const seguridad = opciones.filter((o) => o.tipo === "seguridad");

  if (estado?.ok) {
    return (
      <div className="rounded-card bg-pg-white p-8 text-center shadow-pg-card">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pg-check/10">
          <IconoCheck width={32} height={32} className="text-pg-check" />
        </span>
        <h2 className="mt-5 text-[24px]">{estado.mensaje}</h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/admin"
            className="rounded-pill bg-pg-ink px-6 py-3 font-semibold text-pg-white no-underline"
          >
            Volver a la lista
          </Link>
          <a
            href={`/vehiculos-en-venta/${estado.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill border-2 border-pg-ink px-6 py-3 font-semibold text-pg-ink no-underline"
          >
            Ver en el sitio ↗
          </a>
          <Link
            href="/admin/vehiculos/nuevo"
            className="pg-degradado rounded-pill px-6 py-3 font-semibold text-pg-white no-underline"
          >
            + Cargar otro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={accion} className="grid gap-5 pb-32">
      {vehiculo ? <input type="hidden" name="id" value={vehiculo.id} /> : null}
      <input type="hidden" name="titulo" value={titulo} />
      <input type="hidden" name="slug" value={slug} />

      {/* ── Datos básicos ── */}
      <Seccion titulo="Datos básicos" descripcion="Con esto se arma el título del aviso.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Marca" htmlFor="marca" error={errores.marca} requerido>
            <input
              id="marca"
              name="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className={claseCampo(errores.marca)}
              placeholder="Toyota"
              autoComplete="off"
            />
          </Campo>

          <Campo etiqueta="Modelo" htmlFor="modelo" error={errores.modelo} requerido>
            <input
              id="modelo"
              name="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className={claseCampo(errores.modelo)}
              placeholder="4Runner"
              autoComplete="off"
            />
          </Campo>

          <Campo etiqueta="Versión" htmlFor="version" ayuda="Ej: Limited, Advance, GL">
            <input
              id="version"
              name="version"
              value={version ?? ""}
              onChange={(e) => setVersion(e.target.value)}
              className={claseCampo()}
              autoComplete="off"
            />
          </Campo>

          <Campo etiqueta="Motor" htmlFor="motor" ayuda="Ej: V6 4.0, 1.6, 2.8">
            <input
              id="motor"
              name="motor"
              value={motor ?? ""}
              onChange={(e) => setMotor(e.target.value)}
              className={claseCampo()}
              autoComplete="off"
            />
          </Campo>
        </div>

        {/* Título generado */}
        <div className="mt-5 rounded-2xl bg-pg-bg p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-bold uppercase tracking-wide text-pg-red">
              Título del aviso
            </p>
            <button
              type="button"
              onClick={() => {
                if (!editandoTitulo) setTituloManual(tituloAutomatico);
                setEditandoTitulo((v) => !v);
              }}
              className="text-[13px] font-semibold text-pg-ink underline-offset-2 hover:underline"
            >
              {editandoTitulo ? "Volver al automático" : "Editar a mano"}
            </button>
          </div>

          {editandoTitulo ? (
            <input
              value={tituloManual}
              onChange={(e) => setTituloManual(e.target.value)}
              className={`${claseCampo(errores.titulo)} mt-2`}
            />
          ) : (
            <p className="mt-1 font-titulo text-[19px] text-pg-ink">
              {titulo || "Completa marca y modelo…"}
            </p>
          )}

          {errores.titulo ? (
            <p className="mt-1.5 text-[13px] font-semibold text-pg-red">{errores.titulo}</p>
          ) : null}

          <p className="mt-3 break-all text-[12px] text-pg-muted">
            URL: /vehiculos-en-venta/<strong>{slug || "…"}</strong>
            {!esNuevo ? " · no cambia para no romper el enlace ya publicado" : ""}
          </p>
          {esNuevo ? (
            <input
              value={slugManual}
              onChange={(e) => setSlugManual(slugificar(e.target.value))}
              placeholder="Dejar vacío para generarla del título"
              className={`${claseCampo(errores.slug)} mt-2 text-[13px]`}
            />
          ) : null}
          {errores.slug ? (
            <p className="mt-1.5 text-[13px] font-semibold text-pg-red">{errores.slug}</p>
          ) : null}
        </div>
      </Seccion>

      {/* ── Precio ── */}
      <Seccion titulo="Precio">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Precio" htmlFor="precio" error={errores.precio} requerido>
            <CampoPrecio
              id="precio"
              name="precio"
              defaultValue={vehiculo?.precio}
              error={errores.precio}
              onValor={setPrecio}
            />
          </Campo>

          <Campo
            etiqueta="Precio de oferta"
            htmlFor="precio_oferta"
            error={errores.precio_oferta}
            ayuda="Opcional. Se muestra destacado y el precio normal tachado."
          >
            <CampoPrecio
              id="precio_oferta"
              name="precio_oferta"
              defaultValue={vehiculo?.precio_oferta}
              error={errores.precio_oferta}
              onValor={setPrecioOferta}
            />
          </Campo>
        </div>

        {precio && precioOferta && precioOferta < precio ? (
          <p className="mt-3 text-[14px] text-pg-gray">
            El cliente verá <strong>{clp(precioOferta)}</strong> y{" "}
            <span className="line-through">{clp(precio)}</span> tachado
            {" "}(ahorro de {clp(precio - precioOferta)}).
          </p>
        ) : null}
      </Seccion>

      {/* ── Ficha técnica ── */}
      <Seccion titulo="Ficha técnica">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Campo etiqueta="Año" htmlFor="anio" error={errores.anio} requerido>
            <input
              id="anio"
              name="anio"
              inputMode="numeric"
              value={anio}
              onChange={(e) => setAnio(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={claseCampo(errores.anio)}
              placeholder="2018"
            />
          </Campo>

          <Campo etiqueta="Kilometraje" htmlFor="kilometraje" error={errores.kilometraje} requerido>
            <input
              id="kilometraje"
              name="kilometraje"
              inputMode="numeric"
              value={kilometraje}
              onChange={(e) => setKilometraje(e.target.value.replace(/\D/g, ""))}
              className={claseCampo(errores.kilometraje)}
              placeholder="145000"
            />
          </Campo>

          <Campo etiqueta="Transmisión" htmlFor="transmision" error={errores.transmision} requerido>
            <select
              id="transmision"
              name="transmision"
              value={transmision}
              onChange={(e) => setTransmision(e.target.value as Transmision)}
              className={claseCampo(errores.transmision)}
            >
              <option value="">Elegir…</option>
              {TRANSMISIONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Combustible" htmlFor="combustible" error={errores.combustible} requerido>
            <select
              id="combustible"
              name="combustible"
              value={combustible}
              onChange={(e) => setCombustible(e.target.value as typeof combustible)}
              className={claseCampo(errores.combustible)}
            >
              <option value="">Elegir…</option>
              {COMBUSTIBLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Tracción" htmlFor="traccion">
            <select
              id="traccion"
              name="traccion"
              value={traccion}
              onChange={(e) => setTraccion(e.target.value as Traccion)}
              className={claseCampo()}
            >
              <option value="">Sin especificar</option>
              {TRACCIONES.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Puertas" htmlFor="puertas">
            <select
              id="puertas"
              name="puertas"
              value={puertas}
              onChange={(e) => setPuertas(e.target.value)}
              className={claseCampo()}
            >
              <option value="">Sin especificar</option>
              {[2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Estado del vehículo" htmlFor="condicion">
            <select
              id="condicion"
              name="condicion"
              defaultValue={vehiculo?.condicion ?? ""}
              className={claseCampo()}
            >
              <option value="">Sin especificar</option>
              {CONDICIONES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Carrocería" htmlFor="carroceria">
            <select
              id="carroceria"
              name="carroceria"
              defaultValue={vehiculo?.carroceria ?? ""}
              className={claseCampo()}
            >
              <option value="">Sin especificar</option>
              {CARROCERIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Color" htmlFor="color">
            <input
              id="color"
              name="color"
              defaultValue={vehiculo?.color ?? ""}
              className={claseCampo()}
              placeholder="Blanco perlado"
              autoComplete="off"
            />
          </Campo>
        </div>

        <input type="hidden" name="ubicacion" value={vehiculo?.ubicacion ?? "Santiago, Chile"} />
      </Seccion>

      {/* ── Equipamiento y seguridad ── */}
      <Seccion titulo="Equipamiento y seguridad" descripcion="Toca para marcar lo que trae.">
        <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-pg-red">
          Equipamiento
        </p>
        <div className="flex flex-wrap gap-2">
          {equipamiento.map((o) => (
            <Chip
              key={o.slug}
              name="equipamiento"
              value={o.slug}
              etiqueta={o.label}
              defaultChecked={vehiculo?.equipamiento.includes(o.slug)}
            />
          ))}
        </div>

        <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-pg-red">
          Seguridad
        </p>
        <div className="flex flex-wrap gap-2">
          {seguridad.map((o) => (
            <Chip
              key={o.slug}
              name="seguridad"
              value={o.slug}
              etiqueta={o.label}
              defaultChecked={vehiculo?.seguridad.includes(o.slug)}
            />
          ))}
        </div>
      </Seccion>

      {/* ── Fotos ── */}
      <Seccion
        titulo="Fotos"
        descripcion="La primera es la portada. Arrastra para reordenar. Se comprimen antes de subir."
      >
        <SubidorFotos
          vehiculoId={vehiculo?.id}
          fotos={fotos}
          onCambio={setFotos}
          titulo={titulo}
        />
      </Seccion>

      {/* ── Descripción ── */}
      <Seccion titulo="Descripción" descripcion="Opcional, pero ayuda mucho a vender.">
        <textarea
          name="descripcion"
          rows={6}
          defaultValue={vehiculo?.descripcion ?? ""}
          className={claseCampo()}
          placeholder="Mantenciones al día, segundo dueño, se entrega con revisión técnica vigente…"
        />
      </Seccion>

      {/* ── Publicación ── */}
      <Seccion titulo="Publicación">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Estado" htmlFor="estado">
            <select
              id="estado"
              name="estado"
              defaultValue={vehiculo?.estado ?? "borrador"}
              className={claseCampo()}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </option>
              ))}
            </select>
          </Campo>

          <div className="flex flex-col justify-center gap-3">
            <label className="flex items-center gap-3 text-[15px] text-pg-ink">
              <input
                type="checkbox"
                name="destacado"
                defaultChecked={vehiculo?.destacado}
                className="h-5 w-5 rounded border-pg-border"
              />
              Destacado (aparece primero en el catálogo)
            </label>
            <label className="flex items-center gap-3 text-[15px] text-pg-ink">
              <input
                type="checkbox"
                name="revisado_pg"
                defaultChecked={vehiculo?.revisado_pg}
                className="h-5 w-5 rounded border-pg-border"
              />
              Revisado por PG (muestra el sello en el aviso)
            </label>
          </div>
        </div>
      </Seccion>

      {/* ── Barra fija de guardado ── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-pg-border bg-pg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-3 lg:px-8">
          {hallazgos.length > 0 ? (
            <ul className="mb-2 max-h-24 space-y-1 overflow-y-auto">
              {hallazgos.map((h, i) => (
                <li
                  key={i}
                  className={`text-[13px] ${h.severidad === "error" ? "font-semibold text-pg-red" : "text-pg-muted"}`}
                >
                  {h.severidad === "error" ? "✗" : "!"} {h.mensaje}
                  {h.sugerencia ? ` (sugerido: ${h.sugerencia})` : ""}
                </li>
              ))}
            </ul>
          ) : null}

          {estado?.ok === false && estado.mensaje ? (
            <p role="alert" className="mb-2 text-[14px] font-semibold text-pg-red">
              {estado.mensaje}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="text-[14px] text-pg-muted no-underline hover:text-pg-ink">
              ← Cancelar
            </Link>

            <div className="flex items-center gap-3">
              {fotosEnCurso > 0 ? (
                <span role="status" className="text-[13px] font-semibold text-pg-ink">
                  Subiendo {fotosEnCurso} foto{fotosEnCurso === 1 ? "" : "s"}…
                </span>
              ) : null}
              {fotosConError > 0 ? (
                <span className="text-[13px] font-semibold text-pg-red">
                  {fotosConError} foto{fotosConError === 1 ? "" : "s"} con error
                </span>
              ) : null}

              <BotonPrincipal type="submit" disabled={guardando || fotosEnCurso > 0} icono={null}>
                {guardando
                  ? "Guardando…"
                  : fotosEnCurso > 0
                    ? "Esperando fotos…"
                    : vehiculo
                      ? "Guardar cambios"
                      : "Guardar vehículo"}
              </BotonPrincipal>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
