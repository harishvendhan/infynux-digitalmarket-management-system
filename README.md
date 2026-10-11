# Digital Marketing Project Management System

Production-grade web application for digital marketing agencies to manage campaigns, deliverables (Reels, Posts, and Videos), and automated weekly rollups without spreadsheets or manual tracking.

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript (`strict: true`), Vite
- **Styling**: Tailwind CSS, Lucide React icons, Inter font
- **Routing**: React Router v6 with `ProtectedRoute`
- **Data Caching**: TanStack Query (React Query v5)
- **Forms & Validation**: `react-hook-form` + `zod`
- **Dates**: `date-fns`
- **Backend & Auth**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Toasts**: `sonner`
- **Unit Testing**: Vitest

---

## 🛠️ Supabase Setup & Migrations

### 1. Create a Supabase Project
1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. In **Project Settings** > **API**, copy your:
   - `Project URL`
   - `anon public` Key

### (Optional) Reset Database to Start Fresh
If you ever want to wipe existing tables, types, and functions to restart from scratch, run:
- `supabase/reset.sql` in your Supabase SQL Editor.

### 2. Apply Database Migrations
Run the SQL scripts in order from `supabase/migrations/` inside the Supabase **SQL Editor**:
1. `20261009000001_enums_and_tables.sql` — Enums, `profiles`, `projects`, `project_weeks`, `tasks`
2. `20261009000002_functions_and_triggers.sql` — Automatic 7-day relative week generator (`generate_project_weeks`), date boundary checks (`before_project_update`), and week assignment trigger (`before_task_write`)
3. `20261009000003_views.sql` — Derived calculation views (`project_stats`, `week_stats`, `dashboard_stats` with `security_invoker = true`)
4. `20261009000004_rls_policies.sql` — Strict tenant isolation policies for all tables

### 3. Create First User
As specified in the system design, there is no public sign-up page by default:
1. Navigate to **Authentication** > **Users** in the Supabase Dashboard.
2. Click **Add User** > **Create User**.
3. Enter your email and password.
4. The database trigger `on_auth_user_created` will automatically create the corresponding row in `public.profiles`.

### 4. (Optional) Run Seed Data
1. Copy the user UUID created in step 3.
2. Open `supabase/seed.sql` and replace `v_owner_id uuid := '...'` with your UUID.
3. Execute `seed.sql` in the Supabase SQL editor to load the **"Emirates Inn Digital Marketing"** demo project and Week 1 tasks.

### 5. Verify Row Level Security
Run `supabase/tests/rls_test.sql` in the SQL Editor. It verifies that User B cannot read or alter User A's projects and tasks.

---

## 💻 Local Development

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ENABLE_SIGNUP=false
```

### 2. Run Locally
```bash
# Start development server
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run build
```

---

## 📐 Business Rules Implemented
- **D1**: Only tasks with status `completed` count toward totals.
- **D2**: Week 1 starts on project start date and spans 7 days. Subsequent weeks continue in 7-day blocks. The final week ends on the project end date.
- **D3**: Tasks are auto-assigned to weeks based on `task_date`.
- **D4**: Date changes re-sync weeks; prevented if any tasks would be orphaned outside dates.
- **D5**: Progress formula: `(total completed / total planned) * 100`. Returns `"N/A"` when planned is 0. Shows `Over target (+N)` badge when exceeded.
- **D6**: Projects flagged with Needs Attention if within 14 days and <70% progress, or overdue.
- **D7**: Duration calculated as `"N days (M weeks)"`.
- **D10**: Validated `http(s)` URLs; platform icons for Instagram, YouTube, Facebook, LinkedIn, TikTok. Required when marking tasks Completed.
- **D11**: Project cascading deletion requires typing project title to confirm.
- **D12**: Single owner per project enforced via RLS.
