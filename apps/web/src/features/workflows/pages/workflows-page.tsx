import { Workflow } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";

export const WorkflowsPage = () => {
  return (
    <FeaturePlaceholder
      title={m.workspace_workflow_title()}
      description={
        m.workspace_workflow_description()
      }
      icon={<Workflow className="h-6 w-6 text-primary" />}
    />
  );
};

export default WorkflowsPage;
