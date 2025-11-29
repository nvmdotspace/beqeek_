/**
 * Connector Detail Page
 *
 * Detail view for managing connector configuration, OAuth, and documentation
 */

import { useState, useCallback } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ArrowLeft, Settings, Trash2, Copy, Check } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { ROUTES } from '@/shared/route-paths';
import { CONNECTOR_CONFIGS } from '@workspace/beqeek-shared/workflow-connectors';
import { toast } from 'sonner';
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

const route = getRouteApi(ROUTES.WORKFLOW_CONNECTORS.DETAIL);

export function ConnectorDetailPage() {
  const { workspaceId, locale, connectorId } = route.useParams();
  const navigate = route.useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyConnectorId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(connectorId);
      setCopied(true);
      toast.success(m.connectors_detail_copiedId());
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = connectorId;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success(m.connectors_detail_copiedId());
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(m.connectors_detail_copyFailed());
      }
      document.body.removeChild(textArea);
    }
  }, [connectorId]);

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
          <div>
            <Heading level={1}>{connector.name}</Heading>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                {connectorId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopyConnectorId}
                title={m.connectors_detail_copyId()}
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            {m.connectors_detail_delete()}
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
            <AlertDialogTitle>{m.connectors_detail_deleteTitle()}</AlertDialogTitle>
            <AlertDialogDescription>{m.connectors_detail_deleteDesc({ name: connector.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.connectors_detail_deleteCancel()}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteConnector.isPending}>
              {deleteConnector.isPending ? m.connectors_detail_deleting() : m.connectors_detail_deleteConfirm()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
