/**
 * Route Pending Component
 *
 * Displayed while a route is loading (code splitting, data fetching)
 * Provides a smooth loading experience with skeleton UI
 */

import { Skeleton } from '@workspace/ui/components/skeleton';

export const RoutePending = () => {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Card skeletons */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
