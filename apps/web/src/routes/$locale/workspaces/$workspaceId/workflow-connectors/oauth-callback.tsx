/**
 * OAuth Callback Route
 *
 * Handles OAuth redirect callback after external authentication
 */

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/shared/route-paths';
import { useQueryClient } from '@tanstack/react-query';
import { connectorKeys } from '@/features/workflow-connectors/api/query-keys';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/oauth-callback')({
  component: OAuthCallbackPage,
  validateSearch: (search: Record<string, unknown>) => ({
    connector_id: (search.connector_id as string) || '',
    status: (search.status as string) || '',
    error: (search.error as string) || '',
  }),
});

function OAuthCallbackPage() {
  const { workspaceId, locale } = Route.useParams();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { connector_id, status, error: searchError } = search;

        // Check for OAuth errors
        if (searchError) {
          setError(`Lỗi xác thực: ${searchError}`);
          return;
        }

        if (status === 'error') {
          setError('Kết nối OAuth không thành công. Vui lòng thử lại.');
          return;
        }

        if (!connector_id) {
          // No connector ID, redirect to list
          navigate({
            to: ROUTES.WORKFLOW_CONNECTORS.LIST,
            params: { locale, workspaceId },
          });
          return;
        }

        // Invalidate connector detail to fetch updated OAuth tokens
        await queryClient.invalidateQueries({
          queryKey: connectorKeys.detail(workspaceId, connector_id),
        });

        // Small delay to allow data to refresh
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Navigate to connector detail page
        navigate({
          to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
          params: { locale, workspaceId, connectorId: connector_id },
        });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Đã xảy ra lỗi khi xử lý callback OAuth. Vui lòng thử lại.');
      }
    };

    handleCallback();
  }, [search, workspaceId, locale, navigate, queryClient]);

  const handleRetry = () => {
    navigate({
      to: ROUTES.WORKFLOW_CONNECTORS.LIST,
      params: { locale, workspaceId },
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi kết nối OAuth</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error}</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              Quay lại danh sách Connectors
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Đang hoàn tất kết nối OAuth...</p>
      </div>
    </div>
  );
}
