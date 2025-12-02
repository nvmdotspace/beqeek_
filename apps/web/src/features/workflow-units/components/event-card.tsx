/**
 * EventCard Component
 *
 * Displays a workflow event card with basic info (name, trigger type, status)
 * Supports both sidebar (with selection) and list view modes
 */

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Calendar, Webhook, FormInput, Table, MoreVertical, Edit, Trash } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { WorkflowEvent, EventSourceType } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const TRIGGER_ICONS: Record<EventSourceType, React.ElementType> = {
  SCHEDULE: Calendar,
  WEBHOOK: Webhook,
  OPTIN_FORM: FormInput,
  ACTIVE_TABLE: Table,
};

const getTriggerLabel = (type: EventSourceType): string => {
  switch (type) {
    case 'SCHEDULE':
      return m.workflowEvents_trigger_schedule();
    case 'WEBHOOK':
      return m.workflowEvents_trigger_webhook();
    case 'OPTIN_FORM':
      return m.workflowEvents_trigger_form();
    case 'ACTIVE_TABLE':
      return m.workflowEvents_trigger_table();
    default:
      return type;
  }
};

interface EventCardProps {
  event: WorkflowEvent;
  isSelected?: boolean;
  onSelect?: (eventId: string) => void;
  onToggleActive?: (eventId: string, active: boolean) => void;
  onEdit?: (event: WorkflowEvent) => void;
  onDelete?: (event: WorkflowEvent) => void;
}

export function EventCard({ event, isSelected, onSelect, onToggleActive, onEdit, onDelete }: EventCardProps) {
  const Icon = TRIGGER_ICONS[event.eventSourceType];

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(event.id);
    }
  };

  const handleToggleActive = (checked: boolean) => {
    if (onToggleActive) {
      onToggleActive(event.id, checked);
    }
  };

  return (
    <Card
      className={cn(
        'hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted border-primary',
        onSelect && 'cursor-pointer',
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium">{event.eventName}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={event.eventActive ? 'success' : 'warning'}>
              {event.eventActive ? m.workflowEvents_card_active() : m.workflowEvents_card_inactive()}
            </Badge>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">{m.workflowEvents_card_openMenu()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(event);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {m.workflowEvents_card_edit()}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {m.workflowEvents_card_delete()}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{getTriggerLabel(event.eventSourceType)}</span>
          </div>
          {onToggleActive && (
            <Switch
              checked={event.eventActive}
              onCheckedChange={handleToggleActive}
              onClick={(e) => e.stopPropagation()}
              aria-label="Toggle event active status"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
