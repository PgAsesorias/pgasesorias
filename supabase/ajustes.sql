-- =============================================================
-- PG Asesorías — Ajustes pendientes
-- Pegar completo en: Supabase → SQL Editor → New query → Run
-- Es seguro ejecutarlo varias veces.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Aviso CRITICAL del panel de Supabase: "Security Definer View"
--
-- La vista `reservas_ocupadas` muestra los bloques de hora ya tomados para que
-- el cliente no pueda pedir una hora ocupada. Como vista, corría con los
-- permisos de quien la creó, saltándose RLS: por eso Supabase la marca.
-- Se reemplaza por una función que hace exactamente lo mismo pero de forma
-- explícita y acotada: devuelve SOLO inicio y fin, nunca nombres ni teléfonos.
-- -------------------------------------------------------------
drop view if exists public.reservas_ocupadas;

create or replace function public.bloques_ocupados(desde timestamptz, hasta timestamptz)
returns table (inicio timestamptz, fin timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.inicio, r.fin
  from public.reservas r
  where r.estado in ('pendiente', 'confirmada')
    and r.inicio >= desde
    and r.inicio < hasta;
$$;

grant execute on function public.bloques_ocupados(timestamptz, timestamptz) to anon, authenticated;

-- -------------------------------------------------------------
-- 2. Contador de vistas por vehículo, atómico
-- -------------------------------------------------------------
create or replace function public.incrementar_vistas(id_vehiculo uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.vehiculos set vistas = vistas + 1 where id = id_vehiculo;
$$;

grant execute on function public.incrementar_vistas(uuid) to anon, authenticated;

-- -------------------------------------------------------------
-- 3. Medir más: tipos de evento nuevos
--
-- Hoy la tabla solo acepta 6 tipos. Se agregan los que responden preguntas de
-- negocio: qué busca la gente y no encuentra (qué autos conviene comprar), qué
-- filtros usa, y qué formularios se envían.
-- -------------------------------------------------------------
alter table public.eventos drop constraint if exists eventos_tipo_check;

alter table public.eventos add constraint eventos_tipo_check check (
  tipo in (
    'vista_ficha',
    'clic_whatsapp',
    'clic_telefono',
    'simulador',
    'compartir',
    'favorito',
    -- nuevos
    'vista_catalogo',          -- alguien entró al catálogo
    'busqueda',                -- usó la caja de búsqueda
    'busqueda_sin_resultados', -- buscó y no había nada: oportunidad de compra
    'filtro',                  -- aplicó un filtro (marca, precio, etc.)
    'formulario_enviado',      -- dejó sus datos
    'ficha_galeria'            -- abrió las fotos a pantalla completa
  )
);

-- Detalle del evento: término buscado, filtro aplicado, origen del formulario.
alter table public.eventos add column if not exists detalle jsonb;

create index if not exists eventos_tipo_fecha_idx on public.eventos (tipo, created_at desc);

-- -------------------------------------------------------------
-- Comprobación
-- -------------------------------------------------------------
select
  (select count(*) from pg_proc where proname = 'bloques_ocupados')   as fn_bloques_ocupados,
  (select count(*) from pg_proc where proname = 'incrementar_vistas') as fn_incrementar_vistas,
  (select count(*) from information_schema.columns
     where table_name = 'eventos' and column_name = 'detalle')        as columna_detalle,
  (select count(*) from pg_views where viewname = 'reservas_ocupadas') as vista_antigua_eliminada_si_es_0;
