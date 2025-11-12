import type { ReactNode } from 'react';

import { Building2 } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Heading, Text } from '@workspace/ui/components/typography';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export type WorkspaceEmptyStateProps = {
  onCreateClick: () => void;
  createForm: ReactNode;
  showForm: boolean;
};

export const WorkspaceEmptyState = ({
  onCreateClick: _onCreateClick,
  createForm: _createForm,
  showForm: _showForm,
}: WorkspaceEmptyStateProps) => {
  return (
    <Card className="border-dashed bg-muted/40 text-muted-foreground">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="size-6" />
        </div>
        <div className="space-y-2">
          <Heading level={2}>{m.workspace_emptyState()}</Heading>
          <Text size="large" color="muted">
            {m.workspace_empty_description()}
          </Text>
        </div>
      </CardHeader>
      {/* <CardContent className="space-y-4">
        <Button onClick={onCreateClick} className="w-full" variant="secondary">
          <Sparkles className="mr-2 size-4" /> {m.workspace_empty_createNew()}
        </Button>
        {showForm ? <div className="rounded-lg border border-border/70 bg-card p-4 text-left">{createForm}</div> : null}
      </CardContent> */}
    </Card>
  );
};
