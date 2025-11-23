/**
 * EventListEmpty Component
 *
 * Empty state displayed when a workflow unit has no events.
 * Provides call-to-action to create the first event.
 */

import { FileQuestion } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface EventListEmptyProps {
  onCreateEvent: () => void;
}

export function EventListEmpty({ onCreateEvent }: EventListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="font-semibold text-lg mb-2">No events yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Create your first workflow event to automate tasks and processes.
      </p>
      <Button onClick={onCreateEvent}>Create Event</Button>
    </div>
  );
}
