-- Segment reflection sessions by exercise (e.g., acquisitions vs asset_management)
-- Run this in the Supabase SQL editor or via psql.

alter table public.reflection_sessions
  add column if not exists exercise text;

update public.reflection_sessions
  set exercise = 'acquisitions'
  where exercise is null;

alter table public.reflection_sessions
  alter column exercise set default 'acquisitions';

alter table public.reflection_sessions
  alter column exercise set not null;

create index if not exists idx_reflection_sessions_exercise on public.reflection_sessions(exercise);

