import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useLanguageStore } from '@/stores/language-store';
// @ts-expect-error - Paraglide runtime doesn't have TypeScript declarations
import { baseLocale, isLocale } from '@/paraglide/generated/runtime.js';

import { ThemeProvider } from './theme-provider';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { ApiError } from '@/shared/api/api-error';
import { queryClient } from '@/shared/query-client';

// Component to handle language detection from URL
function LanguageDetector({ children }: { children: React.ReactNode }) {
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  React.useEffect(() => {
    // Detect language from URL path (first segment)
    const pathname = window.location.pathname;
    const first = pathname.split('/')[1] || '';
    const detected = isLocale(first) ? first : baseLocale;
    setLanguage(detected);
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
