import { memo, useMemo } from 'react';
import { Boxes, Calendar, MoreVertical, Edit, Trash2, Play, Settings } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Text, Heading } from '@workspace/ui/components/typography';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { cn } from '@workspace/ui/lib/utils';
import type { WorkflowUnit } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface WorkflowUnitCardProps {
  unit: WorkflowUnit;
  workspaceId: string;
  locale: string;
  onEdit: (unit: WorkflowUnit) => void;
  onDelete: (unit: WorkflowUnit) => void;
}

export const WorkflowUnitCard = memo(({ unit, workspaceId, locale, onEdit, onDelete }: WorkflowUnitCardProps) => {
  const navigate = useNavigate();

  const updatedAtLabel = useMemo(() => {
    if (!unit.updatedAt || Number.isNaN(Date.parse(unit.updatedAt))) return null;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(unit.updatedAt));
  }, [unit.updatedAt, locale]);

  const handleCardClick = () => {
    navigate({
      to: ROUTES.WORKFLOW_UNITS.DETAIL,
      params: { locale, workspaceId, unitId: unit.id },
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(unit);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(unit);
  };

  const handleManageEvents = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: ROUTES.WORKFLOW_UNITS.DETAIL,
      params: { locale, workspaceId, unitId: unit.id },
    });
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'border-border/60 shadow-sm',
        'transition-all duration-200',
        'hover:shadow-md hover:border-border',
        'cursor-pointer',
      )}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box padding="space-100" className="sm:p-5">
          <Inline align="start" justify="between" className="gap-2.5 sm:gap-3">
            <Inline space="space-075" align="start" className="flex-1 min-w-0 sm:gap-3">
              {/* Unit Icon */}
              <div
                className={cn(
                  'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg',
                  'bg-accent-blue-subtle',
                )}
              >
                <Boxes className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5', 'text-accent-blue')} />
              </div>

              <div className="flex-1 min-w-0">
                <Stack space="space-050">
                  {/* Title */}
                  <Heading level={4} className="text-base leading-tight line-clamp-2 break-words">
                    {unit.name}
                  </Heading>

                  {/* Badges row */}
                  <Inline space="space-037" wrap align="center">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] capitalize font-medium whitespace-nowrap',
                        'border-accent-blue/30 text-accent-blue',
                      )}
                    >
                      {m.workflowUnits_card_badge()}
                    </Badge>
                  </Inline>
                </Stack>
              </div>
            </Inline>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">{m.workflowUnits_card_openMenu()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleManageEvents}>
                  <Settings className="mr-2 h-4 w-4" />
                  {m.workflowUnits_card_manageEvents()}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  {m.workflowUnits_card_edit()}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {m.workflowUnits_card_delete()}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Inline>

          <Stack space="space-075" className="mt-3">
            {/* Description */}
            {unit.description && (
              <Text size="small" color="muted" className="line-clamp-2 break-words">
                {unit.description}
              </Text>
            )}

            {/* Metadata */}
            <Inline space="space-050" wrap align="center" className="text-xs text-muted-foreground">
              {updatedAtLabel && (
                <>
                  <Calendar className="h-3 w-3" />
                  <Text size="small" color="muted" className="text-xs">
                    {updatedAtLabel}
                  </Text>
                </>
              )}
            </Inline>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
});

WorkflowUnitCard.displayName = 'WorkflowUnitCard';
