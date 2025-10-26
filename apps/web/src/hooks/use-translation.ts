import { useLanguageStore } from '@/stores/language-store';

import vi from '../../../../messages/vi.json';
import en from '../../../../messages/en.json';

type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = { vi: vi as Dict, en: en as Dict };

function format(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = params[k];
    return v == null ? `{${k}}` : String(v);
  });
}

export function useTranslation() {
  const locale = useLanguageStore((state) => state.locale);

  const t = (key: string, params?: Record<string, unknown>) => {
    const id = key.replace(/\./g, '_');
    const dict = dictionaries[locale] ?? dictionaries.vi ?? dictionaries.en;
    const template = (dict as any)?.[id];
    return typeof template === 'string' ? format(template, params) : key;
  };

  return { t, locale };
}
