import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { NotFoundPage } from '../features/auth/NotFoundPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DailyTasksPage } from '../features/daily-tasks/DailyTasksPage';
import { MediaHubPage } from '../features/media/MediaHubPage';
import { ProjectListPage } from '../features/projects/ProjectListPage';
import { ProjectFormPage } from '../features/projects/ProjectFormPage';
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Protected Routes within AppLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'daily-tasks',
        element: <DailyTasksPage />,
      },
      {
        path: 'media',
        element: <MediaHubPage />,
      },
      {
        path: 'projects',
        element: <ProjectListPage />,
      },
      {
        path: 'projects/new',
        element: <ProjectFormPage />,
      },
      {
        path: 'projects/:id',
        element: <ProjectDetailPage />,
      },
      {
        path: 'projects/:id/edit',
        element: <ProjectFormPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
