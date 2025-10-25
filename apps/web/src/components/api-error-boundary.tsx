import React, { useEffect } from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { useLanguageStore } from '@/stores/language-store';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { router } from '@/router';
import { ApiError } from '@/shared/api/api-error';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
}

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ children }) => {
  const { reset } = useQueryErrorResetBoundary();
  const locale = useLanguageStore((state) => state.locale);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // Check if it's a 401 error
      if (error instanceof ApiError && error.status === 401) {
        console.log('Handling 401 error globally');

        // Clear auth state
        logout();

        // Redirect to login page with current language
        const loginPath = locale === 'vi' ? '/login' : '/en/login';
        console.log('Redirecting to login path:', loginPath);
        router.navigate({ to: loginPath });

        // Reset query error boundary
        reset();

        // Prevent the error from showing in console
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [locale, logout, reset]);

  return <>{children}</>;
};
