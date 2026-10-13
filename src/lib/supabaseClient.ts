import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project')
);

export const shouldUseMockData = (): boolean => {
  if (!isSupabaseConfigured) return true;
  if (typeof window !== 'undefined') {
    const isDemo = localStorage.getItem('antigravity_demo_user') === 'true';
    const email = localStorage.getItem('antigravity_demo_email') || '';
    return isDemo && email.toLowerCase().trim() === 'demo@agency.com';
  }
  return false;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
