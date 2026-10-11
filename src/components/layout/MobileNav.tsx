import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../ui/ThemeToggle';

interface MobileNavProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  userEmail?: string | null;
  userName?: string | null;
  onSignOut?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onOpen,
  onClose,
  userEmail,
  userName,
  onSignOut,
}) => {
  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpen}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center p-0.5 border border-slate-800 shrink-0">
            <img src="/logo.png" alt="Infynux Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm truncate">
            Infynux DM
          </span>
        </div>
        <div className="shrink-0 flex items-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Slide-over backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar
          userEmail={userEmail}
          userName={userName}
          onSignOut={() => {
            onClose();
            if (onSignOut) onSignOut();
          }}
          onNavigate={onClose}
        />
      </div>
    </>
  );
};
