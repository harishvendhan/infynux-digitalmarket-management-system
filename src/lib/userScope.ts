/**
 * User Scope Utility
 * Provides the current active user identifier (email) to isolate
 * projects, tasks, daily checklist, and media assets per account.
 */

export const getCurrentUserScope = (): string => {
  if (typeof window === 'undefined') return 'demo@agency.com';
  const email =
    localStorage.getItem('antigravity_current_user_email') ||
    localStorage.getItem('antigravity_demo_email') ||
    'demo@agency.com';
  return email.toLowerCase().trim();
};

export const setCurrentUserScope = (email: string): void => {
  if (typeof window === 'undefined') return;
  const cleanEmail = email.toLowerCase().trim();
  localStorage.setItem('antigravity_current_user_email', cleanEmail);
  localStorage.setItem('antigravity_demo_email', cleanEmail);
};

export const clearCurrentUserScope = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('antigravity_current_user_email');
  localStorage.removeItem('antigravity_demo_email');
  localStorage.removeItem('antigravity_demo_name');
  localStorage.removeItem('antigravity_demo_user');
};
