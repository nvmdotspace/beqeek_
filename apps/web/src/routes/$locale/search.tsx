import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getIsAuthenticated } from '@/features/auth';
import { normalizeLocale } from '../$locale';

const SearchPageLazy = lazy(() =>
  import('@/features/search/pages/search-page').then((m) => ({ default: m.SearchPage })),
);

export const Route = createFileRoute('/$locale/search')({
  component: SearchComponent,
  beforeLoad: ({ params }) => {
    const locale = normalizeLocale(params.locale);
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/$locale/login', params: { locale } });
    }
  },
});

function SearchComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SearchPageLazy />
    </Suspense>
  );
}
