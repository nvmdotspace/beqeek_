import type { Workspace } from '@/shared/api/types';

import { WorkspaceCard } from './workspace-card';

type WorkspaceGridProps = {
  workspaces: Workspace[];
};

export const WorkspaceGrid = ({ workspaces }: WorkspaceGridProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
};
