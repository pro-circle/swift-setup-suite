-- Support Ticket Tracker schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists public.tickets (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(trim(title)) > 0),
  description text not null check (char_length(trim(description)) > 0),
  priority    text not null check (priority in ('Low', 'Medium', 'High')),
  status      text not null default 'Open' check (status in ('Open', 'In Progress', 'Resolved')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_created_at_idx on public.tickets (created_at desc);

-- Keep updated_at accurate on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tickets_set_updated_at on public.tickets;

create trigger tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

-- The FastAPI backend connects directly with the Postgres role, so the Supabase
-- Data API is never used and no anon/authenticated grants are needed.
alter table public.tickets enable row level security;
