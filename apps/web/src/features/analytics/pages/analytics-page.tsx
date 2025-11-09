import { Activity } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-expect-error - Paraglide generates JS without .d.ts files
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
