/**
 * Empty State Component
 *
 * Displays when no connectors match current filters
 */

import { Card, CardContent } from '@workspace/ui/components/card';
import { Text } from '@workspace/ui/components/typography';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  /** Message to display */
  message: string;
  /** Optional description */
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <Inbox className="size-12 text-muted-foreground mb-4" aria-hidden="true" />
        <Text size="large" className="font-medium mb-2">
          {message}
        </Text>
        {description && (
          <Text size="small" color="muted" className="max-w-md">
            {description}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
