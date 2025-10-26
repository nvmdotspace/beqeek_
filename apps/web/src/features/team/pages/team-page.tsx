import { Users } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const TeamPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.team.title') || 'Manage your workspace team'}
      description={
        t('workspace.team.description') ||
        'Invite collaborators, review roles, and manage permissions for every workspace member. The dedicated experience is on its way.'
      }
      icon={<Users className="h-6 w-6 text-primary" />}
    />
  );
};

export default TeamPage;
