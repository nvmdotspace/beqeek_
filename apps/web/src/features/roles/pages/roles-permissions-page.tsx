import { Shield } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

export const RolesPermissionsPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_roles_title()}
      description={m.workspace_roles_description()}
      icon={<Shield className="h-6 w-6 text-primary" />}
    />
  );
};

export default RolesPermissionsPage;
