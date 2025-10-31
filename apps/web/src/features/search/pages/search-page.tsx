import { Search } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

export const SearchPage = () => {
  return (
    <FeaturePlaceholder
      title={m.search_title()}
      description={m.search_description()}
      icon={<Search className="h-6 w-6 text-primary" />}
    />
  );
};

export default SearchPage;
