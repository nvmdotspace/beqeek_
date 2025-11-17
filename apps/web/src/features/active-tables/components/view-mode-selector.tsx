/**
 * View Mode Selector Component
 *
 * Allows switching between List, Kanban, and Gantt views
 */

import { List, KanbanSquare, GanttChart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Inline } from '@workspace/ui/components/primitives';
import type { Table } from '@workspace/active-tables-core';

export type ViewMode = 'list' | 'kanban' | 'gantt';

export interface ViewModeSelectorProps {
  table: Table;
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * ViewModeSelector Component
 *
 * Tab-based selector for switching between different view modes
 */
export function ViewModeSelector({ table, currentMode, onModeChange, className = '' }: ViewModeSelectorProps) {
  const hasKanbanConfigs = (table.config?.kanbanConfigs?.length || 0) > 0;
  const hasGanttConfigs = (table.config?.ganttCharts?.length || 0) > 0;

  return (
    <Tabs value={currentMode} onValueChange={(v) => onModeChange(v as ViewMode)} className={className}>
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="list" className="flex-1 sm:flex-initial text-xs sm:text-sm">
          <Inline align="center" className="sm:gap-2">
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">List</span>
          </Inline>
        </TabsTrigger>

        {hasKanbanConfigs && (
          <TabsTrigger value="kanban" className="flex-1 sm:flex-initial text-xs sm:text-sm">
            <Inline align="center" className="sm:gap-2">
              <KanbanSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Inline>
          </TabsTrigger>
        )}

        {hasGanttConfigs && (
          <TabsTrigger value="gantt" className="flex-1 sm:flex-initial text-xs sm:text-sm">
            <Inline align="center" className="sm:gap-2">
              <GanttChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Gantt</span>
            </Inline>
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  );
}
