/**
 * Active Table Settings Page (Redesigned)
 *
 * Comprehensive settings interface for Active Tables with:
 * - Tabbed navigation for 10 settings sections
 * - Unsaved changes detection
 * - Optimistic updates with rollback
 * - Full accessibility support
 *
 * Based on the implementation plan in plans/20251105-active-table-settings-rebuild-plan.md
 */

import { useState, useCallback, useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import type { TableConfig } from '@workspace/active-tables-core';

import { ROUTES } from '@/shared/route-paths';
import { useActiveTables } from '../hooks/use-active-tables';
import { useUpdateTableConfig } from '../hooks/use-update-table-config';
import type { SettingsTabId } from '../types/settings';

// Layout components
import { SettingsLayout } from '../components/settings/settings-layout';
import { SettingsHeader } from '../components/settings/settings-header';
import { SettingsTabs, SettingsTabContent } from '../components/settings/settings-tabs';
import { SettingsFooter } from '../components/settings/settings-footer';
import { UnsavedChangesDialog } from '../components/settings/unsaved-changes-dialog';

// Section components
import { GeneralSettingsSection } from '../components/settings/general/general-settings-section';
import { FieldsSettingsSection } from '../components/settings/fields/fields-settings-section';
import { ActionsSettingsSection, type Action } from '../components/settings/actions/actions-settings-section';
import {
  ListViewSettingsSection,
  type RecordListConfig,
} from '../components/settings/views/list-view-settings-section';
import {
  DetailViewSettingsSection,
  type RecordDetailConfig,
} from '../components/settings/views/detail-view-settings-section';
import { QuickFiltersSection, type QuickFilter } from '../components/settings/filters/quick-filters-section';
import { KanbanSettingsSection } from '../components/settings/kanban/kanban-settings-section';
import { GanttSettingsSection, type GanttConfig } from '../components/settings/gantt/gantt-settings-section';
import { PermissionsSettingsSection } from '../components/settings/permissions/permissions-settings-section';
import { DangerZoneSection } from '../components/settings/danger-zone/danger-zone-section';

// Type-safe route API
const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_SETTINGS);

/**
 * Active Table Settings Page (Redesigned)
 *
 * Phase 1 & 2 Implementation:
 * - Main layout with header, tabs, footer
 * - General settings section
 * - Fields settings section
 * - Unsaved changes detection
 * - Integration with useUpdateTableConfig hook
 */
export const ActiveTableSettingsPageV2 = () => {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

  // Fetch table data
  const { data: tablesResp, isLoading } = useActiveTables(workspaceId);
  const table = tablesResp?.data.find((item) => item.id === tableId);
  const error = table ? null : new Error('Table not found');

  // Local config state for form management
  const [localConfig, setLocalConfig] = useState<TableConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<TableConfig | null>(null);

  // Unsaved changes dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Initialize config when table loads
  useEffect(() => {
    if (table?.config) {
      setLocalConfig(table.config);
      setOriginalConfig(table.config);
    }
  }, [table]);

  // Check if there are unsaved changes
  const isDirty =
    localConfig && originalConfig ? JSON.stringify(localConfig) !== JSON.stringify(originalConfig) : false;

  // Update table config mutation
  const updateConfig = useUpdateTableConfig(workspaceId, tableId, table || null, {
    onSuccess: () => {
      toast.success('Settings saved', {
        description: 'Your table configuration has been updated successfully.',
      });
      // Update original config to match saved state
      if (localConfig) {
        setOriginalConfig(localConfig);
      }
    },
    onError: (err) => {
      toast.error('Save failed', {
        description: err.message || 'Failed to save table configuration. Please try again.',
      });
    },
  });

  // Handle config changes from sections
  const handleConfigChange = useCallback((updates: Partial<TableConfig>) => {
    setLocalConfig((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Clean config before saving - remove incomplete configurations
  const cleanConfigForSave = useCallback((config: TableConfig): TableConfig => {
    const cleaned = { ...config };

    // Remove recordListConfig if it's incomplete
    if (cleaned.recordListConfig) {
      const listConfig = cleaned.recordListConfig as any;

      // For head-column layout, remove if titleField is empty
      if (listConfig.layout === 'head-column' && !listConfig.titleField) {
        cleaned.recordListConfig = undefined;
      }

      // For generic-table layout, remove if displayFields is empty
      if (
        listConfig.layout === 'generic-table' &&
        (!listConfig.displayFields || listConfig.displayFields.length === 0)
      ) {
        cleaned.recordListConfig = undefined;
      }
    }

    // Remove recordDetailConfig if headTitleField is empty
    // headTitleField is optional, so we only remove if the entire config is essentially empty
    if (cleaned.recordDetailConfig) {
      const detailConfig = cleaned.recordDetailConfig as any;

      // Check if config is essentially empty (no meaningful fields selected)
      const hasContent =
        detailConfig.headTitleField ||
        (detailConfig.headSubLineFields && detailConfig.headSubLineFields.length > 0) ||
        (detailConfig.rowTailFields && detailConfig.rowTailFields.length > 0) ||
        (detailConfig.column1Fields && detailConfig.column1Fields.length > 0) ||
        (detailConfig.column2Fields && detailConfig.column2Fields.length > 0);

      if (!hasContent) {
        cleaned.recordDetailConfig = undefined;
      }
    }

    return cleaned;
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    if (!localConfig) return;

    // Clean config before saving
    const cleanedConfig = cleanConfigForSave(localConfig);

    updateConfig.mutate({
      config: cleanedConfig,
      metadata: {
        name: localConfig.title,
      },
    });
  }, [localConfig, cleanConfigForSave, updateConfig]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
      setPendingNavigation(() => () => {
        setLocalConfig(originalConfig);
        setShowUnsavedDialog(false);
      });
    } else {
      navigate({
        to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
        params: { locale, workspaceId, tableId },
      });
    }
  }, [isDirty, originalConfig, navigate, locale, workspaceId, tableId]);

  // Handle unsaved changes dialog
  const handleUnsavedConfirm = useCallback(() => {
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleUnsavedCancel = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !table || !localConfig) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load table</CardTitle>
            <CardDescription>
              {error?.message || 'Table not found or you do not have permission to access it.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                navigate({
                  to: ROUTES.ACTIVE_TABLES.LIST,
                  params: { locale, workspaceId },
                });
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tables
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields = localConfig.fields || [];

  return (
    <div className="flex h-full flex-col">
      <div className="container mx-auto w-full max-w-7xl flex-1 overflow-hidden p-6">
        <SettingsLayout
          header={<SettingsHeader tableName={localConfig.title || table.name} isDirty={isDirty} />}
          tabs={
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab}>
              {/* General Settings */}
              <SettingsTabContent value="general">
                <GeneralSettingsSection
                  tableId={tableId}
                  config={localConfig}
                  onChange={handleConfigChange}
                  fields={fields.map((f) => ({
                    name: f.name,
                    label: f.label,
                    type: f.type,
                  }))}
                />
              </SettingsTabContent>

              {/* Fields Settings */}
              <SettingsTabContent value="fields">
                <FieldsSettingsSection
                  fields={fields}
                  onChange={(newFields) => handleConfigChange({ fields: newFields })}
                />
              </SettingsTabContent>

              {/* Actions Settings */}
              <SettingsTabContent value="actions">
                <ActionsSettingsSection
                  actions={(localConfig.actions as Action[]) || []}
                  onChange={(newActions) => handleConfigChange({ actions: newActions })}
                />
              </SettingsTabContent>

              {/* List View Settings */}
              <SettingsTabContent value="list-view">
                <ListViewSettingsSection
                  config={
                    (localConfig.recordListConfig as RecordListConfig) || { layout: 'generic-table', displayFields: [] }
                  }
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfig) => handleConfigChange({ recordListConfig: newConfig as any })}
                />
              </SettingsTabContent>

              {/* Quick Filters */}
              <SettingsTabContent value="quick-filters">
                <QuickFiltersSection
                  quickFilters={(localConfig.quickFilters as QuickFilter[]) || []}
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newFilters) => handleConfigChange({ quickFilters: newFilters as any })}
                />
              </SettingsTabContent>

              {/* Detail View Settings */}
              <SettingsTabContent value="detail-view">
                <DetailViewSettingsSection
                  config={
                    (localConfig.recordDetailConfig as RecordDetailConfig) || {
                      layout: 'head-detail',
                      commentsPosition: 'right-panel',
                      headTitleField: '',
                      headSubLineFields: [],
                      rowTailFields: [],
                    }
                  }
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfig) => handleConfigChange({ recordDetailConfig: newConfig as any })}
                />
              </SettingsTabContent>

              {/* Kanban Settings */}
              <SettingsTabContent value="kanban">
                <KanbanSettingsSection
                  kanbanConfigs={localConfig.kanbanConfigs || []}
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfigs) => handleConfigChange({ kanbanConfigs: newConfigs })}
                />
              </SettingsTabContent>

              {/* Gantt Settings */}
              <SettingsTabContent value="gantt">
                <GanttSettingsSection
                  ganttConfigs={(localConfig.ganttCharts as GanttConfig[]) || []}
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfigs) => handleConfigChange({ ganttCharts: newConfigs as any })}
                />
              </SettingsTabContent>

              {/* Permissions */}
              <SettingsTabContent value="permissions">
                <PermissionsSettingsSection
                  permissionsConfig={localConfig.permissionsConfig || []}
                  actions={(localConfig.actions as Action[]) || []}
                  workspaceId={workspaceId}
                  onChange={(newPermissions) => handleConfigChange({ permissionsConfig: newPermissions })}
                />
              </SettingsTabContent>

              {/* Danger Zone */}
              <SettingsTabContent value="danger-zone">
                <DangerZoneSection
                  tableName={localConfig.title || table.name}
                  onDelete={() => {
                    // TODO: Implement table deletion API call
                    console.log('Delete table:', tableId);
                  }}
                  isDeleting={false}
                />
              </SettingsTabContent>
            </SettingsTabs>
          }
          footer={
            <SettingsFooter
              isDirty={isDirty}
              isSaving={updateConfig.isPending}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          }
        >
          {/* Empty children - content is rendered in tabs */}
        </SettingsLayout>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleUnsavedConfirm}
        onCancel={handleUnsavedCancel}
      />
    </div>
  );
};
