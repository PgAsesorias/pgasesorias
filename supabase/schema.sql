-- =============================================================
-- PG Asesorías — Esquema Supabase
-- Ejecutar completo en: Supabase > SQL Editor > New query
-- =============================================================

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- -------------------------------------------------------------
-- Tipos
-- -------------------------------------------------------------
do $$ begin
  create type estado_publicacion as enum ('borrador', 'publicado', 'reservado', 'vendido');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------
-- Administradores del panel
-- -------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  nombre     text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- -------------------------------------------------------------
-- Catálogo de opciones de equipamiento / seguridad
-- -------------------------------------------------------------
create table if not exists public.opciones_equipamiento (
  slug   text primary key,
  label  text not null,
  tipo   text not null check (tipo in ('equipamiento', 'seguridad')),
  orden  int  not null default 0
);

insert into public.opciones_equipamiento (slug, label, tipo, orden) values
  ('aire-acondicionado',        'Aire Acondicionado',          'equipamiento', 1),
  ('alzavidrios-electricos',    'Alzavidrios Eléctricos',      'equipamiento', 2),
  ('llantas-aleacion',          'Llantas de Aleación',         'equipamiento', 3),
  ('neblineros',                'Neblineros',                  'equipamiento', 4),
  ('sensor-retroceso',          'Sensor de Retroceso',         'equipamiento', 5),
  ('camara-retroceso',          'Cámara de Retroceso',         'equipamiento', 6),
  ('bluetooth',                 'Bluetooth',                   'equipamiento', 7),
  ('android-auto',              'Android Auto',                'equipamiento', 8),
  ('apple-carplay',             'Apple CarPlay',               'equipamiento', 9),
  ('mando-volante',             'Mando al Volante',            'equipamiento', 10),
  ('espejos-electricos',        'Espejos Eléctricos',          'equipamiento', 11),
  ('airbag-frontal',            'Airbag Frontal',              'seguridad', 1),
  ('airbag-lateral',            'Airbag Lateral',              'seguridad', 2),
  ('anclaje-isofix',            'Anclaje ISOFIX',              'seguridad', 3),
  ('apertura-cierre-distancia', 'Apertura/Cierre a Distancia', 'seguridad', 4),
  ('cierre-centralizado',       'Cierre Centralizado',         'seguridad', 5),
  ('frenos-abs',                'Frenos ABS',                  'seguridad', 6),
  ('control-estabilidad',       'Control de Estabilidad',      'seguridad', 7)
on conflict (slug) do nothing;

-- -------------------------------------------------------------
-- Vehículos
-- -------------------------------------------------------------
create table if not exists public.vehiculos (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  wp_id              int unique,                       -- id original en WordPress (migración)
  titulo             text not null,                    -- título SEO (autogenerado, editable)

  marca              text not null,
  modelo             text not null,
  version            text,
  motor              text,
  anio               int  not null check (anio between 1950 and extract(year from now())::int + 1),
  kilometraje        int  not null check (kilometraje >= 0),
  transmision        text not null check (transmision in ('Automática', 'Manual')),
  combustible        text not null check (combustible in ('Gasolina', 'Diésel', 'Híbrido', 'Eléctrico')),
  traccion           text check (traccion in ('4x2', '4x4', 'AWD')),
  puertas            smallint check (puertas between 2 and 5),
  condicion          text check (condicion in ('Nuevo', 'Seminuevo', 'Usado')),
  ubicacion          text not null default 'Santiago, Chile',

  precio             int  not null check (precio > 0),
  precio_oferta      int  check (precio_oferta is null or (precio_oferta > 0 and precio_oferta < precio)),

  equipamiento       text[] not null default '{}',     -- slugs de opciones_equipamiento
  seguridad          text[] not null default '{}',
  descripcion        text,

  estado             estado_publicacion not null default 'borrador',
  destacado          boolean not null default false,
  publicado_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references auth.users(id)
);

create index if not exists vehiculos_estado_idx   on public.vehiculos (estado, publicado_at desc);
create index if not exists vehiculos_marca_idx    on public.vehiculos (marca);
create index if not exists vehiculos_anio_idx     on public.vehiculos (anio);
create index if not exists vehiculos_precio_idx   on public.vehiculos (precio);

-- Fotos (orden 0 = portada)
create table if not exists public.vehiculo_fotos (
  id           uuid primary key default gen_random_uuid(),
  vehiculo_id  uuid not null references public.vehiculos(id) on delete cascade,
  storage_path text not null,                          -- ruta dentro del bucket "vehiculos"
  orden        int  not null default 0,
  ancho        int,
  alto         int,
  alt          text,
  created_at   timestamptz not null default now()
);

create index if not exists vehiculo_fotos_orden_idx on public.vehiculo_fotos (vehiculo_id, orden);

-- Consultas / leads
create table if not exists public.consultas (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null check (char_length(nombre) between 2 and 120),
  telefono     text check (char_length(telefono) <= 30),
  email        text check (char_length(email) <= 160),
  mensaje      text check (char_length(mensaje) <= 3000),
  vehiculo_id  uuid references public.vehiculos(id) on delete set null,
  origen       text not null default 'contacto',       -- contacto | cotizar | vende_tu_vehiculo | flota
  atendida     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- -------------------------------------------------------------
-- updated_at automático y fecha de publicación
-- -------------------------------------------------------------
create or replace function public.tg_vehiculos_timestamps()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.estado <> 'borrador' and new.publicado_at is null then
    new.publicado_at := now();
  end if;
  return new;
end $$;

drop trigger if exists vehiculos_timestamps on public.vehiculos;
create trigger vehiculos_timestamps
  before insert or update on public.vehiculos
  for each row execute function public.tg_vehiculos_timestamps();

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.admin_users           enable row level security;
alter table public.opciones_equipamiento enable row level security;
alter table public.vehiculos             enable row level security;
alter table public.vehiculo_fotos        enable row level security;
alter table public.consultas             enable row level security;

-- admin_users: solo admins leen; altas se hacen desde el SQL Editor
drop policy if exists "admins leen admins" on public.admin_users;
create policy "admins leen admins" on public.admin_users
  for select using (public.is_admin());

-- opciones: lectura pública, escritura admin
drop policy if exists "opciones lectura publica" on public.opciones_equipamiento;
create policy "opciones lectura publica" on public.opciones_equipamiento
  for select using (true);
drop policy if exists "opciones escritura admin" on public.opciones_equipamiento;
create policy "opciones escritura admin" on public.opciones_equipamiento
  for all using (public.is_admin()) with check (public.is_admin());

-- vehiculos: el público ve todo menos borradores; admin hace todo
drop policy if exists "vehiculos lectura publica" on public.vehiculos;
create policy "vehiculos lectura publica" on public.vehiculos
  for select using (estado <> 'borrador' or public.is_admin());
drop policy if exists "vehiculos escritura admin" on public.vehiculos;
create policy "vehiculos escritura admin" on public.vehiculos
  for all using (public.is_admin()) with check (public.is_admin());

-- fotos: visibles si el vehículo es visible
drop policy if exists "fotos lectura publica" on public.vehiculo_fotos;
create policy "fotos lectura publica" on public.vehiculo_fotos
  for select using (
    exists (select 1 from public.vehiculos v
            where v.id = vehiculo_id and (v.estado <> 'borrador' or public.is_admin()))
  );
drop policy if exists "fotos escritura admin" on public.vehiculo_fotos;
create policy "fotos escritura admin" on public.vehiculo_fotos
  for all using (public.is_admin()) with check (public.is_admin());

-- consultas: cualquiera puede crear, solo admin lee/edita
drop policy if exists "consultas insert publico" on public.consultas;
create policy "consultas insert publico" on public.consultas
  for insert with check (atendida = false);
drop policy if exists "consultas admin" on public.consultas;
create policy "consultas admin" on public.consultas
  for select using (public.is_admin());
drop policy if exists "consultas update admin" on public.consultas;
create policy "consultas update admin" on public.consultas
  for update using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- Storage: bucket público de lectura para fotos
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehiculos', 'vehiculos', true, 10485760, array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do nothing;

drop policy if exists "vehiculos storage lectura" on storage.objects;
create policy "vehiculos storage lectura" on storage.objects
  for select using (bucket_id = 'vehiculos');

drop policy if exists "vehiculos storage admin insert" on storage.objects;
create policy "vehiculos storage admin insert" on storage.objects
  for insert with check (bucket_id = 'vehiculos' and public.is_admin());

drop policy if exists "vehiculos storage admin update" on storage.objects;
create policy "vehiculos storage admin update" on storage.objects
  for update using (bucket_id = 'vehiculos' and public.is_admin());

drop policy if exists "vehiculos storage admin delete" on storage.objects;
create policy "vehiculos storage admin delete" on storage.objects
  for delete using (bucket_id = 'vehiculos' and public.is_admin());

-- -------------------------------------------------------------
-- Dar acceso de admin (ejecutar DESPUÉS de crear el usuario en
-- Authentication > Users). Reemplaza el correo.
-- -------------------------------------------------------------
-- insert into public.admin_users (user_id, email, nombre)
-- select id, email, 'Pablo' from auth.users where email = 'CORREO_DE_PABLO';
