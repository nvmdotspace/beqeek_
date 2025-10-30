import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { getLocaleFromPathname, normalizeLocale, type Locale } from '@/shared/locales';

/**
 * Custom hook that provides the current locale from URL and syncs with language store.
 * This is the single source of truth for locale management.
 *
 * @returns Current locale ('vi' | 'en')
 *
 * @example
 * const locale = useCurrentLocale();
 * navigate({ to: '/$locale/workspaces/$workspaceId/tables', params: { locale, workspaceId } });
 */
export function useCurrentLocale(): Locale {
  const router = useRouter();
  const { locale: storeLocale, setLanguage } = useLanguageStore();

  // Get locale from URL pathname
  const urlLocale = getLocaleFromPathname(router.state.location.pathname);

  // Sync URL locale with store if they differ
  useEffect(() => {
    if (urlLocale !== storeLocale) {
      setLanguage(urlLocale);
    }
  }, [urlLocale, storeLocale, setLanguage]);

  return urlLocale;
}
