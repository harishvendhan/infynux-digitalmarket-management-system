import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fftbngoepaglonkdqxuz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGJuZ29lcGFnbG9ua2RxeHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTg2MDksImV4cCI6MjEwNzEzNDYwOX0.aYJKch_eYk2ZxSju04SOORZl4vSn-yaGbS8FM5edaeM';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder-project')
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
