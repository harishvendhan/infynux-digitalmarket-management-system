import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  ListTodo,
  Images,
  Settings,
  LogOut,
} from 'lucide-react';

import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarProps {
  userEmail?: string | null;
  userName?: string | null;
  onSignOut?: () => void;
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userEmail,
  userName,
  onSignOut,
  className = '',
  onNavigate,
}) => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/daily-tasks',
      label: 'Daily Tasks',
      icon: ListTodo,
    },
    {
      to: '/media',
      label: 'Media & Proofs',
      icon: Images,
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: Briefcase,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none transition-colors duration-200 ${className}`}
    >
      {/* Brand Logo & Title */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-sm border border-slate-800 shrink-0">
          <img src="/logo.png" alt="Infynux Logo" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm block leading-tight truncate">
            Infynux
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
            Digital Market Management
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User profile, theme toggle & sign-out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {userName || 'Demo Agency Lead'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  userEmail && userEmail !== 'demo@agency.com'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {userEmail && userEmail !== 'demo@agency.com' ? 'Supabase Synced' : 'Local Mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
