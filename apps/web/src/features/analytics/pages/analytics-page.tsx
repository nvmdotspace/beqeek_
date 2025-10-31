import { Activity } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

export const AnalyticsPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_analytics_title()}
      description={m.workspace_analytics_description()}
      icon={<Activity className="h-6 w-6 text-primary" />}
    />
  );
};

export default AnalyticsPage;
