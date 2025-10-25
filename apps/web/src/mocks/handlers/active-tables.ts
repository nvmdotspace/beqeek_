import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest, ActiveTable } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

export const activeTableHandlers = [
  // POST /api/workspace/{workspaceId}/workflow/get/active_tables
  http.post('/api/workspace/:workspaceId/workflow/get/active_tables', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const tables = mockStore.getWorkspaceActiveTables(workspaceId as string);

    try {
      const body = (await request.json()) as QueryRequest;

      // Apply filtering if specified
      let filteredTables = tables;
      if (body.queries?.filtering) {
        filteredTables = tables.filter((table) => {
          // Example: filter by table name
          if (body.queries?.filtering?.tableName && typeof body.queries.filtering.tableName === 'string') {
            return table.tableName.toLowerCase().includes(body.queries.filtering.tableName.toLowerCase());
          }
          return true;
        });
      }

      return HttpResponse.json({
        data: filteredTables,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: filteredTables.length,
        },
      });
    } catch {
      return HttpResponse.json({
        data: tables,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: tables.length,
        },
      });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}
  http.post('/api/workspace/:workspaceId/workflow/get/active_tables/:tableId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tableId } = params;
    const table = mockStore.getActiveTable(tableId as string);

    if (!table) {
      return HttpResponse.json({ message: 'Active table not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as QueryRequest;

      // Apply field selection if specified
      let responseData = table;
      if (body.queries?.fields) {
        // In a real implementation, you'd filter fields based on the fields parameter
        responseData = table;
      }

      return HttpResponse.json({
        data: responseData,
      });
    } catch {
      return HttpResponse.json({
        data: table,
      });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/active_tables
  http.post('/api/workspace/:workspaceId/workflow/post/active_tables', async ({ request }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = (await request.json()) as MutationRequest<Omit<ActiveTable, 'id' | 'createdAt' | 'updatedAt'>>;

      // Validate required fields
      const errors: Record<string, string[]> = {};
      if (!body.data.tableName) errors.tableName = ['Table name is required'];
      if (!body.data.tableSchema) errors.tableSchema = ['Table schema is required'];

      if (Object.keys(errors).length > 0) {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors,
          },
          { status: 422 },
        );
      }

      // Create new active table
      const newTable: ActiveTable = {
        id: mockStore.generateId(),
        tableName: body.data.tableName,
        tableDescription: body.data.tableDescription,
        tableSchema: body.data.tableSchema,
        encryptionEnabled: body.data.encryptionEnabled || false,
        encryptionAuthKey: body.data.encryptionEnabled ? `auth_key_${Date.now()}` : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json({
        data: newTable,
        success: true,
        message: 'Active table created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
  http.post('/api/workspace/:workspaceId/workflow/patch/active_tables/:tableId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tableId } = params;
    const table = mockStore.getActiveTable(tableId as string);

    if (!table) {
      return HttpResponse.json({ message: 'Active table not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<Partial<ActiveTable>>;

      // Update table (in real app, this would update the database)
      const updatedTable = {
        ...table,
        ...body.data,
        updatedAt: new Date().toISOString(),
      };

      // Use updatedTable to avoid unused warning
      console.log('Updated table:', updatedTable.id);

      return HttpResponse.json({
        success: true,
        message: 'Active table updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/delete/active_tables/{tableId}
  http.post('/api/workspace/:workspaceId/workflow/delete/active_tables/:tableId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tableId } = params;
    const table = mockStore.getActiveTable(tableId as string);

    if (!table) {
      return HttpResponse.json({ message: 'Active table not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as {
        constraints?: {
          deleteRecords?: boolean;
          moveRecordsToTableId?: string;
        };
      };

      // In real app, this would handle record deletion/migration and then delete the table
      // Use body to avoid unused warning
      console.log('Delete constraints:', body.constraints);

      return HttpResponse.json({
        success: true,
        message: 'Active table deleted successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),
];
