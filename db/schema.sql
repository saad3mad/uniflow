-- Moodle Integration Schema for Supabase
-- Run this file in your Supabase SQL editor (or via migrations) before running the app

-- Enable required extensions (idempotent)
create extension if not exists pgcrypto;

-- Connections table to store encrypted tokens per user per Moodle base URL
create table if not exists public.moodle_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  moodle_base_url text not null,
  moodle_user_id bigint,
  token_encrypted text not null,
  private_token_encrypted text,
  status text not null default 'active', -- 'active' | 'invalid'
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, moodle_base_url)
);

create index if not exists idx_moodle_connections_user on public.moodle_connections(user_id);
create index if not exists idx_moodle_connections_status on public.moodle_connections(status);

-- Courses imported from Moodle
create table if not exists public.moodle_courses (
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.moodle_connections(id) on delete cascade,
  course_id bigint not null, -- Moodle course id
  fullname text not null,
  shortname text,
  summary text,
  visible boolean,
  progress numeric,
  startdate timestamptz,
  enddate timestamptz,
  categoryid bigint,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index if not exists idx_moodle_courses_user on public.moodle_courses(user_id);
create index if not exists idx_moodle_courses_connection on public.moodle_courses(connection_id);

-- Assignments imported from Moodle
create table if not exists public.moodle_assignments (
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.moodle_connections(id) on delete cascade,
  assignment_id bigint not null, -- Moodle assignment id
  course_id bigint not null,
  name text not null,
  duedate timestamptz,
  allowsubmissionsfromdate timestamptz,
  cutoffdate timestamptz,
  grade numeric,
  status text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, assignment_id)
);

create index if not exists idx_moodle_assignments_user on public.moodle_assignments(user_id);
create index if not exists idx_moodle_assignments_course on public.moodle_assignments(course_id);

-- Course materials/contents imported from Moodle
create table if not exists public.moodle_course_contents (
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.moodle_connections(id) on delete cascade,
  course_id bigint not null,
  section_id bigint,
  section_name text,
  module_id bigint,
  module_name text,
  modname text,
  url text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, module_id)
);

create index if not exists idx_moodle_course_contents_user on public.moodle_course_contents(user_id);
create index if not exists idx_moodle_course_contents_course on public.moodle_course_contents(course_id);

-- Updated at triggers
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_moodle_connections_updated
  before update on public.moodle_connections
  for each row execute function public.set_updated_at();

create trigger trg_moodle_courses_updated
  before update on public.moodle_courses
  for each row execute function public.set_updated_at();

create trigger trg_moodle_assignments_updated
  before update on public.moodle_assignments
  for each row execute function public.set_updated_at();

create trigger trg_moodle_course_contents_updated
  before update on public.moodle_course_contents
  for each row execute function public.set_updated_at();

-- RLS
alter table public.moodle_connections enable row level security;
alter table public.moodle_courses enable row level security;
alter table public.moodle_assignments enable row level security;
alter table public.moodle_course_contents enable row level security;

-- Policies: users can manage only their rows
create policy if not exists "moodle_connections_select"
  on public.moodle_connections for select
  using (auth.uid() = user_id);

create policy if not exists "moodle_connections_insert"
  on public.moodle_connections for insert
  with check (auth.uid() = user_id);

create policy if not exists "moodle_connections_update"
  on public.moodle_connections for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "moodle_connections_delete"
  on public.moodle_connections for delete
  using (auth.uid() = user_id);

create policy if not exists "moodle_courses_rw"
  on public.moodle_courses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "moodle_assignments_rw"
  on public.moodle_assignments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "moodle_course_contents_rw"
  on public.moodle_course_contents for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
