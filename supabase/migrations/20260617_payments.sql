-- Payment columns for MyFatoorah integration.
--
-- The webhook (POST /api/payments/webhook) is the authoritative source of truth
-- for payment_status — never trust the client-side return URL alone. Slot
-- decrement now happens on the first paid transition, not at order insert.

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_status'
  ) then
    create type public.payment_status as enum (
      'unpaid', 'paid', 'failed', 'expired', 'refunded'
    );
  end if;
end $$;

alter table public.orders
  add column if not exists payment_invoice_id text,
  add column if not exists payment_status public.payment_status not null default 'unpaid',
  add column if not exists payment_method text;

alter table public.hotel_bookings
  add column if not exists payment_invoice_id text,
  add column if not exists payment_status public.payment_status not null default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists payment_reference text;

create index if not exists orders_payment_invoice_idx
  on public.orders(payment_invoice_id);
create index if not exists hotel_bookings_payment_invoice_idx
  on public.hotel_bookings(payment_invoice_id);

-- Webhook handler runs with the service role and is the only writer that flips
-- payment_status to 'paid' and decrements slots. The decrement_slots RPC stays
-- the same; we just move the call site.

notify pgrst, 'reload schema';
