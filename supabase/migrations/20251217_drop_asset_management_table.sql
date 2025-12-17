-- Remove unused dedicated Asset Management table (using reflection_sessions.exercise instead)
-- Run this in the Supabase SQL editor or via psql.

drop table if exists public.asset_management;

