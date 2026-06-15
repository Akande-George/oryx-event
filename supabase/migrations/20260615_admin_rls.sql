-- Admin write policies. Required so the admin dashboard can insert/update/delete
-- on tables that previously only had SELECT policies. An authenticated user is
-- treated as admin iff their profiles row has role = 'admin'.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ── events ────────────────────────────────────────────────────────────────
drop policy if exists "events admin write" on public.events;
create policy "events admin write"
on public.events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ── ticket_packages ───────────────────────────────────────────────────────
drop policy if exists "packages admin write" on public.ticket_packages;
create policy "packages admin write"
on public.ticket_packages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ── hotels ────────────────────────────────────────────────────────────────
drop policy if exists "hotels admin write" on public.hotels;
create policy "hotels admin write"
on public.hotels for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ── room_types ────────────────────────────────────────────────────────────
drop policy if exists "room types admin write" on public.room_types;
create policy "room types admin write"
on public.room_types for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ── orders (status updates / deletes by admin) ────────────────────────────
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete"
on public.orders for delete
to authenticated
using (public.is_admin());

-- ── hotel_bookings (status updates / deletes by admin) ────────────────────
drop policy if exists "hotel bookings admin update" on public.hotel_bookings;
create policy "hotel bookings admin update"
on public.hotel_bookings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "hotel bookings admin delete" on public.hotel_bookings;
create policy "hotel bookings admin delete"
on public.hotel_bookings for delete
to authenticated
using (public.is_admin());

-- ── categories ────────────────────────────────────────────────────────────
-- The categories table is created outside the init migration. Only apply
-- policies if the table exists.
do $$
begin
  if to_regclass('public.categories') is not null then
    execute 'alter table public.categories enable row level security';

    execute 'drop policy if exists "categories public read" on public.categories';
    execute $p$
      create policy "categories public read"
      on public.categories for select
      to anon, authenticated
      using (true)
    $p$;

    execute 'drop policy if exists "categories admin write" on public.categories';
    execute $p$
      create policy "categories admin write"
      on public.categories for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $p$;
  end if;
end $$;
