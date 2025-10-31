import { createFileRoute, Outlet } from '@tanstack/react-router';

// Locale helpers: default vi, support en; fallback to vi for others
const SUPPORTED_LOCALES = ['vi', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'vi';

const isSupportedLocale = (loc?: string): loc is Locale =>
  !!loc && SUPPORTED_LOCALES.includes(loc.toLowerCase() as Locale);

export const normalizeLocale = (loc?: string): Locale =>
  isSupportedLocale(loc) ? (loc!.toLowerCase() as Locale) : DEFAULT_LOCALE;

export const Route = createFileRoute('/$locale')({
  component: () => <Outlet />,
});
