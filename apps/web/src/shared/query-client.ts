import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401 errors
        try {
          // Lazy check for status field on error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const status = (error as any)?.status;
          if (status === 401) return false;
        } catch {}
        return failureCount < 3;
      },
    },
  },
});
