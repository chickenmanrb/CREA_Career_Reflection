-- Asset Management reflection app table (bulkheaded from Acquisitions)
-- Run this in the Supabase SQL editor or via psql.

create extension if not exists "pgcrypto";

create table if not exists public.asset_management (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  agent_id text,
  candidate_name text,
  candidate_email text,
  transcript jsonb not null
);

