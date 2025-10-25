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

interface WorkflowEvent {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'webhook' | 'schedule' | 'trigger' | 'manual';
  configuration: EventConfiguration;
  isActive: boolean;
  lastTriggered?: string;
  nextScheduled?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EventConfiguration {
  trigger?: {
    type: 'record_created' | 'record_updated' | 'record_deleted' | 'field_changed' | 'status_changed';
    conditions?: Record<string, unknown>;
    tableId?: string;
  };
  schedule?: {
    type: 'cron' | 'interval';
    expression: string;
    timezone?: string;
  };
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    payload?: Record<string, unknown>;
  };
  actions: EventAction[];
}

interface EventAction {
  id: string;
  type: 'send_email' | 'webhook' | 'update_record' | 'create_record' | 'notification' | 'custom';
  configuration: Record<string, unknown>;
  order: number;
}

// Mock events data
const mockEvents: WorkflowEvent[] = [
  {
    id: '10001',
    workspaceId: '1001',
    name: 'New Task Notification',
    description: 'Send email notification when a new task is created',
    type: 'trigger',
    configuration: {
      trigger: {
        type: 'record_created',
        tableId: '4001',
      },
      actions: [
        {
          id: 'action_1',
          type: 'send_email',
          configuration: {
            to: ['manager@company.com'],
            subject: 'New Task Created: {{record.title}}',
            template: 'new_task_notification',
            variables: {
              taskTitle: '{{record.title}}',
              assignee: '{{record.assignee}}',
              priority: '{{record.priority}}',
            },
          },
          order: 1,
        },
      ],
    },
    isActive: true,
    lastTriggered: '2024-01-01T10:30:00Z',
    triggerCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '10002',
    workspaceId: '1001',
    name: 'Daily Status Report',
    description: 'Generate and send daily status report',
    type: 'schedule',
    configuration: {
      schedule: {
        type: 'cron',
        expression: '0 9 * * 1-5',
        timezone: 'UTC',
      },
      actions: [
        {
          id: 'action_2',
          type: 'webhook',
          configuration: {
            url: 'https://api.company.com/reports/daily',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer {{env.API_TOKEN}}',
            },
            payload: {
              workspaceId: '{{workspace.id}}',
              date: '{{date.today}}',
              reportType: 'daily_status',
            },
          },
          order: 1,
        },
      ],
    },
    isActive: true,
    nextScheduled: '2024-01-02T09:00:00Z',
    triggerCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '10003',
    workspaceId: '1001',
    name: 'High Priority Alert',
    description: 'Send immediate notification for high priority tasks',
    type: 'trigger',
    configuration: {
      trigger: {
        type: 'field_changed',
        tableId: '4001',
        conditions: {
          field: 'priority',
          newValue: 'high',
        },
      },
      actions: [
        {
          id: 'action_3',
          type: 'notification',
          configuration: {
            type: 'slack',
            channel: '#urgent',
            message: '🚨 High priority task: {{record.title}} - {{record.description}}',
          },
          order: 1,
        },
        {
          id: 'action_4',
          type: 'send_email',
          configuration: {
            to: ['team-lead@company.com'],
            subject: 'URGENT: High Priority Task',
            template: 'urgent_task_alert',
          },
          order: 2,
        },
      ],
    },
    isActive: true,
    lastTriggered: '2024-01-01T14:20:00Z',
    triggerCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const eventHandlers = [
  // POST /api/workspace/{workspaceId}/workflow/get/events
  http.post('*/api/workspace/:workspaceId/workflow/get/events', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as QueryRequest;

      let events = mockEvents.filter((event) => event.workspaceId === workspaceId);

      // Apply filtering if specified
      if (body.queries?.filtering) {
        if (body.queries.filtering.search && typeof body.queries.filtering.search === 'string') {
          const searchTerm = body.queries.filtering.search.toLowerCase();
          events = events.filter(
            (event) =>
              event.name.toLowerCase().includes(searchTerm) || event.description?.toLowerCase().includes(searchTerm),
          );
        }

        if (body.queries.filtering.type) {
          events = events.filter((event) => event.type === body.queries?.filtering?.type);
        }

        if (body.queries.filtering.isActive !== undefined) {
          events = events.filter((event) => event.isActive === body.queries?.filtering?.isActive);
        }
      }

      // Apply sorting if specified
      if (body.queries?.sorting && typeof body.queries.sorting === 'object') {
        const sorting = body.queries.sorting as { field: string; direction: 'asc' | 'desc' };
        const { field, direction } = sorting;
        events.sort((a, b) => {
          const aValue = a[field as keyof WorkflowEvent];
          const bValue = b[field as keyof WorkflowEvent];

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
      const paginatedEvents = events.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: paginatedEvents,
        meta: {
          current_page: page,
          last_page: Math.ceil(events.length / perPage),
          per_page: perPage,
          total: events.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/get/events/{eventId}
  http.post('*/api/workspace/:workspaceId/workflow/get/events/:eventId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, eventId } = params;

    const event = mockEvents.find((e) => e.id === eventId && e.workspaceId === workspaceId);

    if (!event) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return HttpResponse.json({
      data: event,
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/events
  http.post('*/api/workspace/:workspaceId/workflow/post/events', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as MutationRequest<{
        name: string;
        description?: string;
        type: WorkflowEvent['type'];
        configuration: EventConfiguration;
        isActive?: boolean;
      }>;

      if (!body.data?.name || !body.data?.type || !body.data?.configuration) {
        return HttpResponse.json({ message: 'Name, type, and configuration are required' }, { status: 400 });
      }

      const newEvent: WorkflowEvent = {
        id: mockStore.generateId(),
        workspaceId: workspaceId as string,
        name: body.data.name,
        description: body.data.description,
        type: body.data.type,
        configuration: body.data.configuration,
        isActive: body.data.isActive ?? true,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set nextScheduled for scheduled events
      if (newEvent.type === 'schedule' && newEvent.configuration.schedule) {
        // Mock next scheduled time (in real app, this would be calculated based on cron expression)
        const nextRun = new Date();
        nextRun.setHours(nextRun.getHours() + 1);
        newEvent.nextScheduled = nextRun.toISOString();
      }

      mockEvents.push(newEvent);

      return HttpResponse.json({
        data: newEvent,
        success: true,
        message: 'Event created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/patch/events/{eventId}
  http.post('*/api/workspace/:workspaceId/workflow/patch/events/:eventId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, eventId } = params;

    const eventIndex = mockEvents.findIndex((e) => e.id === eventId && e.workspaceId === workspaceId);

    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<
        Partial<{
          name: string;
          description: string;
          type: WorkflowEvent['type'];
          configuration: EventConfiguration;
          isActive: boolean;
        }>
      >;

      const currentEvent = mockEvents[eventIndex];

      if (!currentEvent) {
        return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
      }

      const updatedEvent: WorkflowEvent = {
        ...currentEvent,
        ...body.data,
        updatedAt: new Date().toISOString(),
      };

      // Update nextScheduled if schedule configuration changed
      if (body.data?.configuration?.schedule && updatedEvent.type === 'schedule') {
        const nextRun = new Date();
        nextRun.setHours(nextRun.getHours() + 1);
        updatedEvent.nextScheduled = nextRun.toISOString();
      }

      mockEvents[eventIndex] = updatedEvent;

      return HttpResponse.json({
        data: updatedEvent,
        success: true,
        message: 'Event updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/delete/events/{eventId}
  http.post('*/api/workspace/:workspaceId/workflow/delete/events/:eventId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, eventId } = params;

    const eventIndex = mockEvents.findIndex((e) => e.id === eventId && e.workspaceId === workspaceId);

    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    mockEvents.splice(eventIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/events/{eventId}/trigger
  http.post('*/api/workspace/:workspaceId/workflow/post/events/:eventId/trigger', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, eventId } = params;

    const eventIndex = mockEvents.findIndex((e) => e.id === eventId && e.workspaceId === workspaceId);

    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const event = mockEvents[eventIndex];

    if (!event) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    if (!event.isActive) {
      return HttpResponse.json({ message: 'Event is not active' }, { status: 400 });
    }

    try {
      const body = (await request.json()) as MutationRequest<{
        context?: Record<string, unknown>;
        dryRun?: boolean;
      }>;

      // Mock event execution
      const executionId = mockStore.generateId();
      const executionResult = {
        executionId,
        eventId: event.id,
        triggeredBy: userId,
        triggeredAt: new Date().toISOString(),
        dryRun: body.data?.dryRun || false,
        context: body.data?.context || {},
        actions: event.configuration.actions.map((action) => ({
          actionId: action.id,
          type: action.type,
          status: 'success',
          executedAt: new Date().toISOString(),
          result: `Mock execution of ${action.type} action`,
        })),
        status: 'completed',
        duration: Math.floor(Math.random() * 1000) + 100, // Mock execution time
      };

      // Update trigger count and last triggered (only if not dry run)
      if (!body.data?.dryRun) {
        mockEvents[eventIndex] = {
          ...event,
          triggerCount: event.triggerCount + 1,
          lastTriggered: new Date().toISOString(),
        };
      }

      return HttpResponse.json({
        data: executionResult,
        success: true,
        message: body.data?.dryRun ? 'Event dry run completed' : 'Event triggered successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/get/events/{eventId}/executions
  http.post('*/api/workspace/:workspaceId/workflow/get/events/:eventId/executions', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, eventId } = params;

    const event = mockEvents.find((e) => e.id === eventId && e.workspaceId === workspaceId);

    if (!event) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as QueryRequest;

      // Mock execution history
      const mockExecutions = Array.from({ length: event.triggerCount }, (_, i) => ({
        id: `exec_${event.id}_${i + 1}`,
        eventId: event.id,
        triggeredBy: userId,
        triggeredAt: new Date(Date.now() - (event.triggerCount - i) * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        duration: Math.floor(Math.random() * 2000) + 100,
        actions: event.configuration.actions.map((action) => ({
          actionId: action.id,
          type: action.type,
          status: Math.random() > 0.05 ? 'success' : 'failed',
          executedAt: new Date().toISOString(),
          result: `Execution result for ${action.type}`,
        })),
      }));

      // Apply pagination
      const page = body.queries?.pagination?.page || 1;
      const perPage = body.queries?.pagination?.per_page || 50;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedExecutions = mockExecutions.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: paginatedExecutions,
        meta: {
          current_page: page,
          last_page: Math.ceil(mockExecutions.length / perPage),
          per_page: perPage,
          total: mockExecutions.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),
];
