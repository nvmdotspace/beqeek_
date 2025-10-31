import { useAuthStore } from '../stores/auth-store';

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
  };
};
