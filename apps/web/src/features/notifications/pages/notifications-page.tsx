import { Bell } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export const NotificationsPage = () => {
  return (
    <FeaturePlaceholder
      title={m.notifications_title()}
      description={m.notifications_description()}
      icon={<Bell className="h-6 w-6 text-primary" />}
    />
  );
};

export default NotificationsPage;
