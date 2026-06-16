-- Re-assert INSERT policies on orders and hotel_bookings. The init migration
-- created these, but if they were dropped (or never applied in some order)
-- the checkout/booking flow fails with "new row violates row-level security
-- policy". Safe to re-run.

drop policy if exists "orders insert all" on public.orders;
create policy "orders insert all"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "hotel bookings insert all" on public.hotel_bookings;
create policy "hotel bookings insert all"
on public.hotel_bookings for insert
to anon, authenticated
with check (true);

notify pgrst, 'reload schema';
