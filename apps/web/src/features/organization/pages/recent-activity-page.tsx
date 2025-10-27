import { Clock } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";

export const RecentActivityPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_activity_title()}
      description={
        m.workspace_activity_description()
      }
      icon={<Clock className="h-6 w-6 text-primary" />}
    />
  );
};

export default RecentActivityPage;
