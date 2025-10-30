/**
 * Shared locale types and utilities
 * Single source of truth for locale configuration
 */

export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';

/**
 * Check if a string is a valid supported locale
 */
export const isSupportedLocale = (locale?: string): locale is Locale => {
  return !!locale && SUPPORTED_LOCALES.includes(locale as Locale);
};

/**
 * Normalize a locale string to a valid Locale type
 * Falls back to DEFAULT_LOCALE if invalid
 */
export const normalizeLocale = (locale?: string): Locale => {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
};

/**
 * Extract locale from URL pathname
 * Returns the locale segment from URL like /vi/workspaces or /en/login
 */
export const getLocaleFromPathname = (pathname: string): Locale => {
  const segments = pathname.split('/');
  const localeSegment = segments[1]; // First segment after /
  return normalizeLocale(localeSegment);
};

/**
 * Build a localized path
 * @param path - The path without locale (e.g., /workspaces)
 * @param locale - The locale to prepend
 * @returns The full localized path (e.g., /vi/workspaces)
 */
export const buildLocalizedPath = (path: string, locale: Locale = DEFAULT_LOCALE): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}/${cleanPath}`;
};

/**
 * Get navigation params for TanStack Router
 * @param locale - The locale to use
 * @param workspaceId - Optional workspace ID
 * @param additionalParams - Additional route parameters
 * @returns Navigation params object
 */
export const getNavigationParams = <T extends Record<string, string>>(
  locale: Locale,
  workspaceId?: string,
  additionalParams?: T,
): { locale: Locale; workspaceId?: string } & T => {
  return {
    locale,
    ...(workspaceId && { workspaceId }),
    ...additionalParams,
  } as { locale: Locale; workspaceId?: string } & T;
};
