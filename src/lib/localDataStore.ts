import type { Project, Task, ProjectStatsView } from '../types';

export const DEMO_PROJECT_ID = '11111111-1111-1111-1111-111111111111';

export const initialDemoProject: Project = {
  id: DEMO_PROJECT_ID,
  owner_id: '00000000-0000-0000-0000-000000000000',
  title: 'Emirates Inn Digital Marketing',
  description: 'Q4 promotional campaign, hotel room tours, dining offers, and testimonial reels.',
  start_date: '2026-10-01',
  end_date: '2026-12-31',
  planned_reels: 20,
  planned_posts: 15,
  planned_videos: 10,
  status: 'in_progress',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

export const initialDemoTasks: Task[] = [
  {
    id: 'task-1',
    project_id: DEMO_PROJECT_ID,
    week_id: 'week-1',
    title: 'Hotel promotional content',
    content_type: 'reel',
    task_date: '2026-10-02',
    content_url: 'https://www.instagram.com/reel/DA2x9qK',
    status: 'completed',
    notes: 'Showcasing executive suite interior',
    created_at: '2026-10-02T10:00:00Z',
    updated_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 'task-2',
    project_id: DEMO_PROJECT_ID,
    week_id: 'week-1',
    title: 'Weekend offer design',
    content_type: 'post',
    task_date: '2026-10-03',
    content_url: 'https://www.instagram.com/p/DA4w1Lz',
    status: 'completed',
    notes: '20% off weekend dining buffet graphic',
    created_at: '2026-10-03T10:00:00Z',
    updated_at: '2026-10-03T10:00:00Z',
  },
  {
    id: 'task-3',
    project_id: DEMO_PROJECT_ID,
    week_id: 'week-1',
    title: 'Room tour content',
    content_type: 'video',
    task_date: '2026-10-05',
    content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'completed',
    notes: '4K video tour of Presidential Penthouse',
    created_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-05T10:00:00Z',
  },
  {
    id: 'task-4',
    project_id: DEMO_PROJECT_ID,
    week_id: 'week-1',
    title: 'Customer testimonial',
    content_type: 'reel',
    task_date: '2026-10-06',
    content_url: 'https://www.instagram.com/reel/DA8y5Mp',
    status: 'completed',
    notes: 'Interview with visiting business executive',
    created_at: '2026-10-06T10:00:00Z',
    updated_at: '2026-10-06T10:00:00Z',
  },
  {
    id: 'task-5',
    project_id: DEMO_PROJECT_ID,
    week_id: 'week-1',
    title: 'Restaurant promotional design',
    content_type: 'post',
    task_date: '2026-10-07',
    content_url: 'https://www.instagram.com/p/DA-m3Nt',
    status: 'completed',
    notes: 'Rooftop restaurant dinner menu launch',
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z',
  },
];

function getProjectsKey(userScope: string): string {
  return `infynux_projects_${userScope.toLowerCase().trim()}`;
}

function getTasksKey(userScope: string): string {
  return `infynux_tasks_${userScope.toLowerCase().trim()}`;
}

export function getLocalProjects(userScope: string): Project[] {
  if (typeof window === 'undefined') return [];
  const key = getProjectsKey(userScope);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read local projects:', err);
  }

  // Pre-seed demo project only for demo@agency.com
  if (userScope.toLowerCase().trim() === 'demo@agency.com') {
    localStorage.setItem(key, JSON.stringify([initialDemoProject]));
    return [initialDemoProject];
  }

  return [];
}

export function saveLocalProjects(userScope: string, projects: Project[]): void {
  if (typeof window === 'undefined') return;
  const key = getProjectsKey(userScope);
  try {
    localStorage.setItem(key, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save local projects:', err);
  }
}

export function getLocalTasks(userScope: string): Task[] {
  if (typeof window === 'undefined') return [];
  const key = getTasksKey(userScope);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read local tasks:', err);
  }

  // Pre-seed demo tasks only for demo@agency.com
  if (userScope.toLowerCase().trim() === 'demo@agency.com') {
    localStorage.setItem(key, JSON.stringify(initialDemoTasks));
    return initialDemoTasks;
  }

  return [];
}

export function saveLocalTasks(userScope: string, tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  const key = getTasksKey(userScope);
  try {
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save local tasks:', err);
  }
}

export function calculateProjectStats(project: Project, tasks: Task[]): ProjectStatsView {
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const completed_reels = projectTasks.filter((t) => t.status === 'completed' && t.content_type === 'reel').length;
  const completed_posts = projectTasks.filter((t) => t.status === 'completed' && t.content_type === 'post').length;
  const completed_videos = projectTasks.filter((t) => t.status === 'completed' && t.content_type === 'video').length;
  const in_progress_tasks = projectTasks.filter((t) => t.status === 'in_progress').length;
  const planned_tasks = projectTasks.filter((t) => t.status === 'planned').length;
  const total_planned = project.planned_reels + project.planned_posts + project.planned_videos;
  const total_completed = completed_reels + completed_posts + completed_videos;
  const total_remaining = Math.max(total_planned - total_completed, 0);
  const progress_pct = total_planned > 0
    ? Math.round((total_completed / total_planned) * 1000) / 10
    : null;

  return {
    project_id: project.id,
    completed_reels,
    planned_reels: project.planned_reels,
    completed_posts,
    planned_posts: project.planned_posts,
    completed_videos,
    planned_videos: project.planned_videos,
    total_planned,
    total_completed,
    total_remaining,
    progress_pct,
    in_progress_tasks,
    planned_tasks,
  };
}
