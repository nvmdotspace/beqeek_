/**
 * Form List Skeleton Component
 *
 * Loading skeleton for form list while data is being fetched.
 * Uses shadcn/ui Skeleton component with design tokens.
 */

import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardHeader } from '@workspace/ui/components/card';

interface FormListSkeletonProps {
  count?: number;
}

export function FormListSkeleton({ count = 3 }: FormListSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
