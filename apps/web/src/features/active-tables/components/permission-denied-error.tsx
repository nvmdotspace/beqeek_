/**
 * PermissionDeniedError - Error state when user lacks permission to view record
 */

import { Lock, ArrowLeft } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Box } from '@workspace/ui/components/primitives/box';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

export function PermissionDeniedError() {
  const { locale, workspaceId, tableId } = route.useParams();
  const navigate = route.useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Box padding="space-600" className="bg-card border border-border rounded-lg max-w-md w-full text-center">
        <Stack space="space-400" align="center">
          {/* Icon */}
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="size-8 text-destructive" />
          </div>

          {/* Content */}
          <Stack space="space-200" align="center">
            <Heading level={2}>Access Denied</Heading>
            <Text className="text-muted-foreground">You don't have permission to view this record.</Text>
          </Stack>

          {/* Actions */}
          <Inline space="space-200">
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
            <Button
              onClick={() =>
                navigate({
                  to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
                  params: { locale, workspaceId, tableId },
                })
              }
            >
              Back to Table
            </Button>
          </Inline>
        </Stack>
      </Box>
    </div>
  );
}
