import { HelpCircle } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const HelpCenterPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('help.title') || 'Help & support'}
      description={
        t('help.description') ||
        'Browse guides, contact support, and review status updates. The help center is launching alongside the new navigation IA.'
      }
      icon={<HelpCircle className="h-6 w-6 text-primary" />}
    />
  );
};

export default HelpCenterPage;
