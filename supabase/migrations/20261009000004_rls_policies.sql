-- Migration 04: Row Level Security (Mandatory)
-- Description: Enables RLS on all tables with strict tenant isolation.

-- 1. Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_weeks enable row level security;
alter table public.tasks enable row level security;

-- 2. Profiles Policies
-- Users can only read and update their own profile row
create policy "Users can view own profile"
  on public.profiles
  for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 3. Projects Policies
-- All operations allowed only where owner_id = auth.uid()
create policy "Users can view own projects"
  on public.projects
  for select
  using (owner_id = auth.uid());

create policy "Users can insert own projects"
  on public.projects
  for insert
  with check (owner_id = auth.uid());

create policy "Users can update own projects"
  on public.projects
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can delete own projects"
  on public.projects
  for delete
  using (owner_id = auth.uid());

-- 4. Project Weeks Policies
-- Allowed only if parent project belongs to auth.uid()
create policy "Users can view own project weeks"
  on public.project_weeks
  for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_weeks.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Users can manage own project weeks"
  on public.project_weeks
  for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_weeks.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_weeks.project_id
        and p.owner_id = auth.uid()
    )
  );

-- 5. Tasks Policies
-- Allowed only if parent project belongs to auth.uid()
create policy "Users can view own project tasks"
  on public.tasks
  for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Users can insert own project tasks"
  on public.tasks
  for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Users can update own project tasks"
  on public.tasks
  for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Users can delete own project tasks"
  on public.tasks
  for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and p.owner_id = auth.uid()
    )
  );
