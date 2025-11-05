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

/**
 * Tab configuration
 */
const TAB_CONFIG: Array<{
  id: SettingsTabId;
  label: string;
  icon: ReactNode;
}> = [
  {
    id: 'general',
    label: 'General',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 'fields',
    label: 'Fields',
    icon: <TableProperties className="h-4 w-4" />,
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'list-view',
    label: 'List View',
    icon: <LayoutList className="h-4 w-4" />,
  },
  {
    id: 'quick-filters',
    label: 'Filters',
    icon: <Filter className="h-4 w-4" />,
  },
  {
    id: 'detail-view',
    label: 'Detail View',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'kanban',
    label: 'Kanban',
    icon: <Columns className="h-4 w-4" />,
  },
  {
    id: 'gantt',
    label: 'Gantt',
    icon: <GanttChart className="h-4 w-4" />,
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: 'danger-zone',
    label: 'Danger Zone',
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
            {TAB_CONFIG.map((tab) => (
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
