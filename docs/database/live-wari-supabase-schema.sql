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

-- SmartVari stores one active route per Wari. Add the conflict target required by
-- saveRoute(). If legacy duplicates exist, retain the most complete/latest row
-- for each Wari and remove only obsolete duplicate route rows.
do $$
declare
  duplicate record;
begin
  for duplicate in
    select wari_id
    from public.wari_routes
    where wari_id is not null
    group by wari_id
    having count(*) > 1
  loop
    delete from public.wari_routes route
    where route.wari_id = duplicate.wari_id
      and route.id not in (
        select candidate.id
        from public.wari_routes candidate
        where candidate.wari_id = duplicate.wari_id
        order by
          (case when candidate.road_geometry is not null then 1 else 0 end
           + case when candidate.route_points is not null and candidate.route_points <> '[]'::jsonb then 1 else 0 end
           + case when candidate.source_lat is not null and candidate.destination_lat is not null then 1 else 0 end) desc,
          candidate.updated_at desc nulls last,
          candidate.created_at desc nulls last,
          candidate.id desc
        offset 1
      );
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.wari_routes'::regclass
      and contype = 'u'
      and conkey = array[(select attnum from pg_attribute where attrelid = 'public.wari_routes'::regclass and attname = 'wari_id')::smallint]
  ) then
    alter table public.wari_routes add constraint wari_routes_wari_id_key unique (wari_id);
  end if;
end $$;

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
  food_capacity numeric(12,2) not null default 0,
  water_capacity numeric(12,2) not null default 0,
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
alter table public.service_providers add column if not exists food_capacity numeric(12,2) default 0;
alter table public.service_providers add column if not exists water_capacity numeric(12,2) default 0;
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

create table if not exists public.resource_request_allocations (
  id uuid primary key default gen_random_uuid(),
  resource_request_id uuid not null,
  service_provider_id uuid not null,
  allocated_quantity numeric(12,2) not null,
  status text not null default 'PENDING',
  accepted_at timestamptz,
  delivery_started_at timestamptz,
  arrived_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resource_request_allocations add column if not exists resource_request_id uuid;
alter table public.resource_request_allocations add column if not exists service_provider_id uuid;
alter table public.resource_request_allocations add column if not exists allocated_quantity numeric(12,2) default 0;
alter table public.resource_request_allocations add column if not exists status text default 'PENDING';
alter table public.resource_request_allocations add column if not exists accepted_at timestamptz;
alter table public.resource_request_allocations add column if not exists delivery_started_at timestamptz;
alter table public.resource_request_allocations add column if not exists arrived_at timestamptz;
alter table public.resource_request_allocations add column if not exists delivered_at timestamptz;
alter table public.resource_request_allocations add column if not exists created_at timestamptz default now();
alter table public.resource_request_allocations add column if not exists updated_at timestamptz default now();

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

  if not exists (select 1 from pg_constraint where conname = 'resource_request_allocations_request_fkey') then
    alter table public.resource_request_allocations
      add constraint resource_request_allocations_request_fkey
      foreign key (resource_request_id) references public.resource_requests(id) on delete cascade not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'resource_request_allocations_provider_fkey') then
    alter table public.resource_request_allocations
      add constraint resource_request_allocations_provider_fkey
      foreign key (service_provider_id) references public.service_providers(id) on delete cascade not valid;
  end if;

end $$;

-- Remove only accidental duplicate FKs for the same provider relationship.
-- Other provider relationships, if any, are preserved.
do $$
declare
  duplicate_fk record;
begin
  for duplicate_fk in
    select constraint_name
    from (
      select c.conname as constraint_name,
             row_number() over (order by c.conname) as relationship_number
      from pg_constraint c
      join pg_class source_table on source_table.oid = c.conrelid
      join pg_class target_table on target_table.oid = c.confrelid
      join pg_attribute source_column on source_column.attrelid = c.conrelid and source_column.attnum = c.conkey[1]
      join pg_attribute target_column on target_column.attrelid = c.confrelid and target_column.attnum = c.confkey[1]
      where c.contype = 'f'
        and source_table.oid = 'public.resource_requests'::regclass
        and target_table.oid = 'public.service_providers'::regclass
        and source_column.attname = 'service_provider_id'
        and target_column.attname = 'id'
        and c.conname <> 'resource_requests_service_provider_fkey'
        and array_length(c.conkey, 1) = 1
        and array_length(c.confkey, 1) = 1
    ) relationships
    where relationship_number >= 1
  loop
    execute format('alter table public.resource_requests drop constraint if exists %I', duplicate_fk.constraint_name);
  end loop;
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

  if not exists (select 1 from pg_constraint where conname = 'service_providers_food_capacity_check') then
    alter table public.service_providers add constraint service_providers_food_capacity_check check (food_capacity >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'service_providers_water_capacity_check') then
    alter table public.service_providers add constraint service_providers_water_capacity_check check (water_capacity >= 0) not valid;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'resource_requests' and column_name = 'delivery_status'
  ) then
    if not exists (
      select 1 from pg_constraint where conname = 'resource_requests_delivery_status_check'
    ) then
      alter table public.resource_requests
        add constraint resource_requests_delivery_status_check
        check (delivery_status in ('PENDING','ACCEPTED','IN_TRANSIT','ARRIVED','DELIVERED','CANCELLED')) not valid;
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
create index if not exists idx_resource_request_allocations_provider on public.resource_request_allocations (service_provider_id, status);
create index if not exists idx_resource_request_allocations_request on public.resource_request_allocations (resource_request_id);

create or replace function public.sync_resource_request_allocation_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  allocation_count integer;
  delivered_count integer;
  active_status text;
begin
  select count(*) filter (where status <> 'DECLINED'),
         count(*) filter (where status <> 'DECLINED' and status = 'DELIVERED')
    into allocation_count, delivered_count
  from public.resource_request_allocations
  where resource_request_id = new.resource_request_id;

  if allocation_count > 0 and delivered_count = allocation_count then
    update public.resource_requests
    set delivery_status = 'DELIVERED', status = 'FULFILLED', fulfilled_at = coalesce(fulfilled_at, now()), updated_at = now()
    where id = new.resource_request_id;
  else
    select status into active_status
    from public.resource_request_allocations
    where resource_request_id = new.resource_request_id
      and status <> 'DECLINED'
    order by case status when 'IN_TRANSIT' then 1 when 'ARRIVED' then 2 when 'ACCEPTED' then 3 else 4 end
    limit 1;
    update public.resource_requests
    set delivery_status = coalesce(active_status, 'PENDING'), updated_at = now()
    where id = new.resource_request_id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_resource_request_allocation_status on public.resource_request_allocations;
create trigger sync_resource_request_allocation_status
after insert or update of status on public.resource_request_allocations
for each row execute function public.sync_resource_request_allocation_status();

-- Assigns the unallocated remainder using the same nearest-provider and capacity rules.
-- The request lock makes decline + reassignment one atomic operation.
create or replace function public.allocate_resource_request_remaining(p_request_id uuid)
returns numeric
language plpgsql
security invoker
set search_path = public
as $$
declare
  request_row public.resource_requests;
  provider record;
  locked_provider public.service_providers;
  normalized_resource_type text;
  remaining_quantity numeric;
  provider_capacity numeric;
  declared_capacity numeric;
  used_capacity numeric;
begin
  select * into request_row
  from public.resource_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Resource request not found: %', p_request_id;
  end if;

  normalized_resource_type := upper(coalesce(request_row.resource_type, 'FOOD'));
  select greatest(
    coalesce(request_row.quantity, 0) - coalesce(sum(allocated_quantity) filter (where status <> 'DECLINED'), 0),
    0
  ) into remaining_quantity
  from public.resource_request_allocations
  where resource_request_id = p_request_id;

  for provider in
    select provider_row.id,
      6371 * acos(least(1, greatest(-1,
        cos(radians(request_row.request_latitude)) * cos(radians(provider_row.latitude)) *
        cos(radians(provider_row.longitude) - radians(request_row.request_longitude)) +
        sin(radians(request_row.request_latitude)) * sin(radians(provider_row.latitude))
      ))) as distance
    from public.service_providers provider_row
    where upper(coalesce(provider_row.availability, '')) = 'AVAILABLE'
      and provider_row.latitude is not null and provider_row.longitude is not null
      and provider_row.latitude between -90 and 90 and provider_row.longitude between -180 and 180
      and (normalized_resource_type not in ('FOOD', 'WATER')
        or (normalized_resource_type = 'FOOD' and coalesce(provider_row.food_capacity, 0) > 0)
        or (normalized_resource_type = 'WATER' and coalesce(provider_row.water_capacity, 0) > 0))
      and (upper(coalesce(provider_row.service_type, 'VOLUNTEER')) in ('VOLUNTEER', 'BOTH')
        or upper(coalesce(provider_row.service_type, '')) = normalized_resource_type)
      and not exists (
        select 1 from public.resource_request_allocations declined
        where declined.resource_request_id = p_request_id
          and declined.service_provider_id = provider_row.id
          and declined.status = 'DECLINED'
      )
    order by distance, provider_row.id
  loop
    exit when remaining_quantity <= 0;

    -- Serialize capacity checks for a provider shared by concurrent requests.
    select * into locked_provider
    from public.service_providers
    where id = provider.id
    for update;

    declared_capacity := case when normalized_resource_type = 'WATER'
      then greatest(coalesce(locked_provider.water_capacity, 0), 0)
      else greatest(coalesce(locked_provider.food_capacity, 0), 0)
    end;
    select coalesce(sum(allocated_quantity) filter (where status <> 'DECLINED'), 0)
      into used_capacity
    from public.resource_request_allocations
    where service_provider_id = provider.id;
    provider_capacity := least(remaining_quantity, greatest(declared_capacity - used_capacity, 0));

    if provider_capacity > 0 then
      insert into public.resource_request_allocations (resource_request_id, service_provider_id, allocated_quantity)
      values (p_request_id, provider.id, provider_capacity);
      remaining_quantity := remaining_quantity - provider_capacity;
    end if;
  end loop;

  update public.resource_requests
  set service_provider_id = (
    select service_provider_id from public.resource_request_allocations
    where resource_request_id = p_request_id and status <> 'DECLINED'
    order by created_at limit 1
  ), updated_at = now()
  where id = p_request_id;

  return remaining_quantity;
end;
$$;

-- Atomically creates a request and assigns the nearest suitable available provider.
-- Uses Haversine distance so it does not require PostGIS.
create or replace function public.create_resource_request_with_nearest_provider(
  p_wari_id uuid,
  p_halt_id uuid default null,
  p_notes text default null,
  p_quantity numeric default 0,
  p_request_latitude double precision default null,
  p_request_longitude double precision default null,
  p_required_date date default null,
  p_required_time time default null,
  p_resource_type text default 'FOOD',
  p_status text default 'PENDING',
  p_unit text default 'units'
)
returns public.resource_requests
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_request public.resource_requests;
  normalized_resource_type text := upper(coalesce(p_resource_type, 'FOOD'));
  remaining_quantity numeric := greatest(coalesce(p_quantity, 0), 0);
  provider_capacity numeric;
begin
  if p_request_latitude is null or p_request_longitude is null
    or p_request_latitude not between -90 and 90
    or p_request_longitude not between -180 and 180 then
    raise exception 'A valid request latitude and longitude are required for provider matching';
  end if;

  insert into public.resource_requests (
    wari_id, halt_id, request_latitude, request_longitude, required_date,
    required_time, service_provider_id, resource_type, quantity, unit,
    status, delivery_status, notes, requested_at, updated_at
  ) values (
    p_wari_id, p_halt_id, p_request_latitude, p_request_longitude, p_required_date,
    p_required_time, null, normalized_resource_type, coalesce(p_quantity, 0),
    coalesce(p_unit, 'units'), coalesce(p_status, 'PENDING'), 'PENDING', p_notes, now(), now()
  ) returning * into created_request;

  remaining_quantity := public.allocate_resource_request_remaining(created_request.id);
  select * into created_request from public.resource_requests where id = created_request.id;

  return created_request;
end;
$$;

-- Marks only the selected allocation declined, then assigns the request remainder atomically.
create or replace function public.decline_resource_request_allocation(
  p_allocation_id uuid,
  p_provider_id uuid
)
returns table (reassigned_quantity numeric, remaining_quantity numeric)
language plpgsql
security invoker
set search_path = public
as $$
declare
  allocation_row public.resource_request_allocations;
  before_remaining numeric;
  after_remaining numeric;
begin
  select * into allocation_row
  from public.resource_request_allocations
  where id = p_allocation_id and service_provider_id = p_provider_id
  for update;

  if not found then
    raise exception 'Allocation not found for this provider';
  end if;
  if allocation_row.status <> 'PENDING' then
    raise exception 'Only pending allocations can be declined';
  end if;

  select greatest(coalesce(r.quantity, 0) - coalesce(sum(a.allocated_quantity) filter (where a.status <> 'DECLINED'), 0), 0)
    into before_remaining
  from public.resource_requests r
  left join public.resource_request_allocations a on a.resource_request_id = r.id
  where r.id = allocation_row.resource_request_id
  group by r.quantity;

  update public.resource_request_allocations
  set status = 'DECLINED', updated_at = now()
  where id = p_allocation_id and service_provider_id = p_provider_id;

  after_remaining := public.allocate_resource_request_remaining(allocation_row.resource_request_id);
  reassigned_quantity := greatest(before_remaining - after_remaining, 0);
  remaining_quantity := after_remaining;
  return next;
end;
$$;

-- Refresh PostgREST's function metadata after applying this migration.
notify pgrst, 'reload schema';

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
alter table public.resource_request_allocations enable row level security;

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

drop policy if exists "temp_dev_resource_request_allocations_select_anon" on public.resource_request_allocations;
create policy "temp_dev_resource_request_allocations_select_anon" on public.resource_request_allocations
  for select to anon using (true);

drop policy if exists "temp_dev_resource_request_allocations_insert_anon" on public.resource_request_allocations;
create policy "temp_dev_resource_request_allocations_insert_anon" on public.resource_request_allocations
  for insert to anon with check (true);

drop policy if exists "temp_dev_resource_request_allocations_update_anon" on public.resource_request_allocations;
create policy "temp_dev_resource_request_allocations_update_anon" on public.resource_request_allocations
  for update to anon using (true) with check (true);

commit;
