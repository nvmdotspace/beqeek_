import { Bell } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";

export const NotificationsPage = () => {
  return (
    <FeaturePlaceholder
      title={m.notifications_title()}
      description={
        m.notifications_description()
      }
      icon={<Bell className="h-6 w-6 text-primary" />}
    />
  );
};

export default NotificationsPage;
