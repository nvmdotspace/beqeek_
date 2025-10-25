import { useLanguageStore } from '@/stores/language-store';
// @ts-expect-error - Paraglide messages doesn't have TypeScript declarations
import { getMessage } from '@/paraglide/messages';

export function useTranslation() {
  const { locale } = useLanguageStore();

  const t = (key: string) => {
    return getMessage(key, locale);
  };

  return { t, locale };
}
