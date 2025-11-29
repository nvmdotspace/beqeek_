import type { Workspace } from '@/shared/api/types';

import { Grid, GridItem } from '@workspace/ui/components/primitives';

import { WorkspaceCardCompact } from './workspace-card-compact';

type WorkspaceGridProps = {
  workspaces: Workspace[];
  onFavorite?: (workspaceId: string) => void;
};

export const WorkspaceGrid = ({ workspaces, onFavorite }: WorkspaceGridProps) => {
  return (
    <Grid columns={12} gap="space-300">
      {workspaces.map((workspace) => (
        <GridItem
          key={workspace.id}
          span={12} // Mobile: 1 column (full width)
          spanMd={6} // Tablet: 2 columns (768px+)
          spanLg={4} // Desktop: 3 columns (1024px+)
          spanXl={3} // Large: 4 columns (1440px+)
        >
          <WorkspaceCardCompact workspace={workspace} onFavorite={onFavorite} />
        </GridItem>
      ))}
    </Grid>
  );
};
