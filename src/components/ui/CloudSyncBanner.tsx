import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { syncLocalProjectsToSupabase } from '../../lib/cloudSync';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CloudSyncBanner: React.FC = () => {
  const { user, isDemoUser } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const isCloudConnected = Boolean(!isDemoUser && user && isSupabaseConfigured);

  const handleManualSync = async () => {
    if (!isCloudConnected) {
      toast.info('Sign in with a verified account to sync your projects across all devices.');
      navigate('/login');
      return;
    }

    setSyncing(true);
    try {
      const result = await syncLocalProjectsToSupabase();
      if (result.synced) {
        if (result.count > 0) {
          toast.success(`Successfully uploaded ${result.count} project(s) to Supabase Cloud!`);
        } else {
          toast.success('All projects are up to date and synced with Supabase Cloud.');
        }
      } else {
        toast.error(`Sync issue: ${result.reason || 'Check network connection'}`);
      }
    } catch (err) {
      toast.error('Sync failed. Please check network connection.');
    } finally {
      setSyncing(false);
    }
  };

  if (isCloudConnected) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="font-semibold">Supabase Synced & Active</span>
            <span className="hidden sm:inline text-emerald-700/80 dark:text-emerald-400/80 ml-2">
              • Projects & tasks sync automatically across all devices via Supabase
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-3 py-1 font-medium bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-emerald-700 dark:text-emerald-300 disabled:opacity-60"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Supabase'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
          <CloudOff className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100 text-sm">
            <span>Local Device Storage Mode</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300">
              Not Synced Across Devices
            </span>
          </div>
          <p className="text-amber-800/90 dark:text-amber-300/90 text-xs leading-relaxed max-w-2xl">
            Projects you create here are currently saved <strong>only in this browser</strong>. To access your projects on another computer or phone, sign in to sync with Supabase.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
        <button
          type="button"
          onClick={handleManualSync}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer text-xs disabled:opacity-60"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Sync to Supabase</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
