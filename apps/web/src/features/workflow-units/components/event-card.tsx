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

const TRIGGER_ICONS: Record<EventSourceType, React.ElementType> = {
  SCHEDULE: Calendar,
  WEBHOOK: Webhook,
  OPTIN_FORM: FormInput,
  ACTIVE_TABLE: Table,
};

const TRIGGER_LABELS: Record<EventSourceType, string> = {
  SCHEDULE: 'Schedule',
  WEBHOOK: 'Webhook',
  OPTIN_FORM: 'Form',
  ACTIVE_TABLE: 'Table',
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
            <Badge variant={event.eventActive ? 'default' : 'secondary'}>
              {event.eventActive ? 'Active' : 'Inactive'}
            </Badge>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
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
                      Edit
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
                      Delete
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
            <span>{TRIGGER_LABELS[event.eventSourceType]}</span>
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
