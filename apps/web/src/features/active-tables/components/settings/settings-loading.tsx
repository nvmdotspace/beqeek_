/**
 * Settings Page Loading State
 *
 * Skeleton UI specifically designed for the settings page layout
 * Matches the actual page structure to prevent layout shift
 */

import { Skeleton } from '@workspace/ui/components/skeleton';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';

export function SettingsLoading() {
  return (
    <Box padding="space-300" className="container mx-auto max-w-7xl">
      <Stack space="space-300">
        {/* Header skeleton */}
        <Inline justify="between" align="center">
          <Inline space="space-100" align="center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Stack space="space-050">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </Stack>
          </Inline>
          <Inline space="space-050">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </Inline>
        </Inline>

        {/* Tabs skeleton */}
        <div className="border-b">
          <Inline space="space-100">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </Inline>
        </div>

        {/* Content skeleton */}
        <Stack space="space-300">
          {/* Section 1 */}
          <Stack space="space-100">
            <Skeleton className="h-6 w-48" />
            <Grid columns={1} gap="space-100" className="md:grid-cols-2">
              <Stack space="space-050">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </Stack>
              <Stack space="space-050">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </Stack>
            </Grid>
          </Stack>

          {/* Section 2 */}
          <Stack space="space-100">
            <Skeleton className="h-6 w-48" />
            <Stack space="space-075">
              {[1, 2, 3].map((i) => (
                <Box key={i} padding="space-100" border="default" borderRadius="lg">
                  <Inline space="space-100" align="center">
                    <Skeleton className="h-12 w-12" />
                    <Stack space="space-050" className="flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </Stack>
                    <Skeleton className="h-8 w-20" />
                  </Inline>
                </Box>
              ))}
            </Stack>
          </Stack>

          {/* Section 3 */}
          <Box padding="space-300" border="default" borderRadius="lg">
            <Stack space="space-100">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
