import { Star } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export const StarredPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_starred_title()}
      description={m.workspace_starred_description()}
      icon={<Star className="h-6 w-6 text-primary" />}
    />
  );
};

export default StarredPage;
