import { useEffect } from 'react';
import { useLanguageStore } from '@/stores/language-store';
// @ts-expect-error - Paraglide runtime doesn't have TypeScript declarations
import { locales, baseLocale } from '@/paraglide/runtime';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

export function SEOHead({ title, description, path }: SEOHeadProps) {
  const { locale } = useLanguageStore();

  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.lang = locale;

    // Update page title
    if (title) {
      document.title = `${title} | Beqeek`;
    }

    // Update or create meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // Generate hreflang tags
    const currentPath = path || window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(en|vi)/, '') || '/';

    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((tag) => tag.remove());

    // Add new hreflang tags
    locales.forEach((lang: string) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;

      if (lang === baseLocale) {
        link.href = pathWithoutLocale;
      } else {
        link.href = `/${lang}${pathWithoutLocale}`;
      }

      document.head.appendChild(link);
    });

    // Add x-default for international users
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = pathWithoutLocale;
    document.head.appendChild(xDefault);

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    if (locale === baseLocale) {
      canonical.href = pathWithoutLocale;
    } else {
      canonical.href = `/${locale}${pathWithoutLocale}`;
    }
  }, [locale, title, description, path]);

  return null; // This component doesn't render anything
}
