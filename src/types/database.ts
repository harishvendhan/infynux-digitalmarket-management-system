export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed';
export type ContentType = 'reel' | 'post' | 'video';
export type TaskStatus = 'planned' | 'in_progress' | 'completed';
export type UserRole = 'admin' | 'member';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  planned_reels: number;
  planned_posts: number;
  planned_videos: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectWeek {
  id: string;
  project_id: string;
  week_number: number;
  start_date: string;
  end_date: string;
}

export interface Task {
  id: string;
  project_id: string;
  week_id: string;
  title: string;
  content_type: ContentType;
  task_date: string;
  content_url: string | null;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStatsView {
  project_id: string;
  completed_reels: number;
  planned_reels: number;
  completed_posts: number;
  planned_posts: number;
  completed_videos: number;
  planned_videos: number;
  total_planned: number;
  total_completed: number;
  total_remaining: number;
  progress_pct: number | null;
  in_progress_tasks: number;
  planned_tasks: number;
}

export interface WeekStatsView {
  week_id: string;
  project_id: string;
  week_number: number;
  completed_reels: number;
  completed_posts: number;
  completed_videos: number;
  total_tasks: number;
  in_progress_tasks: number;
}

export interface DashboardStatsView {
  owner_id: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_reels_completed: number;
  total_posts_completed: number;
  total_videos_completed: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      project_weeks: {
        Row: ProjectWeek;
        Insert: Omit<ProjectWeek, 'id'> & { id?: string };
        Update: Partial<Omit<ProjectWeek, 'id'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      project_stats: {
        Row: ProjectStatsView;
      };
      week_stats: {
        Row: WeekStatsView;
      };
      dashboard_stats: {
        Row: DashboardStatsView;
      };
    };
  };
}
