import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../lib/schemas';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from './useAuth';
import { verifyRegisteredUser, findRegisteredUser } from '../../lib/localAuth';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setLoading(true);
    try {
      if (data.email.toLowerCase() === 'demo@agency.com') {
        loginAsDemo();
        toast.success('Signed in with Demo credentials');
        navigate('/dashboard');
        return;
      }

      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (!error) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('antigravity_demo_user');
          }
          toast.success('Signed in successfully');
          try {
            const { syncLocalProjectsToSupabase } = await import('../../lib/cloudSync');
            await syncLocalProjectsToSupabase();
          } catch {
            // Background sync is non-blocking
          }
          navigate('/dashboard');
          return;
        }

        const errMsg = (error.message || '').toLowerCase();
        if (errMsg.includes('email not confirmed')) {
          setAuthError(
            'Email confirmation pending. Please click the confirmation link sent to your inbox to enable cloud sync across all devices, or disable "Confirm email" in Supabase Auth settings.'
          );
          return;
        }

        // If Supabase returned an error (e.g. offline/network or unconfirmed fallback):
        // Check if this account was created locally or exists in registered users
        const localUser = verifyRegisteredUser(data.email, data.password);
        if (localUser) {
          loginAsDemo({ email: localUser.email, displayName: localUser.displayName });
          toast.warning('Signed in in Local Mode. Changes will only save on this device until cloud account is verified.');
          navigate('/dashboard');
          return;
        }

        // If local user exists but password differed
        const registered = findRegisteredUser(data.email);
        if (registered) {
          setAuthError('Incorrect password. Please verify and try again.');
          return;
        }

        setAuthError(error.message || 'Invalid email or password. Please try again.');
      } else {
        const localUser = verifyRegisteredUser(data.email, data.password);
        if (localUser) {
          loginAsDemo({ email: localUser.email, displayName: localUser.displayName });
          toast.success(`Welcome back, ${localUser.displayName}!`);
          navigate('/dashboard');
          return;
        }
        setAuthError('Invalid email or password. Please try again or create an account.');
      }
    } catch {
      // In case of network error, check registered accounts as fallback
      const localUser = verifyRegisteredUser(data.email, data.password);
      if (localUser) {
        loginAsDemo({ email: localUser.email, displayName: localUser.displayName });
        toast.success(`Welcome back, ${localUser.displayName}!`);
        navigate('/dashboard');
        return;
      }
      setAuthError('An unexpected network error occurred. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center p-2 shadow-lg shadow-slate-200 dark:shadow-none mb-3 border border-slate-800">
          <img src="/logo.png" alt="Infynux Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign in to Infynux
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Digital Market Management
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 sm:py-8 px-5 sm:px-10 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">

          {authError && (
            <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-400 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="demo@agency.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:bg-indigo-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Sign In
            </button>
          </form>

          {/* Create an account link */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

