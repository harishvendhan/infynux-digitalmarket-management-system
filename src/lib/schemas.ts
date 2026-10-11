import { z } from 'zod';
import { isValidHttpUrl } from './urls';
import { isAfter, isEqual, parseISO } from 'date-fns';

export const projectSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(120, 'Title must not exceed 120 characters'),
    description: z.string().optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    planned_reels: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be a whole number')
      .min(0, 'Cannot be negative'),
    planned_posts: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be a whole number')
      .min(0, 'Cannot be negative'),
    planned_videos: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be a whole number')
      .min(0, 'Cannot be negative'),
    status: z.enum(['not_started', 'in_progress', 'on_hold', 'completed']),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.start_date);
        const end = parseISO(data.end_date);
        return isAfter(end, start) || isEqual(end, start);
      } catch {
        return false;
      }
    },
    {
      message: 'End date cannot be earlier than start date',
      path: ['end_date'],
    }
  );

export type ProjectFormData = z.infer<typeof projectSchema>;

export const taskSchema = z
  .object({
    title: z.string().min(1, 'Task title is required'),
    content_type: z.enum(['reel', 'post', 'video']),
    task_date: z.string().min(1, 'Task date is required'),
    content_url: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || isValidHttpUrl(val), {
        message: 'Must be a valid http(s) URL',
      }),
    status: z.enum(['planned', 'in_progress', 'completed']),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // D10: Completed tasks require a published link
      if (data.status === 'completed') {
        return Boolean(data.content_url && data.content_url.trim().length > 0 && isValidHttpUrl(data.content_url));
      }
      return true;
    },
    {
      message: 'Add the published link to mark as completed',
      path: ['content_url'],
    }
  );

export type TaskFormData = z.infer<typeof taskSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const signupSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
