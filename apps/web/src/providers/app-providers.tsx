import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLanguageStore } from '@/stores/language-store';

import { ThemeProvider } from './theme-provider';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { ApiError } from '@/shared/api/api-error';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401 errors
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Component to handle language detection from URL
function LanguageDetector({ children }: { children: React.ReactNode }) {
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  React.useEffect(() => {
    // Detect language from URL path
    const pathname = window.location.pathname;
    let detectedLocale = 'vi'; // default

    if (pathname.startsWith('/en/')) {
      detectedLocale = 'en';
    }

    setLanguage(detectedLocale);
  }, [setLanguage]);

  return <>{children}</>;
}

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ApiErrorBoundary>
          <LanguageDetector>{children}</LanguageDetector>
        </ApiErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
