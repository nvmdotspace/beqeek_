import { Search } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const SearchPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('search.title') || 'Universal workspace search'}
      description={
        t('search.description') ||
        'Search across tables, records, and workflows from a single surface. The command palette and filters are in development.'
      }
      icon={<Search className="h-6 w-6 text-primary" />}
    />
  );
};

export default SearchPage;
