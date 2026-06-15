-- Categories table. Used by the admin Categories section and the event-create
-- dropdown. `name` is the value stored on events.category, so it must be unique.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🎉',
  created_at timestamptz not null default now()
);

create index if not exists categories_name_idx on public.categories(name);

alter table public.categories enable row level security;

drop policy if exists "categories public read" on public.categories;
create policy "categories public read"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Refresh PostgREST's schema cache so the new table is visible immediately.
notify pgrst, 'reload schema';
