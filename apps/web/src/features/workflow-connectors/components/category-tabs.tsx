/**
 * Category Tabs Component
 *
 * Dynamic tabs for filtering connectors by type with counts
 * Redesigned with modern pill-style and smooth transitions
 */

import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import type { ConnectorInstance } from '@workspace/beqeek-shared/workflow-connectors';
import { CONNECTOR_TYPES } from '@workspace/beqeek-shared/workflow-connectors';
import { cn } from '@workspace/ui/lib/utils';

interface CategoryTabsProps {
  /** All connectors for count calculation */
  connectors: ConnectorInstance[];
  /** Currently active category */
  activeCategory: string;
  /** Callback when category changes */
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ connectors, activeCategory, onCategoryChange }: CategoryTabsProps) {
  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: connectors.length,
    };

    CONNECTOR_TYPES.forEach((type) => {
      counts[type.type] = connectors.filter((c) => c.connectorType === type.type).length;
    });

    return counts;
  }, [connectors]);

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange}>
      <TabsList
        className={cn(
          'inline-flex flex-wrap items-center gap-2',
          'h-auto p-1.5',
          'bg-muted/40 rounded-lg border border-border/50',
        )}
      >
        {/* All tab */}
        <TabsTrigger
          value="ALL"
          className={cn(
            // Base styles
            'relative px-4 py-2 rounded-full',
            'text-sm font-medium',
            'transition-all duration-200',
            // Inactive state
            'text-muted-foreground bg-transparent',
            'hover:text-foreground hover:bg-background/50',
            // Active state
            'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
            'data-[state=active]:shadow-sm',
            // Focus state
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          )}
        >
          <span className="flex items-center gap-2">
            Tất cả
            <span
              className={cn(
                'inline-flex items-center justify-center',
                'min-w-[1.5rem] h-5 px-1.5 rounded-full',
                'text-xs font-semibold',
                'transition-colors duration-200',
                activeCategory === 'ALL'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {categoryCounts.ALL}
            </span>
          </span>
        </TabsTrigger>

        {/* Dynamic tabs for each connector type */}
        {CONNECTOR_TYPES.map((type) => {
          const count = categoryCounts[type.type] || 0;
          const isActive = activeCategory === type.type;

          return (
            <TabsTrigger
              key={type.type}
              value={type.type}
              className={cn(
                // Base styles
                'relative px-4 py-2 rounded-full',
                'text-sm font-medium',
                'transition-all duration-200',
                // Inactive state
                'text-muted-foreground bg-transparent',
                'hover:text-foreground hover:bg-background/50',
                // Active state
                'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                'data-[state=active]:shadow-sm',
                // Focus state
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                // Disabled if no items
                count === 0 && 'opacity-50 cursor-not-allowed',
              )}
              disabled={count === 0}
            >
              <span className="flex items-center gap-2">
                {type.name}
                <span
                  className={cn(
                    'inline-flex items-center justify-center',
                    'min-w-[1.5rem] h-5 px-1.5 rounded-full',
                    'text-xs font-semibold',
                    'transition-colors duration-200',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
