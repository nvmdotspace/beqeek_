import { Shield } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const RolesPermissionsPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.roles.title') || 'Roles & permissions'}
      description={
        t('workspace.roles.description') ||
        'Define granular access, create custom roles, and audit user capabilities in one place. We are finalizing the data layer behind this view.'
      }
      icon={<Shield className="h-6 w-6 text-primary" />}
    />
  );
};

export default RolesPermissionsPage;
