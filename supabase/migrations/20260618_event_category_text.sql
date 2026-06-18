-- events.category was a fixed enum (event_category), but categories are now
-- admin-managed in the public.categories table, so the column must accept any
-- category name. Convert it to free text.

alter table public.events
  alter column category type text using category::text;

-- The old enum type is no longer used by this column. Leave it in place (it's
-- harmless) in case other environments still reference it. The category index
-- continues to work on the text column.

notify pgrst, 'reload schema';
