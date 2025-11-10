/**
 * View Config Selector Component
 *
 * Allows switching between multiple Kanban or Gantt configurations
 * Uses tabs for ≤4 configs, dropdown for 5+ configs
 */

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import type { KanbanConfig, GanttConfig } from '@workspace/active-tables-core';

export type ViewConfigType = 'kanban' | 'gantt';

export interface ViewConfigSelectorProps {
  type: ViewConfigType;
  configs: KanbanConfig[] | GanttConfig[];
  currentConfigId: string;
  onConfigChange: (configId: string) => void;
  className?: string;
}

/**
 * Check if config is Kanban type
 */
function isKanbanConfig(config: KanbanConfig | GanttConfig): config is KanbanConfig {
  return 'kanbanScreenId' in config;
}

/**
 * Get config ID based on type
 */
function getConfigId(config: KanbanConfig | GanttConfig): string {
  if (isKanbanConfig(config)) {
    return config.kanbanScreenId;
  }
  return config.ganttScreenId;
}

/**
 * Get config name based on type
 */
function getConfigName(config: KanbanConfig | GanttConfig): string {
  return config.screenName || 'Untitled View';
}

/**
 * ViewConfigSelector Component
 *
 * Switches between multiple view configurations
 */
export function ViewConfigSelector({
  type,
  configs,
  currentConfigId,
  onConfigChange,
  className = '',
}: ViewConfigSelectorProps) {
  // Don't render if only 0 or 1 config
  if (configs.length <= 1) {
    return null;
  }

  const useTabsLayout = configs.length <= 4;

  // Tabs layout for ≤4 configs
  if (useTabsLayout) {
    return (
      <div className={className}>
        <Tabs value={currentConfigId} onValueChange={onConfigChange}>
          <TabsList className="w-full sm:w-auto">
            {configs.map((config) => {
              const id = getConfigId(config);
              const name = getConfigName(config);

              return (
                <TabsTrigger key={id} value={id} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <span className="truncate max-w-[120px]">{name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    );
  }

  // Dropdown layout for 5+ configs
  return (
    <div className={className}>
      <Select value={currentConfigId} onValueChange={onConfigChange}>
        <SelectTrigger className="w-full sm:w-[240px] text-xs sm:text-sm">
          <SelectValue placeholder={`Select ${type} view`} />
        </SelectTrigger>
        <SelectContent>
          {configs.map((config) => {
            const id = getConfigId(config);
            const name = getConfigName(config);
            const description = config.screenDescription;

            return (
              <SelectItem key={id} value={id}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{name}</span>
                  {description && <span className="text-[10px] text-muted-foreground line-clamp-1">{description}</span>}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
