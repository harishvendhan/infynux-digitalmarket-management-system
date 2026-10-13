import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getCurrentUserScope } from '../../lib/userScope';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../auth/useAuth';

export type TaskCategory = 'general' | 'reel' | 'post' | 'video' | 'client';

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  date: string;
  createdAt: string;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_TASKS: DailyTask[] = [
  {
    id: 'dt-1',
    title: 'Review Emirates Inn customer testimonial reel',
    completed: true,
    category: 'reel',
    date: getTodayString(),
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'dt-2',
    title: 'Verify Facebook & Instagram ad campaign metrics',
    completed: false,
    category: 'client',
    date: getTodayString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'dt-3',
    title: 'Schedule Q4 weekend promo posts & captions',
    completed: false,
    category: 'post',
    date: getTodayString(),
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'dt-4',
    title: 'Record hotel rooftop restaurant tour clip',
    completed: false,
    category: 'video',
    date: getTodayString(),
    createdAt: new Date().toISOString(),
  },
];

export function useDailyTasks() {
  const { user, isDemoUser } = useAuth();
  const userScope = getCurrentUserScope();
  const storageKey = `infynux_daily_tasks_${userScope}`;

  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    // 1. Try to load from authenticated user profile metadata in Supabase
    if (user?.user_metadata?.daily_tasks && Array.isArray(user.user_metadata.daily_tasks)) {
      return user.user_metadata.daily_tasks;
    }

    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      if (userScope === 'demo@agency.com') {
        localStorage.setItem(storageKey, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
    } catch (e) {
      console.error('Failed to parse stored daily tasks:', e);
    }
    return [];
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Reload tasks when user or user scope changes
  useEffect(() => {
    if (user?.user_metadata?.daily_tasks && Array.isArray(user.user_metadata.daily_tasks)) {
      setTasks(user.user_metadata.daily_tasks);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else if (userScope === 'demo@agency.com') {
        setTasks(INITIAL_TASKS);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    }
  }, [user, userScope, storageKey]);

  // Persist to local cache and Supabase user metadata
  const persistTasks = (nextTasks: DailyTask[]) => {
    setTasks(nextTasks);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextTasks));
    } catch (e) {
      console.error('Failed to save daily tasks locally:', e);
    }

    if (user && !isDemoUser) {
      supabase.auth.updateUser({
        data: { daily_tasks: nextTasks },
      }).catch((err) => {
        console.error('Failed to sync daily tasks to Supabase user profile:', err);
      });
    }
  };

  const addTask = (title: string, category: TaskCategory = 'general') => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error('Please enter a task description');
      return;
    }

    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      completed: false,
      category,
      date: getTodayString(),
      createdAt: new Date().toISOString(),
    };

    const next = [newTask, ...tasks];
    persistTasks(next);
    toast.success('Task added to daily checklist');
  };

  const toggleTask = (id: string) => {
    const next = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          toast.success(`Completed: "${t.title}"`);
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    persistTasks(next);
  };

  const deleteTask = (id: string) => {
    const next = tasks.filter((t) => t.id !== id);
    persistTasks(next);
    toast.info('Task removed');
  };

  const clearCompleted = () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    const next = tasks.filter((t) => !t.completed);
    persistTasks(next);
    toast.info(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`);
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    filter,
    setFilter,
    stats: {
      totalCount,
      completedCount,
      pendingCount,
      progressPct,
    },
  };
}
