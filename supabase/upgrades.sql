-- =============================================================
-- PG Asesorías — Tablas para los upgrades
-- Ejecutar DESPUÉS de schema.sql, en el SQL Editor de Supabase.
-- =============================================================

-- -------------------------------------------------------------
-- Vehículos: carrocería, color, informe de inspección, video
-- -------------------------------------------------------------
alter table public.vehiculos
  add column if not exists carroceria text
    check (carroceria in ('Sedán','Hatchback','SUV','Camioneta','Station Wagon','Coupé','Furgón','Minivan','Convertible')),
  add column if not exists color text,
  add column if not exists cilindrada text,               -- ej. "1.6", "2.8"
  add column if not exists duenos smallint check (duenos between 1 and 20),
  add column if not exists llaves smallint check (llaves between 0 and 5),
  add column if not exists revisado_pg boolean not null default false,
  add column if not exists informe_path text,             -- PDF en bucket "informes"
  add column if not exists informe_resumen jsonb,         -- checklist: {"motor":"ok","carroceria":"detalles menores",...}
  add column if not exists video_url text,
  add column if not exists vistas int not null default 0;

create index if not exists vehiculos_carroceria_idx on public.vehiculos (carroceria);

-- -------------------------------------------------------------
-- Configuración editable desde el admin (tasa referencial, pie, contadores de la home...)
-- -------------------------------------------------------------
create table if not exists public.config (
  clave       text primary key,
  valor       jsonb not null,
  descripcion text,
  updated_at  timestamptz not null default now()
);

insert into public.config (clave, valor, descripcion) values
  ('financiamiento', '{"pie_minimo_pct": 40, "tasa_mensual_ref_pct": 1.9, "plazos_meses": [12, 24, 36, 48], "requisitos": ["3 últimas liquidaciones de sueldo", "12 últimas cotizaciones de AFP"]}',
   'Parámetros del simulador. La tasa es referencial: confirmar con PG.'),
  ('contadores_home', '{"vehiculos_vendidos": 0, "servicios_realizados": 0, "clientes_satisfechos": 0, "servicios_especializados": 8}',
   'Números de la home. Completar con datos reales.'),
  ('agenda', '{"dias": [1,2,3,4,5], "inicio": "09:00", "fin": "17:00", "bloque_min": 60}',
   'Horario de atención para la agenda de servicios (1 = lunes).')
on conflict (clave) do nothing;

alter table public.config enable row level security;
drop policy if exists "config lectura publica" on public.config;
create policy "config lectura publica" on public.config for select using (true);
drop policy if exists "config admin" on public.config;
create policy "config admin" on public.config for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- Consultas: más contexto del lead
-- -------------------------------------------------------------
alter table public.consultas
  add column if not exists datos jsonb,            -- simulación de crédito, respuestas del formulario, etc.
  add column if not exists pagina text,            -- URL donde se originó
  add column if not exists utm jsonb,              -- utm_source, utm_campaign... de la visita
  add column if not exists estado text not null default 'nuevo'
    check (estado in ('nuevo','contactado','en_proceso','ganado','perdido'));

-- origen admite: contacto | cotizar | financiamiento | tasacion | agenda | flota | whatsapp | chat

-- -------------------------------------------------------------
-- Agenda de servicios
-- -------------------------------------------------------------
create table if not exists public.servicios (
  slug        text primary key,
  nombre      text not null,
  descripcion text,
  duracion_min int not null default 60,
  activo      boolean not null default true,
  orden       int not null default 0
);

insert into public.servicios (slug, nombre, orden) values
  ('consignacion-virtual', 'Consignación Virtual', 1),
  ('inspeccion-pre-compra', 'Inspección Pre-compra', 2),
  ('mantencion', 'Mantención automotriz', 3),
  ('traslado-revision-tecnica', 'Traslado Revisión Técnica', 4),
  ('desabolladura-pintura', 'Desabolladura y pintura', 5),
  ('mecanica-general', 'Mecánica General Automotriz', 6),
  ('diagnostico-repros', 'Diagnóstico Automotriz – Repros', 7),
  ('otros', 'Otros Servicios Automotrices', 8)
on conflict (slug) do nothing;

create table if not exists public.reservas (
  id            uuid primary key default gen_random_uuid(),
  servicio_slug text not null references public.servicios(slug),
  inicio        timestamptz not null,
  fin           timestamptz not null,
  nombre        text not null,
  telefono      text not null,
  email         text,
  vehiculo      text,              -- marca/modelo/patente del cliente
  direccion     text,              -- servicio a domicilio
  notas         text,
  estado        text not null default 'pendiente'
    check (estado in ('pendiente','confirmada','realizada','cancelada')),
  created_at    timestamptz not null default now(),
  check (fin > inicio)
);

create index if not exists reservas_inicio_idx on public.reservas (inicio);

-- Disponibilidad pública sin exponer datos personales
create or replace view public.reservas_ocupadas
with (security_invoker = false) as
  select inicio, fin from public.reservas where estado in ('pendiente','confirmada');

grant select on public.reservas_ocupadas to anon, authenticated;

alter table public.servicios enable row level security;
alter table public.reservas  enable row level security;

drop policy if exists "servicios lectura publica" on public.servicios;
create policy "servicios lectura publica" on public.servicios for select using (activo or public.is_admin());
drop policy if exists "servicios admin" on public.servicios;
create policy "servicios admin" on public.servicios for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reservas insert publico" on public.reservas;
create policy "reservas insert publico" on public.reservas for insert with check (estado = 'pendiente');
drop policy if exists "reservas admin" on public.reservas;
create policy "reservas admin" on public.reservas for select using (public.is_admin());
drop policy if exists "reservas update admin" on public.reservas;
create policy "reservas update admin" on public.reservas for update using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- Eventos de analítica propia (para el dashboard del admin)
-- -------------------------------------------------------------
create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  tipo        text not null check (tipo in ('vista_ficha','clic_whatsapp','clic_telefono','simulador','compartir','favorito')),
  vehiculo_id uuid references public.vehiculos(id) on delete cascade,
  pagina      text,
  utm         jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists eventos_vehiculo_idx on public.eventos (vehiculo_id, tipo, created_at desc);

alter table public.eventos enable row level security;
drop policy if exists "eventos insert publico" on public.eventos;
create policy "eventos insert publico" on public.eventos for insert with check (true);
drop policy if exists "eventos admin" on public.eventos;
create policy "eventos admin" on public.eventos for select using (public.is_admin());

-- -------------------------------------------------------------
-- Alertas de búsqueda (v2)
-- -------------------------------------------------------------
create table if not exists public.alertas (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  filtros    jsonb not null,     -- {"marca":"Toyota","precio_max":20000000,"carroceria":"Camioneta"}
  activa     boolean not null default true,
  token_baja uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.alertas enable row level security;
drop policy if exists "alertas insert publico" on public.alertas;
create policy "alertas insert publico" on public.alertas for insert with check (activa);
drop policy if exists "alertas admin" on public.alertas;
create policy "alertas admin" on public.alertas for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- Storage: informes de inspección (público, PDF) y tasaciones (privado)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('informes',   'informes',   true,  20971520, array['application/pdf']),
  ('tasaciones', 'tasaciones', false, 10485760, array['image/webp','image/jpeg','image/png','image/heic'])
on conflict (id) do nothing;

drop policy if exists "informes lectura" on storage.objects;
create policy "informes lectura" on storage.objects for select using (bucket_id = 'informes');
drop policy if exists "informes admin" on storage.objects;
create policy "informes admin" on storage.objects for all
  using (bucket_id = 'informes' and public.is_admin())
  with check (bucket_id = 'informes' and public.is_admin());

-- Las fotos de tasación las sube el servidor con URLs firmadas (no hay insert anónimo directo).
drop policy if exists "tasaciones admin" on storage.objects;
create policy "tasaciones admin" on storage.objects for all
  using (bucket_id = 'tasaciones' and public.is_admin())
  with check (bucket_id = 'tasaciones' and public.is_admin());

-- -------------------------------------------------------------
-- Contador de vistas por vehículo (atómico, llamado desde el sitio)
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
