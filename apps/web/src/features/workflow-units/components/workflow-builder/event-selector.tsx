/**
 * EventSelector Component
 *
 * Dropdown selector for workflow events in the canvas header.
 * Replaces the EventListSidebar for a maximized canvas layout (n8n-style).
 */

import { useState } from 'react';
import { useNavigate, getRouteApi } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { ChevronDown, Plus, Calendar, Webhook, FileText, Table2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useWorkflowEvents } from '../../hooks/use-workflow-events';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { EditEventDialog } from '../dialogs/edit-event-dialog';
import { DeleteEventDialog } from '../dialogs/delete-event-dialog';
import type { WorkflowEvent, EventSourceType } from '../../api/types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit');

const sourceTypeIcons: Record<EventSourceType, typeof Calendar> = {
  SCHEDULE: Calendar,
  WEBHOOK: Webhook,
  OPTIN_FORM: FileText,
  ACTIVE_TABLE: Table2,
};

interface EventSelectorProps {
  workspaceId: string;
  unitId: string;
  onCreateEvent: () => void;
}

export function EventSelector({ workspaceId, unitId, onCreateEvent }: EventSelectorProps) {
  const navigate = useNavigate();
  const { locale } = route.useParams();
  const { data: events, isLoading } = useWorkflowEvents(workspaceId, unitId);
  const { currentEvent, currentEventId } = useWorkflowEditorStore();

  const [editingEvent, setEditingEvent] = useState<WorkflowEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<WorkflowEvent | null>(null);

  const handleSelectEvent = (eventId: string) => {
    if (eventId === currentEventId) return;
    navigate({
      to: '/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit',
      params: { locale, workspaceId, unitId, eventId },
    });
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-48" aria-label="Loading events" />;
  }

  const Icon = currentEvent ? sourceTypeIcons[currentEvent.eventSourceType] : Calendar;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 min-w-48 justify-between"
            aria-label={`Select event. Currently: ${currentEvent?.eventName || 'None selected'}. ${events?.length || 0} events available.`}
          >
            <span className="flex items-center gap-2 truncate">
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{currentEvent?.eventName || 'Select Event'}</span>
            </span>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs" aria-hidden="true">
                {events?.length || 0}
              </Badge>
              <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {/* Event List */}
          {events && events.length > 0 ? (
            <>
              {events.map((event) => {
                const EventIcon = sourceTypeIcons[event.eventSourceType];
                const isSelected = event.id === currentEventId;

                return (
                  <DropdownMenuItem
                    key={event.id}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSelectEvent(event.id);
                    }}
                  >
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      <EventIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className={`truncate ${isSelected ? 'font-medium' : ''}`}>{event.eventName}</span>
                      {!event.eventActive && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Inactive
                        </Badge>
                      )}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                          <MoreHorizontal className="h-3 w-3" aria-hidden="true" />
                          <span className="sr-only">Event actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setEditingEvent(event);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setDeletingEvent(event);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </>
          ) : (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">No events yet</div>
          )}

          {/* Create Event Button */}
          <DropdownMenuItem onSelect={onCreateEvent} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
}
