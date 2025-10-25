import { useCallback } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { router } from '@/router';
import { ApiError } from '@/shared/api/api-error';

export const useApiErrorHandler = () => {
  const { locale } = useLanguageStore();
  const { logout } = useAuthStore();

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        // Clear auth state
        logout();

        // Redirect to login page with current language
        const loginPath = locale === 'vi' ? '/login' : '/en/login';
        router.navigate({ to: loginPath });

        return true; // Error was handled
      }

      return false; // Error was not handled
    },
    [locale, logout],
  );

  return { handleError };
};
