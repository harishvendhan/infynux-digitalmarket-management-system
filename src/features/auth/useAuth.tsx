import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { setCurrentUserScope, clearCurrentUserScope } from '../../lib/userScope';
import { queryClient } from '../../lib/queryClient';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loginAsDemo: (customUser?: { email?: string; displayName?: string }) => void;
  updateProfile: (displayName: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  signOut: async () => {},
  loginAsDemo: () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
  isDemoUser: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('antigravity_demo_user') === 'true';
  });

  const createDemoSession = (customUser?: { email?: string; displayName?: string }) => {
    const email = customUser?.email || (typeof window !== 'undefined' ? localStorage.getItem('antigravity_demo_email') : null) || 'demo@agency.com';
    const displayName = customUser?.displayName || (typeof window !== 'undefined' ? localStorage.getItem('antigravity_demo_name') : null) || 'Demo Agency Lead';
    const cleanEmail = email.toLowerCase().trim();

    setCurrentUserScope(cleanEmail);
    queryClient.clear();

    const userId =
      cleanEmail === 'demo@agency.com'
        ? '00000000-0000-0000-0000-000000000000'
        : `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    const mockUser = {
      id: userId,
      email: cleanEmail,
      app_metadata: {},
      user_metadata: { display_name: displayName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(mockUser);
    setSession({
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    });
    setIsDemoUser(true);
    setLoading(false);
  };

  const loginAsDemo = (customUser?: { email?: string; displayName?: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('antigravity_demo_user', 'true');
      if (customUser?.email) localStorage.setItem('antigravity_demo_email', customUser.email);
      if (customUser?.displayName) localStorage.setItem('antigravity_demo_name', customUser.displayName);
    }
    createDemoSession(customUser);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      createDemoSession();
      return;
    }

    // Always inspect Supabase session first so real accounts are never locked in demo mock mode
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('antigravity_demo_user');
        }
        setIsDemoUser(false);
        setSession(session);
        setUser(session.user);
        if (session.user.email) {
          setCurrentUserScope(session.user.email);
        }
        setLoading(false);

        // Auto-sync any existing local projects to Supabase Cloud
        import('../../lib/cloudSync')
          .then(({ syncLocalProjectsToSupabase }) => syncLocalProjectsToSupabase())
          .catch((err) => console.warn('Background cloud sync error:', err));
        return;
      }

      // If no active Supabase session, check if demo mode was explicitly active
      if (typeof window !== 'undefined' && localStorage.getItem('antigravity_demo_user') === 'true') {
        createDemoSession();
        return;
      }

      setSession(null);
      setUser(null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('antigravity_demo_user');
        }
        setIsDemoUser(false);
        setSession(session);
        setUser(session.user);
        if (session.user.email) {
          setCurrentUserScope(session.user.email);
        }
        setLoading(false);

        // Auto-sync local projects whenever user signs in or refreshes token
        import('../../lib/cloudSync')
          .then(({ syncLocalProjectsToSupabase }) => syncLocalProjectsToSupabase())
          .catch((err) => console.warn('Background cloud sync error:', err));
      } else if (event === 'SIGNED_OUT') {
        clearCurrentUserScope();
        setIsDemoUser(false);
        setUser(null);
        setSession(null);
        setLoading(false);
        toast.info('You have been signed out.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    clearCurrentUserScope();
    queryClient.clear();
    setIsDemoUser(false);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (displayName: string) => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error('Display name cannot be empty');
    }

    if (isSupabaseConfigured && !isDemoUser) {
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: trimmed },
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('antigravity_demo_name', trimmed);
      }
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            display_name: trimmed,
          },
        } as User;
      });
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (isSupabaseConfigured && !isDemoUser) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } else {
      // Demo mode simulated delay
      await new Promise((res) => setTimeout(res, 500));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        loginAsDemo,
        updateProfile,
        updatePassword,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
