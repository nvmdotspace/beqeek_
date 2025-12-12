/**
 * EventListSidebar Component
 *
 * Left sidebar displaying all workflow events for a unit.
 * Provides event selection, status toggle, and creation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, getRouteApi } from '@tanstack/react-router';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Plus, AlertCircle } from 'lucide-react';
import { useWorkflowEvents } from '../hooks/use-workflow-events';
import { useToggleEventActive } from '../hooks/use-toggle-event-active';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { EventCard } from './event-card';
import { EventListEmpty } from './event-list-empty';
import { EditEventDialog } from './dialogs/edit-event-dialog';
import { DeleteEventDialog } from './dialogs/delete-event-dialog';
import type { WorkflowEvent } from '../api/types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit');

interface EventListSidebarProps {
  workspaceId: string;
  unitId: string;
  onCreateEvent: () => void;
}

export function EventListSidebar({ workspaceId, unitId, onCreateEvent }: EventListSidebarProps) {
  const navigate = useNavigate();
  const { locale } = route.useParams();
  const { data: events, isLoading, error } = useWorkflowEvents(workspaceId, unitId);
  const { currentEventId } = useWorkflowEditorStore();
  const toggleEventActive = useToggleEventActive();

  const [editingEvent, setEditingEvent] = useState<WorkflowEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<WorkflowEvent | null>(null);

  const handleSelectEvent = useCallback(
    (eventId: string) => {
      navigate({
        to: '/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit',
        params: { locale, workspaceId, unitId, eventId },
      });
    },
    [navigate, locale, workspaceId, unitId],
  );

  const handleToggleActive = (eventId: string, active: boolean) => {
    toggleEventActive.mutate({
      workspaceId,
      eventId,
      active,
    });
  };

  const handleEdit = (event: WorkflowEvent) => {
    setEditingEvent(event);
  };

  const handleDelete = (event: WorkflowEvent) => {
    setDeletingEvent(event);
  };

  // Keyboard navigation: ↑↓ arrows to navigate events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!events || events.length === 0) return;

      const currentIndex = events.findIndex((event) => event.id === currentEventId);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < events.length - 1 ? currentIndex + 1 : currentIndex;
        if (nextIndex !== -1 && events[nextIndex]) {
          handleSelectEvent(events[nextIndex].id);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        if (events[prevIndex]) {
          handleSelectEvent(events[prevIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [events, currentEventId, handleSelectEvent]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-80 border-r bg-background p-4 space-y-3 flex-shrink-0">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-80 border-r bg-background p-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm">Failed to load events</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Events</h2>
          <Badge variant="secondary" aria-label={`${events?.length || 0} events`}>
            {events?.length || 0}
          </Badge>
        </div>
        <Button onClick={onCreateEvent} className="w-full">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Event
        </Button>
      </div>

      <Separator />

      {/* Event List */}
      {events && events.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2" role="list" aria-label="Workflow events">
            {events.map((event) => (
              <div key={event.id} role="listitem">
                <EventCard
                  event={event}
                  isSelected={event.id === currentEventId}
                  onSelect={handleSelectEvent}
                  onToggleActive={handleToggleActive}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <EventListEmpty onCreateEvent={onCreateEvent} />
      )}

      {/* Edit Event Dialog */}
      {editingEvent && (
        <EditEventDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          workspaceId={workspaceId}
          event={editingEvent}
        />
      )}

      {/* Delete Event Dialog */}
      {deletingEvent && (
        <DeleteEventDialog
          open={!!deletingEvent}
          onOpenChange={(open) => !open && setDeletingEvent(null)}
          workspaceId={workspaceId}
          event={deletingEvent}
        />
      )}
    </div>
  );
}
