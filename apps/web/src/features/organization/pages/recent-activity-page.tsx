import { Clock } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const RecentActivityPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.activity.title') || 'Recent activity'}
      description={
        t('workspace.activity.description') ||
        'Review workspace changes, approvals, and audit logs in one timeline. The activity feed is being connected to live events.'
      }
      icon={<Clock className="h-6 w-6 text-primary" />}
    />
  );
};

export default RecentActivityPage;
