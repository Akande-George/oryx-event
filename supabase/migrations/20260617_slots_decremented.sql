-- Track whether an order has already reduced ticket inventory, so the payment
-- webhook and a manual admin "Confirm" can never both decrement the same order.

alter table public.orders
  add column if not exists slots_decremented boolean not null default false;

-- Existing confirmed orders are assumed to have already been counted; mark them
-- so a later confirm/webhook doesn't double-decrement.
update public.orders
set slots_decremented = true
where status = 'confirmed';

notify pgrst, 'reload schema';
