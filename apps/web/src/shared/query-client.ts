import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        try {
          // Don't retry on client errors (4xx)
          // Lazy check for status field on error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const status = (error as any)?.status;
          // Don't retry on 4xx errors (400-499)
          if (status && status >= 400 && status < 500) {
            return false;
          }
        } catch (error) {
          console.warn('Query retry check failed:', error);
        }
        // Retry up to 3 times for network errors and 5xx errors
        return failureCount < 2;
      },
    },
  },
});
