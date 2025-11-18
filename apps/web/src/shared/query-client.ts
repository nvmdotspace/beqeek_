import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Check if error is ApiError instance
        if (error instanceof ApiError) {
          // Never retry client errors (4xx) - these are validation/auth errors
          if (error.isClientError()) {
            return false;
          }
          // Never retry network errors with status 0
          if (error.isNetworkError()) {
            return false;
          }
          // Retry server errors (5xx) up to 2 times
          if (error.isServerError()) {
            return failureCount < 2;
          }
        }

        // For other error types, check status property as fallback
        const status = (error as { status?: number })?.status;
        if (status !== undefined) {
          // Don't retry 4xx errors
          if (status >= 400 && status < 500) {
            return false;
          }
          // Retry 5xx errors up to 2 times
          if (status >= 500) {
            return failureCount < 2;
          }
        }

        // For unknown errors, retry up to 2 times
        return failureCount < 2;
      },
    },
  },
});
