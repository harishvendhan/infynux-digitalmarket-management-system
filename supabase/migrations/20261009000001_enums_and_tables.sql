-- Migration 01: Enums and Tables
-- Description: Creates core enums, profiles, projects, project_weeks, and tasks tables.

-- 1. Create Enums (Section 4.1)
create type project_status as enum ('not_started', 'in_progress', 'on_hold', 'completed');
create type content_type as enum ('reel', 'post', 'video');
create type task_status as enum ('planned', 'in_progress', 'completed');
create type user_role as enum ('admin', 'member');

-- 2. Profiles Table
-- Linked to auth.users with trigger on auth.users insert
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Trigger to create profile when auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'member'
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Projects Table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 2 and char_length(title) <= 120),
  description text,
  start_date date not null,
  end_date date not null,
  planned_reels integer not null default 0 check (planned_reels >= 0),
  planned_posts integer not null default 0 check (planned_posts >= 0),
  planned_videos integer not null default 0 check (planned_videos >= 0),
  status project_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_project_dates check (end_date >= start_date)
);

create index idx_projects_owner on public.projects(owner_id);
create index idx_projects_status on public.projects(status);

-- 4. Project Weeks Table
create table public.project_weeks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  week_number integer not null,
  start_date date not null,
  end_date date not null,
  constraint unique_project_week unique (project_id, week_number),
  constraint check_week_dates check (end_date >= start_date)
);

create index idx_project_weeks_project_id on public.project_weeks(project_id);

-- 5. Tasks Table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  week_id uuid references public.project_weeks(id) on delete set null,
  title text not null,
  content_type content_type not null,
  task_date date not null,
  content_url text,
  status task_status not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- D10 Constraints: valid http(s) URL and required if completed
  constraint check_content_url_format check (
    content_url is null or content_url ~* '^https?://'
  ),
  constraint check_completed_requires_link check (
    status <> 'completed' or (content_url is not null and char_length(trim(content_url)) > 0)
  )
);

-- Task Indexes as specified in Section 4.2
create index idx_tasks_project_id on public.tasks(project_id);
create index idx_tasks_week_id on public.tasks(week_id);
create index idx_tasks_project_content on public.tasks(project_id, content_type);
create index idx_tasks_project_status on public.tasks(project_id, status);
create index idx_tasks_task_date on public.tasks(task_date);
