import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/http-client';
import type { AxiosError } from 'axios';

interface UserLookupResponse {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
}

interface UseLookupUsernameOptions {
  enabled?: boolean;
}

/**
 * Hook to check if a username exists in the system
 * Returns user data if found, null if not found
 *
 * @param username - Username to look up (must be at least 2 characters)
 * @param options - Query options
 * @returns User data or null
 */
export function useLookupUsername(username: string, options?: UseLookupUsernameOptions) {
  const trimmedUsername = username.trim();

  return useQuery({
    queryKey: ['user', 'lookup', trimmedUsername],
    queryFn: async (): Promise<UserLookupResponse | null> => {
      try {
        const response = await apiClient.post<UserLookupResponse>(
          `/api/user/get/users/via-username/${encodeURIComponent(trimmedUsername)}`,
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        // 404 means user not found - this is a valid case, return null
        if (axiosError.response?.status === 404) {
          return null;
        }
        // Other errors should be thrown
        throw error;
      }
    },
    enabled: trimmedUsername.length >= 2 && (options?.enabled ?? true),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Disable retry completely - 404 is handled in queryFn, other errors should fail immediately
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
}
