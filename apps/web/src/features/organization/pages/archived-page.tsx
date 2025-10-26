import { Archive } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const ArchivedPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.archived.title') || 'Archived workspace items'}
      description={
        t('workspace.archived.description') ||
        'Restore tables, workflows, and forms that are no longer active. We are wiring retention policies and restore actions right now.'
      }
      icon={<Archive className="h-6 w-6 text-primary" />}
    />
  );
};

export default ArchivedPage;
