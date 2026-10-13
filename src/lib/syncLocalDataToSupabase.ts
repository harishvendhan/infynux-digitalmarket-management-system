import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import {
  DEMO_PROJECT_ID,
  getLocalProjects,
  saveLocalProjects,
  getLocalTasks,
  saveLocalTasks,
} from './localDataStore';

/**
 * Automatically migrates any projects and tasks previously saved in localStorage
 * to Supabase under the authenticated user's account.
 * This ensures work created on Device 1 is uploaded to Supabase cloud and accessible
 * on Device 2 or any other device.
 */
export async function syncLocalDataToSupabase(user: User): Promise<{
  projectsMigrated: number;
  tasksMigrated: number;
}> {
  if (!user || !user.id || !user.email) {
    return { projectsMigrated: 0, tasksMigrated: 0 };
  }

  const userScope = user.email.toLowerCase().trim();
  if (userScope === 'demo@agency.com') {
    return { projectsMigrated: 0, tasksMigrated: 0 };
  }

  const localProjects = getLocalProjects(userScope);
  const localTasks = getLocalTasks(userScope);

  let projectsMigrated = 0;
  let tasksMigrated = 0;

  // Filter out the static demo project template
  const projectsToSync = localProjects.filter((p) => p.id !== DEMO_PROJECT_ID);

  for (const proj of projectsToSync) {
    try {
      // Check if project with the same title already exists in Supabase for this user
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', user.id)
        .eq('title', proj.title)
        .maybeSingle();

      let targetProjectId = existing?.id;

      if (!existing) {
        // Insert project into Supabase
        const { data: createdProj, error: projErr } = await supabase
          .from('projects')
          .insert({
            owner_id: user.id,
            title: proj.title,
            description: proj.description || null,
            start_date: proj.start_date,
            end_date: proj.end_date,
            planned_reels: proj.planned_reels,
            planned_posts: proj.planned_posts,
            planned_videos: proj.planned_videos,
            status: proj.status,
          } as never)
          .select()
          .single();

        if (projErr || !createdProj) {
          console.error('Failed to sync local project to Supabase:', projErr);
          continue;
        }

        targetProjectId = (createdProj as { id: string }).id;
        projectsMigrated++;
      }

      // Sync associated tasks
      if (targetProjectId) {
        const associatedTasks = localTasks.filter((t) => t.project_id === proj.id);
        for (const task of associatedTasks) {
          // Check if task with same title and date exists
          const { data: existingTask } = await supabase
            .from('tasks')
            .select('id')
            .eq('project_id', targetProjectId)
            .eq('title', task.title)
            .maybeSingle();

          if (!existingTask) {
            const { error: taskErr } = await supabase
              .from('tasks')
              .insert({
                project_id: targetProjectId,
                title: task.title,
                content_type: task.content_type,
                task_date: task.task_date,
                content_url: task.content_url || null,
                status: task.status,
                notes: task.notes || null,
              } as never);

            if (!taskErr) {
              tasksMigrated++;
            } else {
              console.error('Failed to sync local task to Supabase:', taskErr);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error during project migration to Supabase:', err);
    }
  }

  // Also sync daily tasks from localStorage to user_metadata if user_metadata doesn't have them
  try {
    const storageKey = `infynux_daily_tasks_${userScope}`;
    const storedDaily = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const existingCloudDaily = user.user_metadata?.daily_tasks;

    if (storedDaily && (!existingCloudDaily || existingCloudDaily.length === 0)) {
      const parsedDaily = JSON.parse(storedDaily);
      if (Array.isArray(parsedDaily) && parsedDaily.length > 0) {
        await supabase.auth.updateUser({
          data: { daily_tasks: parsedDaily },
        });
      }
    }
  } catch (err) {
    console.error('Error syncing daily tasks to Supabase user metadata:', err);
  }

  // Once migrated, clear local storage so data is solely stored in Supabase
  if (projectsMigrated > 0) {
    saveLocalProjects(userScope, []);
    saveLocalTasks(userScope, []);
  }

  return { projectsMigrated, tasksMigrated };
}
