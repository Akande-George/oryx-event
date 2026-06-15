create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_category') then
    create type public.event_category as enum (
      'Music', 'Sports', 'Arts', 'Food & Drink', 'Business', 'Technology', 'Comedy', 'Fashion', 'Other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_tier') then
    create type public.ticket_tier as enum ('Regular', 'VIP', 'Table');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'confirmed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  location text not null,
  venue text not null,
  date timestamptz not null,
  end_date timestamptz,
  category public.event_category not null,
  image_url text not null,
  organizer text not null,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ticket_packages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  tier public.ticket_tier not null,
  price numeric(12,2) not null check (price >= 0),
  perks text[] not null default '{}',
  total_slots integer not null check (total_slots >= 0),
  available_slots integer not null check (available_slots >= 0 and available_slots <= total_slots),
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  package_id uuid not null references public.ticket_packages(id) on delete restrict,
  event_id uuid not null references public.events(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  status public.order_status not null default 'pending',
  guest_name text,
  guest_email text,
  guest_phone text,
  payment_reference text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  location text not null,
  city text not null,
  address text not null,
  image_url text not null,
  images text[] not null default '{}',
  star_rating integer not null check (star_rating between 1 and 5),
  amenities text[] not null default '{}',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  name text not null,
  description text,
  price_per_night numeric(12,2) not null check (price_per_night >= 0),
  capacity integer not null check (capacity > 0),
  beds text not null,
  amenities text[] not null default '{}',
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hotel_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  hotel_id uuid not null references public.hotels(id) on delete restrict,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  check_in date not null,
  check_out date not null,
  nights integer not null check (nights > 0),
  rooms integer not null check (rooms > 0),
  guests integer not null check (guests > 0),
  special_requests text,
  estimated_total numeric(12,2) not null check (estimated_total >= 0),
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  constraint hotel_bookings_date_order check (check_out > check_in)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.decrement_slots(p_package_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_slots integer;
begin
  select available_slots
  into current_slots
  from public.ticket_packages
  where id = p_package_id
  for update;

  if current_slots is null then
    raise exception 'Ticket package not found';
  end if;

  if current_slots < p_quantity then
    raise exception 'Not enough slots available';
  end if;

  update public.ticket_packages
  set available_slots = available_slots - p_quantity,
      is_available = (available_slots - p_quantity) > 0
  where id = p_package_id;
end;
$$;

create or replace function public.promote_user_by_email(target_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set role = 'admin', updated_at = timezone('utc', now())
  where lower(email) = lower(target_email);
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists on_events_updated on public.events;
create trigger on_events_updated
before update on public.events
for each row execute procedure public.set_updated_at();

drop trigger if exists on_hotels_updated on public.hotels;
create trigger on_hotels_updated
before update on public.hotels
for each row execute procedure public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create index if not exists events_date_idx on public.events(date);
create index if not exists events_category_idx on public.events(category);
create index if not exists ticket_packages_event_id_idx on public.ticket_packages(event_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_event_id_idx on public.orders(event_id);
create index if not exists hotels_city_idx on public.hotels(city);
create index if not exists room_types_hotel_id_idx on public.room_types(hotel_id);
create index if not exists hotel_bookings_hotel_id_idx on public.hotel_bookings(hotel_id);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.ticket_packages enable row level security;
alter table public.orders enable row level security;
alter table public.hotels enable row level security;
alter table public.room_types enable row level security;
alter table public.hotel_bookings enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "events public read" on public.events;
create policy "events public read"
on public.events for select
to anon, authenticated
using (is_published = true or exists (
  select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
));

drop policy if exists "packages public read" on public.ticket_packages;
create policy "packages public read"
on public.ticket_packages for select
to anon, authenticated
using (
  exists (
    select 1 from public.events
    where events.id = ticket_packages.event_id
      and (events.is_published = true or exists (
        select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
      ))
  )
);

drop policy if exists "hotels public read" on public.hotels;
create policy "hotels public read"
on public.hotels for select
to anon, authenticated
using (is_published = true or exists (
  select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
));

drop policy if exists "room types public read" on public.room_types;
create policy "room types public read"
on public.room_types for select
to anon, authenticated
using (
  exists (
    select 1 from public.hotels
    where hotels.id = room_types.hotel_id
      and (hotels.is_published = true or exists (
        select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
      ))
  )
);

drop policy if exists "orders insert all" on public.orders;
create policy "orders insert all"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "orders read own or admin" on public.orders;
create policy "orders read own or admin"
on public.orders for select
to authenticated
using (
  user_id = auth.uid() or exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

drop policy if exists "hotel bookings insert all" on public.hotel_bookings;
create policy "hotel bookings insert all"
on public.hotel_bookings for insert
to anon, authenticated
with check (true);

drop policy if exists "hotel bookings read own or admin" on public.hotel_bookings;
create policy "hotel bookings read own or admin"
on public.hotel_bookings for select
to authenticated
using (
  user_id = auth.uid() or exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);