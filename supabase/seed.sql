-- Supabase Seed Data (Demo Project & Week 1 Tasks)
-- Section 10: "Emirates Inn Digital Marketing"
-- Automatically associates with the first user in auth.users, or creates a demo user if none exists.

do $$
declare
  v_owner_id uuid;
  v_project_id uuid := '11111111-1111-1111-1111-111111111111';
  v_week_1_id uuid;
begin
  -- 1. Find the first existing user in auth.users
  select id into v_owner_id
  from auth.users
  order by created_at asc
  limit 1;

  -- If no user exists yet in auth.users, create a demo agency user
  if v_owner_id is null then
    v_owner_id := '00000000-0000-0000-0000-000000000001';
    insert into auth.users (
      id,
      email,
      raw_user_meta_data,
      aud,
      role
    ) values (
      v_owner_id,
      'demo@agency.com',
      '{"display_name": "Demo Agency"}',
      'authenticated',
      'authenticated'
    ) on conflict (id) do nothing;
  end if;

  -- 2. Ensure user profile exists
  insert into public.profiles (id, email, display_name, role)
  values (v_owner_id, 'demo@agency.com', 'Demo Agency Lead', 'admin')
  on conflict (id) do nothing;

  -- 3. Insert demo project
  -- Note: The trigger `trigger_projects_after_write` automatically generates all 14 project weeks!
  insert into public.projects (
    id,
    owner_id,
    title,
    description,
    start_date,
    end_date,
    planned_reels,
    planned_posts,
    planned_videos,
    status
  ) values (
    v_project_id,
    v_owner_id,
    'Emirates Inn Digital Marketing',
    'Q4 promotional campaign, hotel room tours, dining offers, and testimonial reels.',
    '2026-10-01',
    '2026-12-31',
    20,
    15,
    10,
    'in_progress'
  ) on conflict (id) do update
  set title = excluded.title,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      planned_reels = excluded.planned_reels,
      planned_posts = excluded.planned_posts,
      planned_videos = excluded.planned_videos;

  -- Fetch Week 1 ID
  select id into v_week_1_id
  from public.project_weeks
  where project_id = v_project_id and week_number = 1;

  -- 4. Insert Week 1 Tasks (all Completed with published links)
  -- Oct 2: Hotel promotional content (Reel)
  insert into public.tasks (
    project_id,
    week_id,
    title,
    content_type,
    task_date,
    content_url,
    status,
    notes
  ) values (
    v_project_id,
    v_week_1_id,
    'Hotel promotional content',
    'reel',
    '2026-10-02',
    'https://www.instagram.com/reel/DA2x9qK',
    'completed',
    'Showcasing executive suite interior'
  );

  -- Oct 3: Weekend offer design (Post)
  insert into public.tasks (
    project_id,
    week_id,
    title,
    content_type,
    task_date,
    content_url,
    status,
    notes
  ) values (
    v_project_id,
    v_week_1_id,
    'Weekend offer design',
    'post',
    '2026-10-03',
    'https://www.instagram.com/p/DA4w1Lz',
    'completed',
    '20% off weekend dining buffet graphic'
  );

  -- Oct 5: Room tour content (Video)
  insert into public.tasks (
    project_id,
    week_id,
    title,
    content_type,
    task_date,
    content_url,
    status,
    notes
  ) values (
    v_project_id,
    v_week_1_id,
    'Room tour content',
    'video',
    '2026-10-05',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'completed',
    '4K video tour of Presidential Penthouse'
  );

  -- Oct 6: Customer testimonial (Reel)
  insert into public.tasks (
    project_id,
    week_id,
    title,
    content_type,
    task_date,
    content_url,
    status,
    notes
  ) values (
    v_project_id,
    v_week_1_id,
    'Customer testimonial',
    'reel',
    '2026-10-06',
    'https://www.instagram.com/reel/DA8y5Mp',
    'completed',
    'Interview with visiting business executive'
  );

  -- Oct 7: Restaurant promotional design (Post)
  insert into public.tasks (
    project_id,
    week_id,
    title,
    content_type,
    task_date,
    content_url,
    status,
    notes
  ) values (
    v_project_id,
    v_week_1_id,
    'Restaurant promotional design',
    'post',
    '2026-10-07',
    'https://www.instagram.com/p/DA-m3Nt',
    'completed',
    'Rooftop restaurant dinner menu launch'
  );

  raise notice 'Seed data inserted successfully for user %!', v_owner_id;
end $$;
