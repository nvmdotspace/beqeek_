/**
 * Settings Tabs Component
 *
 * Provides tab navigation for different settings sections with responsive design.
 */

import { type ReactNode } from 'react';
import {
  Settings,
  TableProperties,
  Zap,
  LayoutList,
  Filter,
  FileText,
  Columns,
  GanttChart,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import type { SettingsTabId } from '../../types/settings';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

/**
 * Get tab configuration with translations
 */
const getTabConfig = (): Array<{
  id: SettingsTabId;
  label: string;
  icon: ReactNode;
}> => [
  {
    id: 'general',
    label: m.settings_tabs_general(),
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 'fields',
    label: m.settings_tabs_fields(),
    icon: <TableProperties className="h-4 w-4" />,
  },
  {
    id: 'actions',
    label: m.settings_tabs_actions(),
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'list-view',
    label: m.settings_tabs_listView(),
    icon: <LayoutList className="h-4 w-4" />,
  },
  {
    id: 'quick-filters',
    label: m.settings_tabs_quickFilters(),
    icon: <Filter className="h-4 w-4" />,
  },
  {
    id: 'detail-view',
    label: m.settings_tabs_detailView(),
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'kanban',
    label: m.settings_tabs_kanban(),
    icon: <Columns className="h-4 w-4" />,
  },
  {
    id: 'gantt',
    label: m.settings_tabs_gantt(),
    icon: <GanttChart className="h-4 w-4" />,
  },
  {
    id: 'permissions',
    label: m.settings_tabs_permissions(),
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: 'danger-zone',
    label: m.settings_tabs_dangerZone(),
    icon: <AlertTriangle className="h-4 w-4" />,
  },
];

export interface SettingsTabsProps {
  /** Current active tab */
  activeTab: SettingsTabId;

  /** Callback when tab changes */
  onTabChange: (tab: SettingsTabId) => void;

  /** Tab contents as children */
  children: ReactNode;
}

/**
 * Settings Tabs
 *
 * Responsive tab navigation that switches between horizontal tabs (desktop)
 * and vertical scrollable list (mobile).
 */
export function SettingsTabs({ activeTab, onTabChange, children }: SettingsTabsProps) {
  const tabConfig = getTabConfig();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as SettingsTabId)}
      className="flex min-h-0 flex-1 flex-col"
    >
      {/* Tab List - Horizontal scrollable on mobile, wrapped on desktop */}
      <div className="shrink-0 border-b">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto justify-start gap-0 bg-transparent p-0 lg:flex-wrap">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="inline-flex shrink-0 items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="lg:hidden" />
        </ScrollArea>
      </div>

      {/* Tab Contents - Scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </div>
    </Tabs>
  );
}

/**
 * Settings Tab Content
 *
 * Wrapper for individual tab content sections.
 */
export interface SettingsTabContentProps {
  /** Tab ID */
  value: SettingsTabId;

  /** Tab content */
  children: ReactNode;
}

export function SettingsTabContent({ value, children }: SettingsTabContentProps) {
  return (
    <TabsContent value={value} className="m-0 p-0">
      {children}
    </TabsContent>
  );
}
