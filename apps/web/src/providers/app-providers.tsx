import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useLanguageStore } from '@/stores/language-store';

import { ThemeProvider } from './theme-provider';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { ApiError } from '@/shared/api/api-error';
import { queryClient } from '@/shared/query-client';

// Component to handle language detection from URL
function LanguageDetector({ children }: { children: React.ReactNode }) {
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  React.useEffect(() => {
    // Detect language from URL path
    const pathname = window.location.pathname;
    let detectedLocale = 'vi'; // default

    // support '/en' and '/en/...'
    if (pathname === '/en' || pathname.startsWith('/en/')) {
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
