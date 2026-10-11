-- Migration 03: Views (Stats are always derived)
-- Description: Creates project_stats, week_stats, and dashboard_stats with security_invoker = true.

-- 1. project_stats view
create or replace view public.project_stats
with (security_invoker = true) as
select
  p.id as project_id,
  count(t.id) filter (where t.content_type = 'reel' and t.status = 'completed')::integer as completed_reels,
  p.planned_reels,
  count(t.id) filter (where t.content_type = 'post' and t.status = 'completed')::integer as completed_posts,
  p.planned_posts,
  count(t.id) filter (where t.content_type = 'video' and t.status = 'completed')::integer as completed_videos,
  p.planned_videos,
  (p.planned_reels + p.planned_posts + p.planned_videos)::integer as total_planned,
  count(t.id) filter (where t.status = 'completed')::integer as total_completed,
  greatest(
    (p.planned_reels + p.planned_posts + p.planned_videos) - count(t.id) filter (where t.status = 'completed'),
    0
  )::integer as total_remaining,
  case
    when (p.planned_reels + p.planned_posts + p.planned_videos) = 0 then null
    else round(
      (count(t.id) filter (where t.status = 'completed')::numeric /
      (p.planned_reels + p.planned_posts + p.planned_videos)::numeric) * 100,
      1
    )
  end as progress_pct,
  count(t.id) filter (where t.status = 'in_progress')::integer as in_progress_tasks,
  count(t.id) filter (where t.status = 'planned')::integer as planned_tasks
from public.projects p
left join public.tasks t on t.project_id = p.id
group by p.id, p.planned_reels, p.planned_posts, p.planned_videos;

-- 2. week_stats view
create or replace view public.week_stats
with (security_invoker = true) as
select
  pw.id as week_id,
  pw.project_id,
  pw.week_number,
  count(t.id) filter (where t.content_type = 'reel' and t.status = 'completed')::integer as completed_reels,
  count(t.id) filter (where t.content_type = 'post' and t.status = 'completed')::integer as completed_posts,
  count(t.id) filter (where t.content_type = 'video' and t.status = 'completed')::integer as completed_videos,
  count(t.id)::integer as total_tasks,
  count(t.id) filter (where t.status = 'in_progress')::integer as in_progress_tasks
from public.project_weeks pw
left join public.tasks t on t.week_id = pw.id
group by pw.id, pw.project_id, pw.week_number;

-- 3. dashboard_stats view
-- D9: Active = in_progress, Completed = completed. Not Started & On Hold count only in Total.
create or replace view public.dashboard_stats
with (security_invoker = true) as
select
  p.owner_id,
  count(distinct p.id)::integer as total_projects,
  count(distinct p.id) filter (where p.status = 'in_progress')::integer as active_projects,
  count(distinct p.id) filter (where p.status = 'completed')::integer as completed_projects,
  coalesce(count(t.id) filter (where t.content_type = 'reel' and t.status = 'completed'), 0)::integer as total_reels_completed,
  coalesce(count(t.id) filter (where t.content_type = 'post' and t.status = 'completed'), 0)::integer as total_posts_completed,
  coalesce(count(t.id) filter (where t.content_type = 'video' and t.status = 'completed'), 0)::integer as total_videos_completed
from public.projects p
left join public.tasks t on t.project_id = p.id
group by p.owner_id;
