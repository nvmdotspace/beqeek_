import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

interface WorkflowConnector {
  id: string;
  workspaceId: string;
  name: string;
  type: 'webhook' | 'api' | 'database' | 'email' | 'slack' | 'custom';
  description?: string;
  configuration: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock connectors data
const mockConnectors: WorkflowConnector[] = [
  {
    id: '6001',
    workspaceId: '1001',
    name: 'Slack Notifications',
    type: 'slack',
    description: 'Send notifications to Slack channels',
    configuration: {
      webhookUrl: 'https://hooks.slack.com/services/...',
      channel: '#general',
      username: 'BEQEEK Bot',
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6002',
    workspaceId: '1001',
    name: 'Email Notifications',
    type: 'email',
    description: 'Send email notifications',
    configuration: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      username: 'notifications@company.com',
      fromEmail: 'notifications@company.com',
    },
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '6003',
    workspaceId: '1001',
    name: 'External API',
    type: 'api',
    description: 'Connect to external REST API',
    configuration: {
      baseUrl: 'https://api.external-service.com',
      apiKey: '***hidden***',
      timeout: 30000,
    },
    isActive: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

export const workflowConnectorHandlers = [
  // POST /api/workspace/{workspaceId}/workflow/get/connectors
  http.post('/api/workspace/:workspaceId/workflow/get/connectors', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as QueryRequest;

      let connectors = mockConnectors.filter((connector) => connector.workspaceId === workspaceId);

      // Apply filtering if specified
      if (body.queries?.filtering) {
        if (body.queries.filtering.search && typeof body.queries.filtering.search === 'string') {
          const searchTerm = body.queries.filtering.search.toLowerCase();
          connectors = connectors.filter(
            (connector) =>
              connector.name.toLowerCase().includes(searchTerm) ||
              connector.description?.toLowerCase().includes(searchTerm) ||
              connector.type.toLowerCase().includes(searchTerm),
          );
        }

        if (body.queries.filtering.type) {
          connectors = connectors.filter((connector) => connector.type === body.queries?.filtering?.type);
        }

        if (body.queries.filtering.isActive !== undefined) {
          connectors = connectors.filter((connector) => connector.isActive === body.queries?.filtering?.isActive);
        }
      }

      // Apply sorting if specified
      if (body.queries?.sorting && typeof body.queries.sorting === 'object') {
        const sorting = body.queries.sorting as { field: string; direction: 'asc' | 'desc' };
        const { field, direction } = sorting;
        connectors.sort((a, b) => {
          const aValue = a[field as keyof WorkflowConnector];
          const bValue = b[field as keyof WorkflowConnector];

          if (aValue === undefined || bValue === undefined) return 0;

          if (direction === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      const page = body.queries?.pagination?.page || 1;
      const perPage = body.queries?.pagination?.per_page || 50;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedConnectors = connectors.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: paginatedConnectors,
        meta: {
          current_page: page,
          last_page: Math.ceil(connectors.length / perPage),
          per_page: perPage,
          total: connectors.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/get/connectors/{connectorId}
  http.post('/api/workspace/:workspaceId/workflow/get/connectors/:connectorId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, connectorId } = params;

    const connector = mockConnectors.find((c) => c.id === connectorId && c.workspaceId === workspaceId);

    if (!connector) {
      return HttpResponse.json({ message: 'Connector not found' }, { status: 404 });
    }

    return HttpResponse.json({
      data: connector,
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/connectors
  http.post('/api/workspace/:workspaceId/workflow/post/connectors', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as MutationRequest<{
        name: string;
        type: string;
        description?: string;
        configuration: Record<string, unknown>;
        isActive?: boolean;
      }>;

      if (!body.data?.name || !body.data?.type || !body.data?.configuration) {
        return HttpResponse.json({ message: 'Name, type, and configuration are required' }, { status: 400 });
      }

      const newConnector: WorkflowConnector = {
        id: mockStore.generateId(),
        workspaceId: workspaceId as string,
        name: body.data.name,
        type: body.data.type as WorkflowConnector['type'],
        description: body.data.description,
        configuration: body.data.configuration,
        isActive: body.data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockConnectors.push(newConnector);

      return HttpResponse.json({
        data: newConnector,
        success: true,
        message: 'Connector created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // PATCH /api/workspace/:workspaceId/workflow/patch/connectors/:connectorId
  http.post('/api/workspace/:workspaceId/workflow/patch/connectors/:connectorId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, connectorId } = params;

    const connectorIndex = mockConnectors.findIndex((c) => c.id === connectorId && c.workspaceId === workspaceId);

    if (connectorIndex === -1) {
      return HttpResponse.json({ message: 'Connector not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<
        Partial<{
          name: string;
          type: string;
          description: string;
          configuration: Record<string, unknown>;
          isActive: boolean;
        }>
      >;

      const currentConnector = mockConnectors[connectorIndex];

      if (!currentConnector) {
        return HttpResponse.json({ message: 'Connector not found' }, { status: 404 });
      }

      const updatedConnector: WorkflowConnector = {
        ...currentConnector,
        ...body.data,
        type: (body.data?.type as WorkflowConnector['type']) || currentConnector.type,
        updatedAt: new Date().toISOString(),
      };

      mockConnectors[connectorIndex] = updatedConnector;

      return HttpResponse.json({
        data: updatedConnector,
        success: true,
        message: 'Connector updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // DELETE /api/workspace/:workspaceId/workflow/delete/connectors/:connectorId
  http.post('/api/workspace/:workspaceId/workflow/delete/connectors/:connectorId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, connectorId } = params;

    const connectorIndex = mockConnectors.findIndex((c) => c.id === connectorId && c.workspaceId === workspaceId);

    if (connectorIndex === -1) {
      return HttpResponse.json({ message: 'Connector not found' }, { status: 404 });
    }

    mockConnectors.splice(connectorIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Connector deleted successfully',
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/connectors/{connectorId}/test
  http.post('/api/workspace/:workspaceId/workflow/post/connectors/:connectorId/test', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, connectorId } = params;

    const connector = mockConnectors.find((c) => c.id === connectorId && c.workspaceId === workspaceId);

    if (!connector) {
      return HttpResponse.json({ message: 'Connector not found' }, { status: 404 });
    }

    // Mock test result based on connector type
    const testResults = {
      slack: { success: true, message: 'Successfully sent test message to Slack' },
      email: { success: true, message: 'Test email sent successfully' },
      api: { success: true, message: 'API connection test successful' },
      webhook: { success: true, message: 'Webhook test successful' },
      database: { success: false, message: 'Database connection failed: Timeout' },
      custom: { success: true, message: 'Custom connector test completed' },
    };

    const result = testResults[connector.type] || { success: false, message: 'Unknown connector type' };

    return HttpResponse.json({
      data: {
        connectorId: connector.id,
        testResult: result,
        testedAt: new Date().toISOString(),
      },
      success: result.success,
      message: result.message,
    });
  }),
];
