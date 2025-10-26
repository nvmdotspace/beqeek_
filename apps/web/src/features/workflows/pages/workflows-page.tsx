import { Workflow } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
import { useTranslation } from '@/hooks/use-translation';

export const WorkflowsPage = () => {
  const { t } = useTranslation();

  return (
    <FeaturePlaceholder
      title={t('workspace.workflow.title') || 'Workflow automation is coming soon'}
      description={
        t('workspace.workflow.description') ||
        'Design workflows, orchestrate automations, and track progress in real time. This module is being wired to the new sidebar experience.'
      }
      icon={<Workflow className="h-6 w-6 text-primary" />}
    />
  );
};

export default WorkflowsPage;
