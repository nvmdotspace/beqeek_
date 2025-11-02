import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth-store';
import { useCurrentLocale } from '@/hooks/use-current-locale';

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const locale = useCurrentLocale();

  return () => {
    // Clear tokens from store and localStorage
    logout();

    // Navigate to login page
    navigate({
      to: '/$locale/login',
      params: { locale },
    });
  };
};
