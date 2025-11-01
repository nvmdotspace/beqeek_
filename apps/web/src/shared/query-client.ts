import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on client errors (4xx)
        try {
          // Lazy check for status field on error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const status = (error as any)?.status;
          // Don't retry on 4xx errors (400-499)
          if (status && status >= 400 && status < 500) {
            return false;
          }
        } catch {}
        // Retry up to 3 times for network errors and 5xx errors
        return failureCount < 3;
      },
    },
  },
});
