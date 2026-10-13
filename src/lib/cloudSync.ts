import { supabase } from './supabaseClient';
import { getCurrentUserScope } from './userScope';
import { getLocalProjects, getLocalTasks, DEMO_PROJECT_ID } from './localDataStore';
import { queryClient } from './queryClient';
import type { Project, Task } from '../types';

export interface SyncResult {
  synced: boolean;
  count: number;
  reason?: string;
}

/**
 * Validates whether a string is a standard UUID.
 */
function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Synchronizes locally saved projects and tasks from this browser's localStorage
 * to the Supabase Cloud database for the currently authenticated user.
 * 
 * This ensures work created offline, in local demo mode, or before confirming email
 * is preserved and immediately visible on any other logged-in device.
 */
export async function syncLocalProjectsToSupabase(): Promise<SyncResult> {
  if (typeof window === 'undefined') {
    return { synced: false, count: 0, reason: 'no_window' };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { synced: false, count: 0, reason: 'not_authenticated' };
    }

    const userEmail = (user.email || '').toLowerCase().trim();
    const currentScope = getCurrentUserScope();

    // Collect all local projects that might exist under user email or current scope
    const candidateScopes = Array.from(
      new Set([userEmail, currentScope, 'demo@agency.com'])
    ).filter(Boolean);

    const localProjectsMap = new Map<string, Project>();
    const allLocalTasks: Task[] = [];

    candidateScopes.forEach((scope) => {
      const projs = getLocalProjects(scope);
      projs.forEach((p) => {
        // Skip default untouched demo project unless user edited or added custom ones
        if (p.id === DEMO_PROJECT_ID && p.title === 'Emirates Inn Digital Marketing' && projs.length > 1) {
          return;
        }
        localProjectsMap.set(p.id, p);
      });

      const tasks = getLocalTasks(scope);
      tasks.forEach((t) => allLocalTasks.push(t));
    });

    const localProjects = Array.from(localProjectsMap.values());
    if (localProjects.length === 0) {
      return { synced: true, count: 0, reason: 'no_local_projects' };
    }

    // Fetch existing remote projects for this user in Supabase
    const { data: remoteProjects, error: fetchErr } = await supabase
      .from('projects')
      .select('id, title')
      .eq('owner_id', user.id);

    if (fetchErr) {
      console.warn('Failed to fetch remote projects during sync:', fetchErr.message);
      return { synced: false, count: 0, reason: fetchErr.message };
    }

    const remoteTitles = new Set((remoteProjects || []).map((p) => p.title.toLowerCase().trim()));
    const remoteIds = new Set((remoteProjects || []).map((p) => p.id));

    let syncedCount = 0;

    for (const localProj of localProjects) {
      // If already present remotely by ID or exact title, skip re-inserting
      if (remoteIds.has(localProj.id) || remoteTitles.has(localProj.title.toLowerCase().trim())) {
        continue;
      }

      // Prepare project payload. If localProj.id is not a valid UUID, let Postgres generate one
      const payload: Record<string, unknown> = {
        owner_id: user.id,
        title: localProj.title,
        description: localProj.description || null,
        start_date: localProj.start_date,
        end_date: localProj.end_date,
        planned_reels: localProj.planned_reels,
        planned_posts: localProj.planned_posts,
        planned_videos: localProj.planned_videos,
        status: localProj.status,
      };

      if (isValidUuid(localProj.id)) {
        payload.id = localProj.id;
      }

      const { data: insertedProj, error: insertErr } = await supabase
        .from('projects')
        .insert(payload as never)
        .select()
        .single();

      if (insertErr || !insertedProj) {
        console.warn(`Could not sync project "${localProj.title}" to Supabase:`, insertErr?.message);
        continue;
      }

      syncedCount++;
      const newProjectId = (insertedProj as unknown as Project).id;

      // Migrate corresponding tasks belonging to this project
      const matchingTasks = allLocalTasks.filter((t) => t.project_id === localProj.id);
      for (const t of matchingTasks) {
        const taskPayload = {
          project_id: newProjectId,
          title: t.title,
          content_type: t.content_type,
          task_date: t.task_date,
          content_url: t.content_url || null,
          status: t.status,
          notes: t.notes || null,
        };

        await supabase.from('tasks').insert(taskPayload as never);
      }
    }

    if (syncedCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }

    return { synced: true, count: syncedCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error during local to cloud sync:', message);
    return { synced: false, count: 0, reason: message };
  }
}
