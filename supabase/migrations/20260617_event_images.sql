-- Gallery images for events (in addition to the single image_url hero).
-- Mirrors hotels.images so the same collage component can render both.

alter table public.events
  add column if not exists images text[] not null default '{}';

notify pgrst, 'reload schema';
