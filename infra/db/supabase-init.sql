-- Jujuy Alerta Territorial
-- Supabase bootstrap script
--
-- Before running this script:
-- 1. In Supabase Dashboard > Database > Extensions, enable `postgis`.
-- 2. Prefer installing it in the default `extensions` schema.

create extension if not exists postgis with schema extensions;

create table if not exists public.alerts (
  id uuid primary key,
  type text not null,
  severity text not null,
  title text not null,
  description text not null,
  geometry extensions.geometry(Point, 4326) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_alerts_geometry on public.alerts using gist (geometry);
create index if not exists idx_alerts_created_at on public.alerts (created_at desc);

create table if not exists public.raster_layers (
  id uuid primary key,
  layer_type text not null,
  asset_path text not null,
  preview_path text not null,
  generated_at timestamptz not null default now()
);

create index if not exists idx_raster_layers_type_time
  on public.raster_layers (layer_type, generated_at desc);

create table if not exists public.risk_zones (
  id uuid primary key,
  risk_level text not null,
  score numeric(4, 3) not null,
  geometry extensions.geometry(MultiPolygon, 4326) not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_risk_zones_geometry on public.risk_zones using gist (geometry);
create index if not exists idx_risk_zones_level on public.risk_zones (risk_level);

-- Optional for app-facing direct access later.
alter table public.alerts enable row level security;
alter table public.raster_layers enable row level security;
alter table public.risk_zones enable row level security;

-- Read-only public policies for MVP map consumption.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'alerts' and policyname = 'Public read alerts'
  ) then
    create policy "Public read alerts"
      on public.alerts
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'raster_layers' and policyname = 'Public read raster layers'
  ) then
    create policy "Public read raster layers"
      on public.raster_layers
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'risk_zones' and policyname = 'Public read risk zones'
  ) then
    create policy "Public read risk zones"
      on public.risk_zones
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
