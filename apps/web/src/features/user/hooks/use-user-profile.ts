import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/user-profile-api';
import { useAuthStore } from '@/features/auth';

export const USER_PROFILE_QUERY_KEY = ['user', 'me'];

export function useUserProfile() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data;
    },
    enabled: !!userId,
  });
}
