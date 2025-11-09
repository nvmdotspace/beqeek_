import { Users } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export const TeamPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_team_title()}
      description={m.workspace_team_description()}
      icon={<Users className="h-6 w-6 text-primary" />}
    />
  );
};

export default TeamPage;
