/**
 * Connector Detail Page
 *
 * Detail view for managing connector configuration, OAuth, and documentation
 */

import { useState, useCallback } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ArrowLeft, Settings, Trash2 } from 'lucide-react';
import { ROUTES } from '@/shared/route-paths';
import { CONNECTOR_CONFIGS } from '@workspace/beqeek-shared/workflow-connectors';
import { useConnectorDetail, useUpdateConnector, useDeleteConnector, useOAuthState } from '../api/connector-api';
import { ConnectorConfigForm } from '../components/connector-config-form';
import { EditConnectorDialog } from '../components/edit-connector-dialog';
import { DocumentationViewer } from '../components/documentation-viewer';
import { Button } from '@workspace/ui/components/button';
import { Heading } from '@workspace/ui/components/typography';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-connectors/$connectorId/');

export function ConnectorDetailPage() {
  const { workspaceId, locale, connectorId } = route.useParams();
  const navigate = route.useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // API hooks
  const { data: connector, isLoading } = useConnectorDetail(workspaceId, connectorId);
  const updateConnector = useUpdateConnector(workspaceId, connectorId);
  const deleteConnector = useDeleteConnector(workspaceId);
  const { refetch: getOAuthState } = useOAuthState(workspaceId, connectorId);

  // Get connector config definition
  const configDef = connector ? CONNECTOR_CONFIGS.find((c) => c.connectorType === connector.connectorType) : null;
  const isOAuth = configDef?.oauth || false;

  const handleBack = () => {
    navigate({
      to: ROUTES.WORKFLOW_CONNECTORS.LIST,
      params: { locale, workspaceId },
    });
  };

  const handleConfigSubmit = useCallback(
    async (config: Record<string, unknown>) => {
      try {
        await updateConnector.mutateAsync({ config });
      } catch (error) {
        console.error('Failed to save config:', error);
      }
    },
    [updateConnector],
  );

  const handleBasicInfoUpdate = useCallback(
    async (data: { name: string; description: string }) => {
      try {
        await updateConnector.mutateAsync(data);
        setEditDialogOpen(false);
      } catch (error) {
        console.error('Failed to update connector:', error);
      }
    },
    [updateConnector],
  );

  const handleOAuthConnect = useCallback(async () => {
    try {
      const { data } = await getOAuthState();
      if (data?.state) {
        // Construct OAuth redirect URL
        const oauthUrl = `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state=${data.state}`;
        window.location.href = oauthUrl;
      }
    } catch (error) {
      console.error('Failed to start OAuth:', error);
    }
  }, [getOAuthState]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteConnector.mutateAsync(connectorId);
      setDeleteDialogOpen(false);

      // Navigate back to list
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.LIST,
        params: { locale, workspaceId },
      });
    } catch (error) {
      console.error('Failed to delete connector:', error);
    }
  }, [deleteConnector, connectorId, navigate, locale, workspaceId]);

  if (isLoading || !connector) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Heading level={1}>{connector.name}</Heading>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
          <Button variant="outline" size="icon" onClick={() => setEditDialogOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Config Form */}
      <ConnectorConfigForm
        connectorType={connector.connectorType}
        config={connector.config || {}}
        isOAuth={isOAuth}
        onSubmit={handleConfigSubmit}
        onOAuthConnect={handleOAuthConnect}
        isLoading={updateConnector.isPending}
      />

      {/* Documentation */}
      <DocumentationViewer documentation={connector.documentation} />

      {/* Edit Dialog */}
      <EditConnectorDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentName={connector.name}
        currentDescription={connector.description || ''}
        onUpdate={handleBasicInfoUpdate}
        isLoading={updateConnector.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa connector</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa connector "{connector.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteConnector.isPending}>
              {deleteConnector.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
