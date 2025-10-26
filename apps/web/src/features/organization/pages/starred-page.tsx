import { Star } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const StarredPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.starred.title') || 'Starred collections'}
      description={
        t('workspace.starred.description') ||
        'Keep your most important tables, workflows, and dashboards a click away. Pinning is being added alongside the redesigned sidebar.'
      }
      icon={<Star className="h-6 w-6 text-primary" />}
    />
  );
};

export default StarredPage;
