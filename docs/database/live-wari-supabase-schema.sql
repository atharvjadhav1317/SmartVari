-- SAFE MIGRATION FOR EXISTING SMARTVARI SUPABASE DATABASE
-- This migration preserves existing data and does not drop or recreate existing tables.
-- It adds only genuinely missing columns, creates new helper tables when absent,
-- and applies temporary no-auth policies for the current hackathon phase.

begin;

create extension if not exists pgcrypto;

-- 1) Ensure the core table exists without forcing a destructive recreate.
create table if not exists public.waris (
  id uuid primary key default gen_random_uuid(),
  wari_code text,
  name text,
  source text,
  destination text,
  status text,
  current_lat double precision,
  current_lng double precision,
  current_area text,
  last_updated timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.waris add column if not exists wari_code text;
alter table public.waris add column if not exists name text;
alter table public.waris add column if not exists source text;
alter table public.waris add column if not exists destination text;
alter table public.waris add column if not exists status text;
alter table public.waris add column if not exists current_lat double precision;
alter table public.waris add column if not exists current_lng double precision;
alter table public.waris add column if not exists current_area text;
alter table public.waris add column if not exists last_updated timestamptz;
alter table public.waris add column if not exists created_at timestamptz default now();
alter table public.waris add column if not exists updated_at timestamptz default now();
alter table public.waris add column if not exists start_date date;
alter table public.waris add column if not exists end_date date;
alter table public.waris add column if not exists organizer_name text;
alter table public.waris add column if not exists organizer_contact text;
alter table public.waris add column if not exists description text;

-- 2) Ensure wari_routes exists and add only missing columns used by the frontend.
create table if not exists public.wari_routes (
  id uuid primary key default gen_random_uuid(),
  wari_id uuid,
  source_lat double precision,
  source_lng double precision,
  destination_lat double precision,
  destination_lng double precision,
  route_points jsonb not null default '[]'::jsonb,
  checkpoints jsonb not null default '[]'::jsonb,
  road_geometry jsonb,
  total_distance_km double precision,
  estimated_duration_min double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wari_routes add column if not exists wari_id uuid;
alter table public.wari_routes add column if not exists source_lat double precision;
alter table public.wari_routes add column if not exists source_lng double precision;
alter table public.wari_routes add column if not exists destination_lat double precision;
alter table public.wari_routes add column if not exists destination_lng double precision;
alter table public.wari_routes add column if not exists route_points jsonb default '[]'::jsonb;
alter table public.wari_routes add column if not exists checkpoints jsonb default '[]'::jsonb;
alter table public.wari_routes add column if not exists road_geometry jsonb;
alter table public.wari_routes add column if not exists total_distance_km double precision;
alter table public.wari_routes add column if not exists estimated_duration_min double precision;
alter table public.wari_routes add column if not exists created_at timestamptz default now();
alter table public.wari_routes add column if not exists updated_at timestamptz default now();

-- 3) Create helper tables only when absent.
create table if not exists public.wari_halts (
  id uuid primary key default gen_random_uuid(),
  wari_id uuid not null,
  day_number integer not null default 1,
  sequence_order integer not null default 1,
  halt_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  halt_type text not null default 'OTHER',
  arrival_time timestamptz,
  departure_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wari_halts add column if not exists wari_id uuid;
alter table public.wari_halts add column if not exists day_number integer default 1;
alter table public.wari_halts add column if not exists sequence_order integer default 1;
alter table public.wari_halts add column if not exists halt_name text;
alter table public.wari_halts add column if not exists latitude double precision;
alter table public.wari_halts add column if not exists longitude double precision;
alter table public.wari_halts add column if not exists halt_type text default 'OTHER';
alter table public.wari_halts add column if not exists arrival_time timestamptz;
alter table public.wari_halts add column if not exists departure_time timestamptz;
alter table public.wari_halts add column if not exists notes text;
alter table public.wari_halts add column if not exists created_at timestamptz default now();
alter table public.wari_halts add column if not exists updated_at timestamptz default now();

create table if not exists public.service_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  service_type text not null default 'VOLUNTEER',
  availability text not null default 'AVAILABLE',
  latitude double precision,
  longitude double precision,
  location_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_providers add column if not exists name text;
alter table public.service_providers add column if not exists phone text;
alter table public.service_providers add column if not exists service_type text default 'VOLUNTEER';
alter table public.service_providers add column if not exists availability text default 'AVAILABLE';
alter table public.service_providers add column if not exists latitude double precision;
alter table public.service_providers add column if not exists longitude double precision;
alter table public.service_providers add column if not exists location_updated_at timestamptz;
alter table public.service_providers add column if not exists created_at timestamptz default now();
alter table public.service_providers add column if not exists updated_at timestamptz default now();

create table if not exists public.resource_requests (
  id uuid primary key default gen_random_uuid(),
  wari_id uuid not null,
  halt_id uuid,
  request_latitude double precision,
  request_longitude double precision,
  required_date date,
  required_time time,
  service_provider_id uuid,
  resource_type text not null default 'FOOD',
  quantity numeric(12,2) not null default 0,
  unit text not null default 'units',
  status text not null default 'PENDING',
  delivery_status text default 'PENDING',
  accepted_at timestamptz,
  delivery_started_at timestamptz,
  arrived_at timestamptz,
  delivered_at timestamptz,
  requested_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resource_requests add column if not exists wari_id uuid;
alter table public.resource_requests add column if not exists halt_id uuid;
alter table public.resource_requests add column if not exists request_latitude double precision;
alter table public.resource_requests add column if not exists request_longitude double precision;
alter table public.resource_requests add column if not exists required_date date;
alter table public.resource_requests add column if not exists required_time time;
alter table public.resource_requests add column if not exists service_provider_id uuid;
alter table public.resource_requests add column if not exists resource_type text default 'FOOD';
alter table public.resource_requests add column if not exists quantity numeric(12,2) default 0;
alter table public.resource_requests add column if not exists unit text default 'units';
alter table public.resource_requests add column if not exists status text default 'PENDING';
alter table public.resource_requests add column if not exists delivery_status text default 'PENDING';
alter table public.resource_requests add column if not exists accepted_at timestamptz;
alter table public.resource_requests add column if not exists delivery_started_at timestamptz;
alter table public.resource_requests add column if not exists arrived_at timestamptz;
alter table public.resource_requests add column if not exists delivered_at timestamptz;
alter table public.resource_requests add column if not exists requested_at timestamptz default now();
alter table public.resource_requests add column if not exists fulfilled_at timestamptz;
alter table public.resource_requests add column if not exists notes text;
alter table public.resource_requests add column if not exists created_at timestamptz default now();
alter table public.resource_requests add column if not exists updated_at timestamptz default now();

-- 4) Add compatibility constraints only when they are safe and not already present.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'wari_routes_wari_id_fkey'
  ) then
    alter table public.wari_routes
      add constraint wari_routes_wari_id_fkey
      foreign key (wari_id) references public.waris(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'wari_halts_wari_id_fkey'
  ) then
    alter table public.wari_halts
      add constraint wari_halts_wari_id_fkey
      foreign key (wari_id) references public.waris(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'resource_requests_wari_id_fkey'
  ) then
    alter table public.resource_requests
      add constraint resource_requests_wari_id_fkey
      foreign key (wari_id) references public.waris(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'resource_requests_halt_id_fkey'
  ) then
    alter table public.resource_requests
      add constraint resource_requests_halt_id_fkey
      foreign key (halt_id) references public.wari_halts(id) on delete set null not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'resource_requests_service_provider_fkey'
  ) then
    alter table public.resource_requests
      add constraint resource_requests_service_provider_fkey
      foreign key (service_provider_id) references public.service_providers(id) on delete set null not valid;
  end if;
end $$;

-- 5) Add/ensure CHECK constraints only if the column exists and the condition is compatible.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'wari_halts' and column_name = 'halt_type'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'wari_halts_halt_type_check'
    ) then
      alter table public.wari_halts
        add constraint wari_halts_halt_type_check
        check (halt_type in ('START','REST','FOOD','WATER','MEDICAL','LUNCH','NIGHT','DESTINATION','OTHER')) not valid;
    end if;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'resource_requests' and column_name = 'resource_type'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'resource_requests_resource_type_check'
    ) then
      alter table public.resource_requests
        add constraint resource_requests_resource_type_check
        check (resource_type in ('FOOD','WATER')) not valid;
    end if;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'resource_requests' and column_name = 'status'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'resource_requests_status_check'
    ) then
      alter table public.resource_requests
        add constraint resource_requests_status_check
        check (status in ('PENDING','IN_PROGRESS','FULFILLED','CANCELLED')) not valid;
    end if;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'service_providers' and column_name = 'availability'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'service_providers_availability_check'
    ) then
      alter table public.service_providers
        add constraint service_providers_availability_check
        check (availability in ('AVAILABLE','BUSY','OFFLINE')) not valid;
    end if;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'service_providers' and column_name = 'service_type'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'service_providers_service_type_check'
    ) then
      alter table public.service_providers
        add constraint service_providers_service_type_check
        check (service_type in ('VOLUNTEER','FOOD','WATER','MEDICAL','BOTH')) not valid;
    end if;
  end if;
end $$;

-- 6) Add indexes needed by the frontend and route/halt lookups.
create index if not exists idx_waris_wari_code on public.waris (wari_code);
create index if not exists idx_waris_source_destination on public.waris (source, destination);
create index if not exists idx_waris_status on public.waris (status);
create index if not exists idx_wari_routes_wari_id on public.wari_routes (wari_id);
create index if not exists idx_wari_halts_wari_day on public.wari_halts (wari_id, day_number, sequence_order);
create index if not exists idx_service_providers_location on public.service_providers (availability, latitude, longitude);
create index if not exists idx_resource_requests_wari_status on public.resource_requests (wari_id, status, requested_at desc);
create index if not exists idx_resource_requests_halt_id on public.resource_requests (halt_id);
create index if not exists idx_resource_requests_provider on public.resource_requests (service_provider_id, delivery_status);

-- 7) Keep updated_at in sync without changing existing table ownership or structure.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_waris on public.waris;
create trigger set_updated_at_waris
before update on public.waris
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_wari_routes on public.wari_routes;
create trigger set_updated_at_wari_routes
before update on public.wari_routes
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_wari_halts on public.wari_halts;
create trigger set_updated_at_wari_halts
before update on public.wari_halts
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_resource_requests on public.resource_requests;
create trigger set_updated_at_resource_requests
before update on public.resource_requests
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_service_providers on public.service_providers;
create trigger set_updated_at_service_providers
before update on public.service_providers
for each row
execute function public.set_updated_at();

-- 8) TEMPORARY DEVELOPMENT / HACKATHON RLS POLICIES.
-- These are intentionally broad and table-specific, for the current no-auth frontend phase only.
-- Replace with authenticated-user policies before production.

alter table public.waris enable row level security;
alter table public.wari_routes enable row level security;
alter table public.wari_halts enable row level security;
alter table public.service_providers enable row level security;
alter table public.resource_requests enable row level security;

drop policy if exists "temp_dev_waris_select_anon" on public.waris;
create policy "temp_dev_waris_select_anon" on public.waris
  for select to anon
  using (true);

drop policy if exists "temp_dev_waris_insert_anon" on public.waris;
create policy "temp_dev_waris_insert_anon" on public.waris
  for insert to anon
  with check (true);

drop policy if exists "temp_dev_waris_update_anon" on public.waris;
create policy "temp_dev_waris_update_anon" on public.waris
  for update to anon
  using (true)
  with check (true);

drop policy if exists "temp_dev_wari_routes_select_anon" on public.wari_routes;
create policy "temp_dev_wari_routes_select_anon" on public.wari_routes
  for select to anon
  using (true);

drop policy if exists "temp_dev_wari_routes_insert_anon" on public.wari_routes;
create policy "temp_dev_wari_routes_insert_anon" on public.wari_routes
  for insert to anon
  with check (true);

drop policy if exists "temp_dev_wari_routes_update_anon" on public.wari_routes;
create policy "temp_dev_wari_routes_update_anon" on public.wari_routes
  for update to anon
  using (true)
  with check (true);

drop policy if exists "temp_dev_wari_halts_select_anon" on public.wari_halts;
create policy "temp_dev_wari_halts_select_anon" on public.wari_halts
  for select to anon
  using (true);

drop policy if exists "temp_dev_wari_halts_insert_anon" on public.wari_halts;
create policy "temp_dev_wari_halts_insert_anon" on public.wari_halts
  for insert to anon
  with check (true);

drop policy if exists "temp_dev_wari_halts_update_anon" on public.wari_halts;
create policy "temp_dev_wari_halts_update_anon" on public.wari_halts
  for update to anon
  using (true)
  with check (true);

drop policy if exists "temp_dev_wari_halts_delete_anon" on public.wari_halts;
create policy "temp_dev_wari_halts_delete_anon" on public.wari_halts
  for delete to anon
  using (true);

drop policy if exists "temp_dev_service_providers_select_anon" on public.service_providers;
create policy "temp_dev_service_providers_select_anon" on public.service_providers
  for select to anon
  using (true);

drop policy if exists "temp_dev_service_providers_insert_anon" on public.service_providers;
create policy "temp_dev_service_providers_insert_anon" on public.service_providers
  for insert to anon
  with check (true);

drop policy if exists "temp_dev_service_providers_update_anon" on public.service_providers;
create policy "temp_dev_service_providers_update_anon" on public.service_providers
  for update to anon
  using (true)
  with check (true);

drop policy if exists "temp_dev_resource_requests_select_anon" on public.resource_requests;
create policy "temp_dev_resource_requests_select_anon" on public.resource_requests
  for select to anon
  using (true);

drop policy if exists "temp_dev_resource_requests_insert_anon" on public.resource_requests;
create policy "temp_dev_resource_requests_insert_anon" on public.resource_requests
  for insert to anon
  with check (true);

drop policy if exists "temp_dev_resource_requests_update_anon" on public.resource_requests;
create policy "temp_dev_resource_requests_update_anon" on public.resource_requests
  for update to anon
  using (true)
  with check (true);

commit;
