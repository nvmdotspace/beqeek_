import { useLanguageStore } from '@/stores/language-store';
// @ts-expect-error - Paraglide runtime doesn't have TypeScript declarations
import { locales, baseLocale } from '@/paraglide/runtime';

export function LanguageSwitcher() {
  const { locale, setLanguage } = useLanguageStore();

  const handleLanguageChange = (newLocale: string) => {
    setLanguage(newLocale);

    // Navigate to the same path with new language
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(en|vi)/, '') || '/';
    const newPath = newLocale === baseLocale ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;

    window.location.href = newPath;
  };

  return (
    <div className="flex gap-2">
      {locales.map((lang: string) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            locale === lang ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          data-active={locale === lang}
          title={lang === 'vi' ? 'Tiếng Việt' : 'English'}
        >
          {lang === 'vi' ? '🇻🇳' : '🇺🇸'}
        </button>
      ))}
    </div>
  );
}
