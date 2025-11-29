import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { useCurrentLocale } from '@/hooks/use-current-locale';

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const locale = useCurrentLocale();

  return () => {
    // Clear tokens from store and localStorage
    logout();

    // Clear all React Query cache
    queryClient.clear();

    // Hard reload to login page to ensure clean state
    window.location.href = `/${locale}/login`;
  };
};
