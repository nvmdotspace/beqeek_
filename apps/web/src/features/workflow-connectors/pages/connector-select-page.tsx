/**
 * Connector Select Page
 *
 * Connector type catalog for creating new connectors
 */

import { useState, useMemo, useCallback } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/route-paths';
import { CONNECTOR_TYPES, type ConnectorType } from '@workspace/beqeek-shared/workflow-connectors';
import { ConnectorCard } from '../components/connector-card';
import { SearchInput } from '../components/search-input';
import { EmptyState } from '../components/empty-state';
import { CreateConnectorDialog } from '../components/create-connector-dialog';
import { useCreateConnector } from '../api/connector-api';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';

const route = getRouteApi(ROUTES.WORKFLOW_CONNECTORS.SELECT);

export function ConnectorSelectPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<{
    type: ConnectorType;
    name: string;
  } | null>(null);

  const createConnector = useCreateConnector(workspaceId);

  // Filter connector types by search query
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return CONNECTOR_TYPES;

    const query = searchQuery.toLowerCase();
    return CONNECTOR_TYPES.filter(
      (type) => type.name.toLowerCase().includes(query) || type.description.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleBackClick = () => {
    navigate({
      to: ROUTES.WORKFLOW_CONNECTORS.LIST,
      params: { locale, workspaceId },
    });
  };

  const handleCardClick = useCallback((connectorType: string, connectorTypeName: string) => {
    setSelectedType({ type: connectorType as ConnectorType, name: connectorTypeName });
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(
    async (data: { name: string; description: string; connectorType: ConnectorType }) => {
      try {
        const result = await createConnector.mutateAsync(data);
        setDialogOpen(false);

        // Navigate to detail page
        navigate({
          to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
          params: { locale, workspaceId, connectorId: result.data.id },
        });
      } catch (error) {
        console.error('Failed to create connector:', error);
      }
    },
    [createConnector, navigate, locale, workspaceId],
  );

  const handleCloseDialog = useCallback(() => {
    if (!createConnector.isPending) {
      setDialogOpen(false);
      setSelectedType(null);
    }
  }, [createConnector.isPending]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back button + Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Heading level={1}>Chọn loại Connector</Heading>
            <Text size="small" color="muted">
              Chọn dịch vụ bạn muốn kết nối
            </Text>
          </div>
        </div>

        {/* Search */}
        <SearchInput placeholder="Tìm kiếm connector..." onSearch={setSearchQuery} className="max-w-md" />
      </div>

      {/* Grid - Compact 2-column layout for better readability */}
      {filteredTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTypes.map((type) => (
            <ConnectorCard key={type.type} connectorType={type} onClick={() => handleCardClick(type.type, type.name)} />
          ))}
        </div>
      ) : (
        <EmptyState
          message="Không tìm thấy connector"
          description={`Không có connector nào khớp với "${searchQuery}". Thử tìm kiếm với từ khóa khác.`}
        />
      )}

      {/* Create dialog */}
      {selectedType && (
        <CreateConnectorDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          connectorType={selectedType.type}
          connectorTypeName={selectedType.name}
          onCreate={handleCreate}
          isLoading={createConnector.isPending}
        />
      )}
    </div>
  );
}
