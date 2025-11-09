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

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import type { TableConfig } from '@workspace/active-tables-core';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

import { ROUTES } from '@/shared/route-paths';
import { useActiveTables } from '../hooks/use-active-tables';
import { useUpdateTableConfig } from '../hooks/use-update-table-config';
import type { SettingsTabId } from '../types/settings';
import { validateTableConfig } from '../utils/settings-validation';
import { ErrorCard } from '@/components/error-display';
import {
  RECORD_LIST_LAYOUT_GENERIC_TABLE,
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  COMMENTS_POSITION_RIGHT_PANEL,
} from '@workspace/beqeek-shared/constants/layouts';

// Layout components
import { SettingsLayout } from '../components/settings/settings-layout';
import { SettingsHeader } from '../components/settings/settings-header';
import { SettingsTabs, SettingsTabContent } from '../components/settings/settings-tabs';
import { SettingsFooter } from '../components/settings/settings-footer';
import { UnsavedChangesDialog } from '../components/settings/unsaved-changes-dialog';
import { SettingsLoading } from '../components/settings/settings-loading';

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
      toast.success(m.settings_save_success(), {
        description: m.settings_save_successDescription(),
      });
      // Update original config to match saved state
      if (localConfig) {
        setOriginalConfig(localConfig);
      }
    },
    onError: (err) => {
      toast.error(m.settings_save_error(), {
        description: err.message || 'Failed to save table configuration',
      });
    },
  });

  // Handle config changes from sections
  const handleConfigChange = useCallback((updates: Partial<TableConfig>) => {
    setLocalConfig((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Validate config
  const validationErrors = useMemo(() => (localConfig ? validateTableConfig(localConfig) : []), [localConfig]);

  // Save changes
  const handleSave = useCallback(() => {
    if (!localConfig) return;

    // Validate before saving
    const errors = validateTableConfig(localConfig);
    if (errors.length > 0) {
      toast.error('Validation failed', {
        description: 'Please fix the errors before saving.',
      });
      return;
    }

    updateConfig.mutate({
      config: localConfig,
      metadata: {
        name: localConfig.title,
      },
    });
  }, [localConfig, updateConfig]);

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

  // Loading state - also show loading if table exists but localConfig not initialized yet
  if (isLoading || (table && !localConfig)) {
    return <SettingsLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <ErrorCard
          error={error}
          onRetry={() => window.location.reload()}
          onBack={() => {
            navigate({
              to: ROUTES.ACTIVE_TABLES.LIST,
              params: { locale, workspaceId },
            });
          }}
          showDetails={import.meta.env.DEV}
        />
      </div>
    );
  }

  // Not found state (no error but no table/config)
  if (!table || !localConfig) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Table Not Found</CardTitle>
            <CardDescription>
              The table you are looking for does not exist or you do not have permission to access it.
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
                  config={localConfig}
                  onChange={(newFields) => handleConfigChange({ fields: newFields })}
                  onConfigChange={(cleanedConfig) => setLocalConfig(cleanedConfig)}
                  workspaceId={workspaceId}
                  currentTableId={tableId}
                />
              </SettingsTabContent>

              {/* Actions Settings */}
              <SettingsTabContent value="actions">
                <ActionsSettingsSection
                  actions={(localConfig.actions as unknown as Action[]) || []}
                  onChange={(newActions) =>
                    handleConfigChange({ actions: newActions as unknown as typeof localConfig.actions })
                  }
                />
              </SettingsTabContent>

              {/* List View Settings */}
              <SettingsTabContent value="list-view">
                <ListViewSettingsSection
                  config={
                    (localConfig.recordListConfig as unknown as RecordListConfig) || {
                      layout: RECORD_LIST_LAYOUT_GENERIC_TABLE,
                      displayFields: [],
                    }
                  }
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfig) =>
                    handleConfigChange({
                      recordListConfig: newConfig as unknown as typeof localConfig.recordListConfig,
                    })
                  }
                />
              </SettingsTabContent>

              {/* Quick Filters */}
              <SettingsTabContent value="quick-filters">
                <QuickFiltersSection
                  quickFilters={(localConfig.quickFilters as unknown as QuickFilter[]) || []}
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newFilters) =>
                    handleConfigChange({ quickFilters: newFilters as unknown as typeof localConfig.quickFilters })
                  }
                />
              </SettingsTabContent>

              {/* Detail View Settings */}
              <SettingsTabContent value="detail-view">
                <DetailViewSettingsSection
                  config={
                    (localConfig.recordDetailConfig as unknown as RecordDetailConfig) || {
                      layout: RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
                      commentsPosition: COMMENTS_POSITION_RIGHT_PANEL,
                      headTitleField: '',
                      headSubLineFields: [],
                      rowTailFields: [],
                    }
                  }
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfig) =>
                    handleConfigChange({
                      recordDetailConfig: newConfig as unknown as typeof localConfig.recordDetailConfig,
                    })
                  }
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
                  ganttConfigs={(localConfig.ganttCharts as unknown as GanttConfig[]) || []}
                  fields={fields.map((f) => ({ name: f.name, label: f.label, type: f.type }))}
                  onChange={(newConfigs) =>
                    handleConfigChange({ ganttCharts: newConfigs as unknown as typeof localConfig.ganttCharts })
                  }
                />
              </SettingsTabContent>

              {/* Permissions */}
              <SettingsTabContent value="permissions">
                <PermissionsSettingsSection
                  permissionsConfig={localConfig.permissionsConfig || []}
                  actions={(localConfig.actions as unknown as Action[]) || []}
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
              validationErrors={validationErrors}
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
