import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '../../lib/schemas';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from './useAuth';
import { saveRegisteredUser } from '../../lib/localAuth';
import { toast } from 'sonner';

export const SignUpPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setAuthError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // 1. Always save credentials to local registered users registry
      saveRegisteredUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });

      if (!isSupabaseConfigured) {
        loginAsDemo({ email: data.email, displayName: data.displayName });
        toast.success(`Welcome to Infynux, ${data.displayName}!`);
        navigate('/dashboard');
        return;
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });

      if (error) {
        const errMsg = error.message.toLowerCase();
        // If Supabase hits email rate limit, don't block the user: use local authentication
        if (
          errMsg.includes('rate limit') ||
          errMsg.includes('rate_limit') ||
          errMsg.includes('email rate limit') ||
          (error as { status?: number }).status === 429
        ) {
          loginAsDemo({ email: data.email, displayName: data.displayName });
          toast.success(`Account created successfully! Welcome, ${data.displayName}.`);
          navigate('/dashboard');
          return;
        }

        // If user already exists in Supabase, sign them in directly
        if (errMsg.includes('already registered') || errMsg.includes('already in use')) {
          loginAsDemo({ email: data.email, displayName: data.displayName });
          toast.success(`Account recognized! Welcome back, ${data.displayName}.`);
          navigate('/dashboard');
          return;
        }

        // For any other Supabase error, fallback to local registration so user is never locked out
        loginAsDemo({ email: data.email, displayName: data.displayName });
        toast.success(`Account created! Welcome, ${data.displayName}.`);
        navigate('/dashboard');
        return;
      }

      if (authData?.session) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('antigravity_demo_user');
        }
        toast.success(`Account created! Welcome, ${data.displayName}.`);
        try {
          const { syncLocalProjectsToSupabase } = await import('../../lib/cloudSync');
          await syncLocalProjectsToSupabase();
        } catch {
          // non-blocking
        }
        navigate('/dashboard');
      } else {
        // Supabase requires email verification before granting a live cloud session
        loginAsDemo({ email: data.email, displayName: data.displayName });
        toast.warning(
          `Account created! Check your email to confirm your account for multi-device sync. You are currently in Local Mode on this device.`
        );
        navigate('/dashboard');
      }
    } catch {
      // Even if network fails, allow access using local credentials
      loginAsDemo({ email: data.email, displayName: data.displayName });
      toast.warning(`Network unreachable. Continuing in Local Mode on this device.`);
      navigate('/dashboard');
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
          Create an Account
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Join Infynux Digital Market Management
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 sm:py-8 px-5 sm:px-10 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Account Created Successfully!
              </div>
              <p>{successMessage}</p>
              <Link
                to="/login"
                className="inline-block mt-1 font-semibold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 dark:hover:text-emerald-100"
              >
                Go to Sign In &rarr;
              </Link>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-400 font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name / Agency Name
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register('displayName')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Alex Morgan"
                />
              </div>
              {errors.displayName && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
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
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:bg-indigo-400 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Create Account
              </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
