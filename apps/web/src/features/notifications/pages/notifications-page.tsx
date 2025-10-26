import { Bell } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const NotificationsPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('notifications.title') || 'Notifications Center'}
      description={
        t('notifications.description') ||
        'You will find shared updates, workflow alerts, and review requests right here once the live event stream lands.'
      }
      icon={<Bell className="h-6 w-6 text-primary" />}
    />
  );
};

export default NotificationsPage;
