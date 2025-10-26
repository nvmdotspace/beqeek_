import { Activity } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const AnalyticsPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.analytics.title') || 'Workspace analytics'}
      description={
        t('workspace.analytics.description') ||
        'Monitor usage trends, automation throughput, and team health with interactive dashboards. Visual reports will appear here shortly.'
      }
      icon={<Activity className="h-6 w-6 text-primary" />}
    />
  );
};

export default AnalyticsPage;
