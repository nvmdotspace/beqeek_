/**
 * Connector List Loading Skeleton
 *
 * Shimmer placeholder for list view during data fetch
 * Updated to match redesigned component proportions
 */

import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

export function ConnectorListSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Skeleton className="size-8 rounded-md" />
          {/* Title and description */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          {/* Create button */}
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
      </div>

      {/* Tabs skeleton - pill style */}
      <div
        className={cn(
          'inline-flex flex-wrap items-center gap-2',
          'h-auto p-1.5',
          'bg-muted/40 rounded-lg border border-border/50',
        )}
      >
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      {/* List items skeleton with new proportions */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border border-border bg-card shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-5">
                {/* Logo - now 64px (size-16) */}
                <Skeleton className="size-16 rounded-xl flex-shrink-0" />

                {/* Content section */}
                <div className="flex-1 space-y-2.5">
                  {/* Connector name */}
                  <Skeleton className="h-6 w-64" />
                  {/* Description - 2 lines */}
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-full max-w-lg" />
                    <Skeleton className="h-4 w-3/4 max-w-md" />
                  </div>
                </div>

                {/* Right section: badge + arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
