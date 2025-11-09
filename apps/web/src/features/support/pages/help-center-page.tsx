import { HelpCircle } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export const HelpCenterPage = () => {
  return (
    <FeaturePlaceholder
      title={m.help_title()}
      description={m.help_description()}
      icon={<HelpCircle className="h-6 w-6 text-primary" />}
    />
  );
};

export default HelpCenterPage;
