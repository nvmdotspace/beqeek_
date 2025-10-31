import { Archive } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

export const ArchivedPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_archived_title()}
      description={m.workspace_archived_description()}
      icon={<Archive className="h-6 w-6 text-primary" />}
    />
  );
};

export default ArchivedPage;
