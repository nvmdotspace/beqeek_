/**
 * Connector Card Loading Skeleton
 *
 * Shimmer placeholder for connector type cards in select view
 */

import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';

export function ConnectorCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        {/* Logo skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-16 w-16 rounded-lg" />
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-6 w-32 mx-auto" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}
