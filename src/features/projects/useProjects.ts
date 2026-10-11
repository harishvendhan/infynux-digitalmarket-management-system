import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, shouldUseMockData } from '../../lib/supabaseClient';
import type { Project, ProjectStatsView, DashboardStatsView, ProjectWithStats } from '../../types';
import { needsAttention } from '../../lib/stats';
import { getTodayString } from '../../lib/dates';
import type { ProjectFormData } from '../../lib/schemas';
import { getCurrentUserScope } from '../../lib/userScope';
import {
  DEMO_PROJECT_ID,
  getLocalProjects,
  saveLocalProjects,
  getLocalTasks,
  saveLocalTasks,
  calculateProjectStats,
} from '../../lib/localDataStore';
import { toast } from 'sonner';

export { DEMO_PROJECT_ID };

export function useProjects() {
  const today = getTodayString();
  const userScope = getCurrentUserScope();

  return useQuery({
    queryKey: ['projects', userScope],
    queryFn: async (): Promise<ProjectWithStats[]> => {
      if (shouldUseMockData()) {
        const projects = getLocalProjects(userScope);
        const tasks = getLocalTasks(userScope);

        return projects.map((p) => {
          const stats = calculateProjectStats(p, tasks);
          const attn = needsAttention(p, stats, today);
          return { project: p, stats, needsAttention: attn };
        });
      }

      // Fetch projects from Supabase for authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const resProjects = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (resProjects.error) throw resProjects.error;
      const projects = (resProjects.data as unknown as Project[]) || [];

      // Fetch project_stats from view
      const resStats = await supabase.from('project_stats').select('*');
      if (resStats.error) throw resStats.error;
      const statsData = (resStats.data as unknown as ProjectStatsView[]) || [];

      const statsMap = new Map<string, ProjectStatsView>();
      statsData.forEach((s) => statsMap.set(s.project_id, s));

      return projects.map((project) => {
        const stats = statsMap.get(project.id) || {
          project_id: project.id,
          completed_reels: 0,
          planned_reels: project.planned_reels,
          completed_posts: 0,
          planned_posts: project.planned_posts,
          completed_videos: 0,
          planned_videos: project.planned_videos,
          total_planned: project.planned_reels + project.planned_posts + project.planned_videos,
          total_completed: 0,
          total_remaining: project.planned_reels + project.planned_posts + project.planned_videos,
          progress_pct: null,
          in_progress_tasks: 0,
          planned_tasks: 0,
        };

        const attn = needsAttention(project, stats, today);
        return { project, stats, needsAttention: attn };
      });
    },
  });
}

export function useProject(id: string | undefined) {
  const today = getTodayString();
  const userScope = getCurrentUserScope();

  return useQuery({
    queryKey: ['project', id, userScope],
    enabled: Boolean(id),
    queryFn: async (): Promise<ProjectWithStats | null> => {
      if (!id) return null;

      if (shouldUseMockData()) {
        const projects = getLocalProjects(userScope);
        const p = projects.find((item) => item.id === id);
        if (!p) return null;

        const tasks = getLocalTasks(userScope);
        const stats = calculateProjectStats(p, tasks);
        const attn = needsAttention(p, stats, today);
        return { project: p, stats, needsAttention: attn };
      }

      const resProj = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (resProj.error || !resProj.data) return null;
      const project = resProj.data as unknown as Project;

      const resStats = await supabase
        .from('project_stats')
        .select('*')
        .eq('project_id', id)
        .single();

      const stats = (resStats.data as unknown as ProjectStatsView) || {
        project_id: project.id,
        completed_reels: 0,
        planned_reels: project.planned_reels,
        completed_posts: 0,
        planned_posts: project.planned_posts,
        completed_videos: 0,
        planned_videos: project.planned_videos,
        total_planned: project.planned_reels + project.planned_posts + project.planned_videos,
        total_completed: 0,
        total_remaining: project.planned_reels + project.planned_posts + project.planned_videos,
        progress_pct: null,
        in_progress_tasks: 0,
        planned_tasks: 0,
      };

      const attn = needsAttention(project, stats, today);
      return { project, stats, needsAttention: attn };
    },
  });
}

export function useDashboardStats() {
  const { data: projectItems, isLoading } = useProjects();

  const stats: DashboardStatsView = {
    owner_id: '',
    total_projects: projectItems?.length || 0,
    active_projects: projectItems?.filter((p) => p.project.status === 'in_progress').length || 0,
    completed_projects: projectItems?.filter((p) => p.project.status === 'completed').length || 0,
    total_reels_completed: projectItems?.reduce((acc, p) => acc + p.stats.completed_reels, 0) || 0,
    total_posts_completed: projectItems?.reduce((acc, p) => acc + p.stats.completed_posts, 0) || 0,
    total_videos_completed: projectItems?.reduce((acc, p) => acc + p.stats.completed_videos, 0) || 0,
  };

  const attentionProjects = projectItems?.filter((p) => p.needsAttention.flag) || [];

  return { stats, attentionProjects, isLoading };
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ProjectFormData): Promise<Project> => {
      const userScope = getCurrentUserScope();

      if (shouldUseMockData()) {
        const newProj: Project = {
          id: `proj-${Date.now()}`,
          owner_id: userScope,
          title: formData.title,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          planned_reels: formData.planned_reels,
          planned_posts: formData.planned_posts,
          planned_videos: formData.planned_videos,
          status: formData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const currentProjects = getLocalProjects(userScope);
        saveLocalProjects(userScope, [newProj, ...currentProjects]);
        return newProj;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const res = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          title: formData.title,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          planned_reels: formData.planned_reels,
          planned_posts: formData.planned_posts,
          planned_videos: formData.planned_videos,
          status: formData.status,
        } as never)
        .select()
        .single();

      if (res.error) throw res.error;
      return res.data as unknown as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Project created successfully!');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ProjectFormData }) => {
      const userScope = getCurrentUserScope();

      if (shouldUseMockData()) {
        const currentProjects = getLocalProjects(userScope);
        const updated = currentProjects.map((p) =>
          p.id === id
            ? {
                ...p,
                title: formData.title,
                description: formData.description || null,
                start_date: formData.start_date,
                end_date: formData.end_date,
                planned_reels: formData.planned_reels,
                planned_posts: formData.planned_posts,
                planned_videos: formData.planned_videos,
                status: formData.status,
                updated_at: new Date().toISOString(),
              }
            : p
        );
        saveLocalProjects(userScope, updated);
        return;
      }

      // Check D4 before update: verify whether any tasks fall outside new dates
      const resTasks = await supabase
        .from('tasks')
        .select('id, task_date, title')
        .eq('project_id', id);

      const tasks = (resTasks.data as unknown as Array<{ id: string; task_date: string; title: string }>) || [];

      if (tasks.length > 0) {
        const outsideTasks = tasks.filter(
          (t) => t.task_date < formData.start_date || t.task_date > formData.end_date
        );
        if (outsideTasks.length > 0) {
          throw new Error(
            `${outsideTasks.length} task${outsideTasks.length > 1 ? 's' : ''} fall outside the new dates. Move or delete them first.`
          );
        }
      }

      const res = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          planned_reels: formData.planned_reels,
          planned_posts: formData.planned_posts,
          planned_videos: formData.planned_videos,
          status: formData.status,
        } as never)
        .eq('id', id);

      if (res.error) throw res.error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Project updated successfully!');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userScope = getCurrentUserScope();

      if (shouldUseMockData()) {
        const currentProjects = getLocalProjects(userScope);
        saveLocalProjects(
          userScope,
          currentProjects.filter((p) => p.id !== id)
        );

        // Also clean up tasks belonging to this project
        const currentTasks = getLocalTasks(userScope);
        saveLocalTasks(
          userScope,
          currentTasks.filter((t) => t.project_id !== id)
        );
        return;
      }

      const res = await supabase.from('projects').delete().eq('id', id);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Project and associated schedule deleted.');
    },
  });
}
