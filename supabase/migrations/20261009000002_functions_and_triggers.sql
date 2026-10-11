-- Migration 02: Functions and Triggers
-- Description: Auto week generation (D2, D4), task-date validation, week assignment (D3), and guard triggers.

-- 1. Generic set_updated_at function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger trigger_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- 2. generate_project_weeks(p_project_id uuid)
-- Generates or re-syncs weekly schedule per D2 and D4 without temporary tables
create or replace function public.generate_project_weeks(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start date;
  v_end date;
  v_total_weeks integer;
begin
  -- Fetch project start and end dates
  select start_date, end_date into v_start, v_end
  from public.projects
  where id = p_project_id;

  if not found or v_start is null or v_end is null or v_start > v_end then
    return;
  end if;

  v_total_weeks := ceil((v_end - v_start + 1)::numeric / 7.0)::integer;

  -- Remove old weeks that have zero tasks and are beyond the new week count (D4)
  delete from public.project_weeks pw
  where pw.project_id = p_project_id
    and pw.week_number > v_total_weeks
    and not exists (
      select 1 from public.tasks t where t.week_id = pw.id
    );

  -- Upsert expected 7-day relative weeks (D2)
  insert into public.project_weeks (project_id, week_number, start_date, end_date)
  select
    p_project_id,
    (n + 1)::integer as week_number,
    (v_start + (n * 7))::date as start_date,
    least(v_start + (n * 7) + 6, v_end)::date as end_date
  from generate_series(0, v_total_weeks - 1) as n
  on conflict (project_id, week_number) do update
  set start_date = excluded.start_date,
      end_date = excluded.end_date;

  -- Re-assign week_id for all tasks of this project to match the corrected dates
  update public.tasks t
  set week_id = pw.id
  from public.project_weeks pw
  where pw.project_id = p_project_id
    and t.project_id = p_project_id
    and t.task_date >= pw.start_date
    and t.task_date <= pw.end_date
    and (t.week_id is distinct from pw.id);

end;
$$;

-- Trigger: After project insert or update of dates, regenerate weeks
create or replace function public.after_project_write_sync_weeks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') or (old.start_date <> new.start_date) or (old.end_date <> new.end_date) then
    perform public.generate_project_weeks(new.id);
  end if;
  return new;
end;
$$;

create trigger trigger_projects_after_write
  after insert or update on public.projects
  for each row execute function public.after_project_write_sync_weeks();

-- 3. before_project_update trigger (D4)
-- Blocks date edits if any existing task would fall outside the new project date range
create or replace function public.before_project_update_check_dates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outside_count integer;
begin
  if (old.start_date <> new.start_date) or (old.end_date <> new.end_date) then
    select count(*) into v_outside_count
    from public.tasks
    where project_id = new.id
      and (task_date < new.start_date or task_date > new.end_date);

    if v_outside_count > 0 then
      raise exception '% tasks fall outside the new dates. Move or delete them first.', v_outside_count;
    end if;
  end if;

  return new;
end;
$$;

create trigger trigger_projects_before_update_dates
  before update on public.projects
  for each row execute function public.before_project_update_check_dates();

-- 4. before_task_write trigger (D3)
-- Validates task_date is inside project range and sets week_id automatically
create or replace function public.before_task_write_assign_week()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proj_start date;
  v_proj_end date;
  v_matched_week_id uuid;
begin
  -- Fetch project start and end dates
  select start_date, end_date into v_proj_start, v_proj_end
  from public.projects
  where id = new.project_id;

  if not found then
    raise exception 'Project % does not exist', new.project_id;
  end if;

  -- Validate task_date is inside project range
  if new.task_date < v_proj_start or new.task_date > v_proj_end then
    raise exception 'Task date (%) must fall inside project dates (% to %)',
      new.task_date, v_proj_start, v_proj_end;
  end if;

  -- Find matching week_id from project_weeks
  select id into v_matched_week_id
  from public.project_weeks
  where project_id = new.project_id
    and new.task_date >= start_date
    and new.task_date <= end_date
  order by week_number asc
  limit 1;

  if v_matched_week_id is not null then
    new.week_id := v_matched_week_id;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trigger_tasks_before_write
  before insert or update on public.tasks
  for each row execute function public.before_task_write_assign_week();
