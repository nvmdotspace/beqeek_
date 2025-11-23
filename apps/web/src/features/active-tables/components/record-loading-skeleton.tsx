/**
 * RecordLoadingSkeleton - Loading state for record detail page
 */

import { Stack } from '@workspace/ui/components/primitives/stack';
import { Box } from '@workspace/ui/components/primitives/box';
import { Skeleton } from '@workspace/ui/components/skeleton';

export function RecordLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <Box className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" /> {/* Back button */}
            <Skeleton className="h-8 w-64" /> {/* Title */}
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-9 w-20" /> {/* Action button */}
              <Skeleton className="h-9 w-9" /> {/* Menu button */}
            </div>
          </div>
        </div>
      </Box>

      {/* Content Skeleton */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Stack space="space-600">
          {/* Title Section */}
          <Box padding="space-300" className="bg-card border border-border rounded-lg">
            <Stack space="space-200">
              <Skeleton className="h-9 w-3/4" /> {/* Title */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" /> {/* Badge */}
                <Skeleton className="h-6 w-24" /> {/* Badge */}
              </div>
            </Stack>
          </Box>

          {/* Fields Skeleton */}
          <Stack space="space-300">
            {[...Array(6)].map((_, i) => (
              <Box key={i} padding="space-200" className="bg-card border border-border rounded-md">
                <Stack space="space-100">
                  <Skeleton className="h-4 w-24" /> {/* Label */}
                  <Skeleton className="h-5 w-full max-w-md" /> {/* Value */}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Comments Skeleton */}
          <Box padding="space-300" className="bg-card border border-border rounded-lg">
            <Stack space="space-200">
              <Skeleton className="h-6 w-32" /> {/* Heading */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full" /> {/* Avatar */}
                  <Stack space="space-100" className="flex-1">
                    <Skeleton className="h-4 w-32" /> {/* Name */}
                    <Skeleton className="h-16 w-full" /> {/* Comment */}
                  </Stack>
                </div>
              ))}
            </Stack>
          </Box>
        </Stack>
      </main>
    </div>
  );
}
