import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Settings2 } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

import { useActiveTables } from '../hooks/use-active-tables';
import { GeneralSettingsTab } from '../components/settings/general-settings-tab';
import { FieldsSettingsTab } from '../components/settings/fields-settings-tab';
import { SecuritySettingsTab } from '../components/settings/security-settings-tab';
import { useCurrentLocale } from '@/hooks/use-current-locale';

/**
 * Active Table Settings Page
 *
 * Full-page settings interface for configuring active tables.
 * Provides tabbed navigation for different configuration areas:
 * - General: Basic table info, limits, defaults
 * - Fields: Field configuration and searchable fields
 * - Security: Encryption and access settings
 */
export const ActiveTableSettingsPage = () => {
  const params = useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId/settings' });
  const navigate = useNavigate();
  const locale = useCurrentLocale();

  // Extract params from URL - these are now the source of truth
  const tableId = params.tableId;
  const workspaceId = params.workspaceId;

  const [activeTab, setActiveTab] = useState('general');

  // Fetch all tables and find the specific one
  const { data: tablesResp, isLoading, error: tablesError } = useActiveTables(workspaceId);
  const table = tablesResp?.data.find((item) => item.id === tableId);
  const error = table ? null : new Error('Table not found');

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
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
  if (error || !table) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load table</CardTitle>
            <CardDescription>
              {error?.message || 'Table not found or you do not have permission to access it.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => {
              navigate({
                to: '/$locale/workspaces/$workspaceId/tables/$tableId',
                params: { locale: locale || 'vi', workspaceId, tableId },
              });
            }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate({
                  to: '/$locale/workspaces/$workspaceId/tables/$tableId',
                  params: { locale: locale || 'vi', workspaceId, tableId },
                });
              }}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">{table.name}</h1>
            </div>
          </div>
          <p className="ml-14 text-muted-foreground">
            Configure table settings, fields, and security options
          </p>
        </div>
      </div>

      {/* Tabbed Settings Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsTab table={table} workspaceId={workspaceId} />
        </TabsContent>

        {/* Fields Settings Tab */}
        <TabsContent value="fields" className="space-y-6">
          <FieldsSettingsTab table={table} workspaceId={workspaceId} />
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecuritySettingsTab table={table} workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
