import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest, ActiveTableRecord } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

// Mock encryption/decryption functions
function mockEncryptData(data: Record<string, unknown>): {
  encryptedData: Record<string, unknown>;
  hashedKeywords: string[];
} {
  // In real app, this would use actual encryption
  const encryptedData: Record<string, unknown> = {};
  const hashedKeywords: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Mock encryption for text fields
      encryptedData[key] = `encrypted_${btoa(value)}`;

      // Mock hashed keywords for searchable fields
      if (key.includes('title') || key.includes('description')) {
        const words = value.toLowerCase().split(/\s+/);
        words.forEach((word) => {
          if (word.length > 2) {
            hashedKeywords.push(`hash_${btoa(word)}`);
          }
        });
      }
    } else {
      // Mock OPE encryption for numbers/dates
      encryptedData[key] = `ope_${value}`;
    }
  });

  return { encryptedData, hashedKeywords };
}

function mockDecryptData(encryptedData: Record<string, unknown>): Record<string, unknown> {
  // In real app, this would use actual decryption
  const decryptedData: Record<string, unknown> = {};

  Object.entries(encryptedData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (value.startsWith('encrypted_')) {
        // Mock decryption for text fields
        try {
          decryptedData[key] = atob(value.substring(10));
        } catch {
          decryptedData[key] = 'Decryption failed';
        }
      } else if (value.startsWith('ope_')) {
        // Mock OPE decryption
        decryptedData[key] = value.substring(4);
      } else {
        decryptedData[key] = value;
      }
    } else {
      decryptedData[key] = value;
    }
  });

  return decryptedData;
}

export const activeTableRecordHandlers = [
  // POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records
  http.post('*/api/workspace/:workspaceId/workflow/active_tables/:tableId/records', async ({ request, params }) => {
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
      const body = (await request.json()) as QueryRequest & {
        encryptionKey?: string;
      };

      // Mock records data
      const mockRecords: ActiveTableRecord[] = [
        {
          id: '5001',
          tableId: tableId as string,
          data: {},
          encryptedData: {
            task_title: 'encrypted_VGFzayAxOiBJbXBsZW1lbnQgbG9naW4=',
            task_description: 'encrypted_Q3JlYXRlIGxvZ2luIGZvcm0gYW5kIGF1dGhlbnRpY2F0aW9u',
            priority: 'hash_high',
            status: 'hash_todo',
          },
          hashedKeywords: ['hash_dGFzaw==', 'hash_bG9naW4=', 'hash_aW1wbGVtZW50'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '5002',
          tableId: tableId as string,
          data: {},
          encryptedData: {
            task_title: 'encrypted_VGFzayAyOiBEZXNpZ24gZGFzaGJvYXJk',
            task_description: 'encrypted_Q3JlYXRlIHVzZXIgZGFzaGJvYXJkIGxheW91dA==',
            priority: 'hash_medium',
            status: 'hash_in_progress',
          },
          hashedKeywords: ['hash_dGFzaw==', 'hash_ZGVzaWdu', 'hash_ZGFzaGJvYXJk'],
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];

      // If encryption key provided, decrypt the data
      let responseRecords = mockRecords;
      if (body.encryptionKey && table.encryptionEnabled) {
        responseRecords = mockRecords.map((record) => ({
          ...record,
          data: mockDecryptData(record.encryptedData || {}),
        }));
      }

      // Apply filtering if specified
      if (body.queries?.filtering) {
        // Example: search by hashed keywords
        if (body.queries.filtering.search && typeof body.queries.filtering.search === 'string') {
          const searchTerm = body.queries.filtering.search.toLowerCase();
          const searchHash = `hash_${btoa(searchTerm)}`;
          responseRecords = responseRecords.filter((record) => record.hashedKeywords?.includes(searchHash));
        }
      }

      return HttpResponse.json({
        data: responseRecords,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 50,
          total: responseRecords.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records
  http.post(
    '*/api/workspace/:workspaceId/workflow/post/active_tables/:tableId/records',
    async ({ request, params }) => {
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
        const body = (await request.json()) as MutationRequest<Record<string, unknown>> & {
          encryptionKey?: string;
          hashedKeywordFields?: string[];
        };

        if (!body.data) {
          return HttpResponse.json({ message: 'Record data is required' }, { status: 400 });
        }

        let recordData = body.data;
        let encryptedData: Record<string, unknown> = {};
        let hashedKeywords: string[] = [];

        // If table has encryption enabled and encryption key provided
        if (table.encryptionEnabled && body.encryptionKey) {
          const encrypted = mockEncryptData(body.data);
          encryptedData = encrypted.encryptedData;
          hashedKeywords = encrypted.hashedKeywords;
          recordData = {}; // Clear plain data when encrypted
        }

        const newRecord: ActiveTableRecord = {
          id: mockStore.generateId(),
          tableId: tableId as string,
          data: recordData,
          encryptedData: table.encryptionEnabled ? encryptedData : undefined,
          hashedKeywords: table.encryptionEnabled ? hashedKeywords : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return HttpResponse.json({
          data: newRecord,
          success: true,
          message: 'Record created successfully',
        });
      } catch {
        return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
      }
    },
  ),

  // POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}
  http.post(
    '*/api/workspace/:workspaceId/workflow/patch/active_tables/:tableId/records/:recordId',
    async ({ request, params }) => {
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
        const body = (await request.json()) as MutationRequest<Record<string, unknown>> & {
          encryptionKey?: string;
          hashedKeywordFields?: string[];
        };

        // In real app, you'd fetch the existing record first
        // For mock, we'll just simulate the update

        // If table has encryption enabled and encryption key provided
        if (table.encryptionEnabled && body.encryptionKey) {
          const encrypted = mockEncryptData(body.data);
          void encrypted.encryptedData;
          void encrypted.hashedKeywords;
          void body.data; // Clear plain data when encrypted
        }

        return HttpResponse.json({
          success: true,
          message: 'Record updated successfully',
        });
      } catch {
        return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
      }
    },
  ),

  // POST /api/workspace/{workspaceId}/workflow/delete/active_tables/{tableId}/records/{recordId}
  http.post(
    '*/api/workspace/:workspaceId/workflow/delete/active_tables/:tableId/records/:recordId',
    async ({ request, params }) => {
      const userId = getUserIdFromAuth(request);

      if (!userId) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const { tableId } = params;
      const table = mockStore.getActiveTable(tableId as string);

      if (!table) {
        return HttpResponse.json({ message: 'Active table not found' }, { status: 404 });
      }

      // In real app, you'd check if record exists and delete it
      return HttpResponse.json({
        success: true,
        message: 'Record deleted successfully',
      });
    },
  ),
];
