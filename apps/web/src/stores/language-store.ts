import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import React from 'react';
// @ts-expect-error - Paraglide runtime doesn't have TypeScript declarations
import { baseLocale, isLocale } from '@/paraglide/runtime';

type LanguageState = {
  locale: string;
};

type LanguageActions = {
  setLanguage: (locale: string) => void;
  syncWithRouter: () => void;
  getLocalizedPath: (path: string) => string;
};

type LanguageStore = LanguageState & LanguageActions;

const initialState: LanguageState = {
  locale: baseLocale,
};

export const useLanguageStore = create<LanguageStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setLanguage: (locale) => {
          // If locale is not supported, fallback to English
          if (!isLocale(locale)) {
            console.warn(`Unsupported locale: ${locale}. Falling back to English`);
            locale = 'en';
          }

          set({ locale });

          // Update HTML lang attribute
          if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
          }
        },
        syncWithRouter: () => {
          // Sync is now handled by LanguageDetector component
        },
        getLocalizedPath: (path: string) => {
          const { locale } = get();
          if (locale === baseLocale) {
            return path;
          }
          return `/${locale}${path}`;
        },
      }),
      {
        name: 'language-store',
        storage: createJSONStorage(() => localStorage),
        partialize: ({ locale }) => ({ locale }),
      },
    ),
    { name: 'language-store' },
  ),
);

// Hook to initialize language store on app start
export const useInitializeLanguage = () => {
  const syncWithRouter = useLanguageStore((state) => state.syncWithRouter);

  React.useEffect(() => {
    syncWithRouter();
  }, [syncWithRouter]);
};
