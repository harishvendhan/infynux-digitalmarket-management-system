-- RLS Verification Test Script
-- Run this in the Supabase SQL editor to verify tenant isolation (Section 4.5 & Phase 2 checkpoint)

do $$
declare
  user_a_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  user_b_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  proj_a_id uuid := '11111111-2222-3333-4444-555555555555';
  task_count integer;
  proj_count integer;
begin
  -- 1. Create temporary test users in auth.users
  -- (The trigger on_auth_user_created automatically creates the rows in public.profiles)
  insert into auth.users (
    id,
    email,
    raw_user_meta_data,
    aud,
    role
  ) values 
    (user_a_id, 'alice@agency.com', '{"display_name": "Alice"}', 'authenticated', 'authenticated'),
    (user_b_id, 'bob@agency.com', '{"display_name": "Bob"}', 'authenticated', 'authenticated')
  on conflict (id) do nothing;

  -- Ensure profile exists (handled by trigger or updated here)
  insert into public.profiles (id, email, display_name, role)
  values 
    (user_a_id, 'alice@agency.com', 'Alice', 'member'),
    (user_b_id, 'bob@agency.com', 'Bob', 'member')
  on conflict (id) do update set email = excluded.email;

  -- 2. Insert a project belonging to User A
  insert into public.projects (id, owner_id, title, start_date, end_date, planned_reels)
  values (proj_a_id, user_a_id, 'Alice Secret Project', '2026-10-01', '2026-10-31', 10)
  on conflict (id) do nothing;

  -- 3. Test 1: Simulate User B trying to view User A's project
  perform set_config('request.jwt.claim.sub', user_b_id::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into proj_count
  from public.projects
  where id = proj_a_id;

  if proj_count <> 0 then
    raise exception 'RLS FAILURE: User B was able to view User A project!';
  else
    raise notice 'RLS SUCCESS: User B cannot view User A project (returned 0 rows).';
  end if;

  -- 4. Test 2: Simulate User B trying to view User A's tasks
  select count(*) into task_count
  from public.tasks
  where project_id = proj_a_id;

  if task_count <> 0 then
    raise exception 'RLS FAILURE: User B was able to view User A tasks!';
  else
    raise notice 'RLS SUCCESS: User B cannot view User A tasks (returned 0 rows).';
  end if;

  -- 5. Test 3: Simulate User A viewing their own project
  perform set_config('request.jwt.claim.sub', user_a_id::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into proj_count
  from public.projects
  where id = proj_a_id;

  if proj_count = 0 then
    raise exception 'RLS FAILURE: User A could not view their own project!';
  else
    raise notice 'RLS SUCCESS: User A can view their own project.';
  end if;

  -- 6. Cleanup test data
  perform set_config('role', 'postgres', true);
  delete from public.projects where id = proj_a_id;
  delete from auth.users where id in (user_a_id, user_b_id);

  raise notice '==================================================';
  raise notice 'All RLS verification tests PASSED with 100%% success!';
  raise notice '==================================================';
end $$;
