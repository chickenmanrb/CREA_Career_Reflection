-- Reflection app tables (separate from voice interview tables)
-- Run this in the Supabase SQL editor or via psql.

create extension if not exists "pgcrypto";

create table if not exists public.reflection_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  agent_id text,
  candidate_name text,
  candidate_email text,
  transcript jsonb not null
);

create table if not exists public.reflection_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references public.reflection_sessions(id) on delete cascade,
  rubric_version text,
  scores jsonb not null,
  total numeric,
  model_used text,
  reasoning text
);

create index if not exists idx_reflection_scores_session_id on public.reflection_scores(session_id);
