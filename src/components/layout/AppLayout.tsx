import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../features/auth/useAuth';

interface AppLayoutProps {
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  userEmail: propUserEmail,
  onSignOut: propOnSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const userEmail = propUserEmail ?? user?.email ?? 'demo@agency.com';
  const userName = (user?.user_metadata?.display_name as string) || 'Demo Agency Lead';

  const handleSignOut = async () => {
    if (propOnSignOut) {
      propOnSignOut();
    } else {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Topbar & Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onOpen={() => setMobileMenuOpen(true)}
        onClose={() => setMobileMenuOpen(false)}
        userEmail={userEmail}
        userName={userName}
        onSignOut={handleSignOut}
      />

      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <Sidebar userEmail={userEmail} userName={userName} onSignOut={handleSignOut} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

