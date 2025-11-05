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
// Note: Using simple toast replacement until full toast implementation is added
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    const message = description ? `${title}\n${description}` : title;
    if (variant === 'destructive') {
      alert(`Error: ${message}`);
    } else {
      console.log(message);
      // In production, this would use a proper toast library
    }
  },
});
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
  const { toast } = useToast();

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

  // Fetch table data
  const { data: tablesResp, isLoading, error: tablesError } = useActiveTables(workspaceId);
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
      toast({
        title: 'Settings saved',
        description: 'Your table configuration has been updated successfully.',
      });
      // Update original config to match saved state
      if (localConfig) {
        setOriginalConfig(localConfig);
      }
    },
    onError: (err) => {
      toast({
        title: 'Save failed',
        description: err.message || 'Failed to save table configuration. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle config changes from sections
  const handleConfigChange = useCallback((updates: Partial<TableConfig>) => {
    setLocalConfig((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    if (!localConfig) return;

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
                <Card>
                  <CardHeader>
                    <CardTitle>Actions Configuration</CardTitle>
                    <CardDescription>Manage default and custom actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Actions settings section will be implemented in Phase 3
                    </p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* List View Settings */}
              <SettingsTabContent value="list-view">
                <Card>
                  <CardHeader>
                    <CardTitle>List View Configuration</CardTitle>
                    <CardDescription>Configure how records are displayed in list view</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">List view settings will be implemented in Phase 3</p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* Quick Filters */}
              <SettingsTabContent value="quick-filters">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Filters</CardTitle>
                    <CardDescription>Create quick filters for common queries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Quick filters will be implemented in Phase 4</p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* Detail View Settings */}
              <SettingsTabContent value="detail-view">
                <Card>
                  <CardHeader>
                    <CardTitle>Detail View Configuration</CardTitle>
                    <CardDescription>Configure how record details are displayed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Detail view settings will be implemented in Phase 3</p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* Kanban Settings */}
              <SettingsTabContent value="kanban">
                <Card>
                  <CardHeader>
                    <CardTitle>Kanban Configuration</CardTitle>
                    <CardDescription>Set up kanban boards for this table</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Kanban settings will be implemented in Phase 4</p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* Gantt Settings */}
              <SettingsTabContent value="gantt">
                <Card>
                  <CardHeader>
                    <CardTitle>Gantt Chart Configuration</CardTitle>
                    <CardDescription>Set up gantt charts for project planning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Gantt settings will be implemented in Phase 4</p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* Permissions */}
              <SettingsTabContent value="permissions">
                <Card>
                  <CardHeader>
                    <CardTitle>Permissions Configuration</CardTitle>
                    <CardDescription>Manage team and role-based permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Permissions settings will be implemented in Phase 5</p>
                  </CardContent>
                </Card>
              </SettingsTabContent>

              {/* Danger Zone */}
              <SettingsTabContent value="danger-zone">
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible and dangerous actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Danger zone (table deletion) will be implemented in Phase 5
                    </p>
                  </CardContent>
                </Card>
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
