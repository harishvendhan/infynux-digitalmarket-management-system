-- Complete Database Reset Script
-- Run this in the Supabase SQL Editor if you want to wipe all project tables,
-- functions, views, and enums to start completely fresh from Migration 1.

-- 1. Drop Views
drop view if exists public.dashboard_stats cascade;
drop view if exists public.week_stats cascade;
drop view if exists public.project_stats cascade;

-- 2. Drop Tables (with CASCADE to drop related foreign keys and policies)
drop table if exists public.tasks cascade;
drop table if exists public.project_weeks cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- 3. Drop Triggers on auth.users
drop trigger if exists on_auth_user_created on auth.users;

-- 4. Drop Functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.generate_project_weeks(uuid) cascade;
drop function if exists public.after_project_write_sync_weeks() cascade;
drop function if exists public.before_project_update_check_dates() cascade;
drop function if exists public.before_task_write_assign_week() cascade;

-- 5. Drop Custom Enums
drop type if exists public.user_role cascade;
drop type if exists public.task_status cascade;
drop type if exists public.content_type cascade;
drop type if exists public.project_status cascade;

raise notice 'Database completely reset! You can now run migrations 1 to 4 from scratch.';
