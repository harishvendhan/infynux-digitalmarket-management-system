import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, shouldUseMockData } from '../../lib/supabaseClient';
import type { Task, ProjectWeek, WeekStatsView } from '../../types';
import { generateProjectWeeks } from '../../lib/dates';
import type { TaskFormData } from '../../lib/schemas';
import { getCurrentUserScope } from '../../lib/userScope';
import {
  getLocalTasks,
  saveLocalTasks,
} from '../../lib/localDataStore';
import { toast } from 'sonner';

export function useProjectWeeks(projectId: string | undefined, startDate?: string, endDate?: string) {
  const userScope = getCurrentUserScope();

  return useQuery({
    queryKey: ['project_weeks', projectId, userScope],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<ProjectWeek[]> => {
      if (!projectId) return [];

      if (shouldUseMockData()) {
        const start = startDate || '2026-10-01';
        const end = endDate || '2026-12-31';
        const generated = generateProjectWeeks(start, end);
        return generated.map((w) => ({
          id: `week-${w.week_number}`,
          project_id: projectId,
          week_number: w.week_number,
          start_date: w.start_date,
          end_date: w.end_date,
        }));
      }

      const res = await supabase
        .from('project_weeks')
        .select('*')
        .eq('project_id', projectId)
        .order('week_number', { ascending: true });

      if (res.error) throw res.error;
      return (res.data as unknown as ProjectWeek[]) || [];
    },
  });
}

export function useProjectTasks(projectId: string | undefined) {
  const userScope = getCurrentUserScope();

  return useQuery({
    queryKey: ['tasks', projectId, userScope],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<Task[]> => {
      if (!projectId) return [];

      if (shouldUseMockData()) {
        const tasks = getLocalTasks(userScope);
        return tasks.filter((t) => t.project_id === projectId || projectId === 'demo');
      }

      const res = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('task_date', { ascending: true });

      if (res.error) throw res.error;
      return (res.data as unknown as Task[]) || [];
    },
  });
}

export function useWeekStats(projectId: string | undefined) {
  const userScope = getCurrentUserScope();

  return useQuery({
    queryKey: ['week_stats', projectId, userScope],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<WeekStatsView[]> => {
      if (!projectId) return [];

      if (shouldUseMockData()) {
        const tasks = getLocalTasks(userScope).filter(
          (t) => t.project_id === projectId || projectId === 'demo'
        );

        const weekMap = new Map<string, Task[]>();
        tasks.forEach((t) => {
          const wId = t.week_id || 'week-1';
          if (!weekMap.has(wId)) weekMap.set(wId, []);
          weekMap.get(wId)!.push(t);
        });

        if (weekMap.size === 0) {
          return [
            {
              week_id: 'week-1',
              project_id: projectId,
              week_number: 1,
              completed_reels: 0,
              completed_posts: 0,
              completed_videos: 0,
              total_tasks: 0,
              in_progress_tasks: 0,
            },
          ];
        }

        const views: WeekStatsView[] = [];
        let weekNum = 1;
        weekMap.forEach((wTasks, wId) => {
          views.push({
            week_id: wId,
            project_id: projectId,
            week_number: weekNum++,
            completed_reels: wTasks.filter((t) => t.status === 'completed' && t.content_type === 'reel').length,
            completed_posts: wTasks.filter((t) => t.status === 'completed' && t.content_type === 'post').length,
            completed_videos: wTasks.filter((t) => t.status === 'completed' && t.content_type === 'video').length,
            total_tasks: wTasks.length,
            in_progress_tasks: wTasks.filter((t) => t.status === 'in_progress').length,
          });
        });
        return views;
      }

      const res = await supabase
        .from('week_stats')
        .select('*')
        .eq('project_id', projectId)
        .order('week_number', { ascending: true });

      if (res.error) throw res.error;
      return (res.data as unknown as WeekStatsView[]) || [];
    },
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: TaskFormData) => {
      const userScope = getCurrentUserScope();

      if (shouldUseMockData()) {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          project_id: projectId,
          week_id: 'week-1',
          title: formData.title,
          content_type: formData.content_type,
          task_date: formData.task_date,
          content_url: formData.content_url || null,
          status: formData.status,
          notes: formData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const currentTasks = getLocalTasks(userScope);
        saveLocalTasks(userScope, [...currentTasks, newTask]);
        return newTask;
      }

      const res = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: formData.title,
          content_type: formData.content_type,
          task_date: formData.task_date,
          content_url: formData.content_url || null,
          status: formData.status,
          notes: formData.notes || null,
        } as never)
        .select()
        .single();

      if (res.error) throw res.error;
      return res.data as unknown as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['week_stats'] });
      queryClient.invalidateQueries({ queryKey: ['project_stats'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Task created successfully!');
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, formData }: { taskId: string; formData: TaskFormData }) => {
      const userScope = getCurrentUserScope();

      if (shouldUseMockData()) {
        const currentTasks = getLocalTasks(userScope);
        const updated = currentTasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                title: formData.title,
                content_type: formData.content_type,
                task_date: formData.task_date,
                content_url: formData.content_url || null,
                status: formData.status,
                notes: formData.notes || null,
                updated_at: new Date().toISOString(),
              }
            : t
        );
        saveLocalTasks(userScope, updated);
        return;
      }

      const res = await supabase
        .from('tasks')
        .update({
          title: formData.title,
          content_type: formData.content_type,
          task_date: formData.task_date,
          content_url: formData.content_url || null,
          status: formData.status,
          notes: formData.notes || null,
        } as never)
        .eq('id', taskId);

      if (res.error) throw res.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['week_stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_stats'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Task updated successfully!');
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const userScope = getCurrentUserScope();

      if (shouldUseMockData()) {
        const currentTasks = getLocalTasks(userScope);
        saveLocalTasks(
          userScope,
          currentTasks.filter((t) => t.id !== taskId)
        );
        return;
      }

      const res = await supabase.from('tasks').delete().eq('id', taskId);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['week_stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_stats'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Task deleted successfully.');
    },
  });
}
