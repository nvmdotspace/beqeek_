import { createFileRoute } from '@tanstack/react-router';
import { KanbanBoardV2 } from '@workspace/active-tables-core/components/kanban';
import type { TableRecord } from '@workspace/active-tables-core/types/record';
import type { Table } from '@workspace/active-tables-core/types/table';

export const Route = createFileRoute('/$locale/test-kanban-v2')({
  component: TestKanbanV2Page,
});

function TestKanbanV2Page() {
  // Mock data cho test
  const mockTable: Table = {
    id: 'test-table',
    name: 'Test Table',
    workspaceId: 'test-workspace',
    workgroupId: null,
    config: {
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'SELECT_ONE',
          required: false,
          options: [
            {
              value: 'todo',
              text: 'To Do',
              background_color: '#f3f4f6',
              text_color: '#374151',
            },
            {
              value: 'in_progress',
              text: 'In Progress',
              background_color: '#dbeafe',
              text_color: '#1e40af',
            },
            {
              value: 'review',
              text: 'Review',
              background_color: '#fef3c7',
              text_color: '#92400e',
            },
            {
              value: 'done',
              text: 'Done',
              background_color: '#d1fae5',
              text_color: '#065f46',
            },
          ],
        },
        {
          name: 'title',
          label: 'Title',
          type: 'SHORT_TEXT',
          required: true,
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'SELECT_ONE',
          required: false,
          options: [
            {
              value: 'low',
              text: 'Low',
              background_color: '#dbeafe',
              text_color: '#1e40af',
            },
            {
              value: 'medium',
              text: 'Medium',
              background_color: '#fed7aa',
              text_color: '#9a3412',
            },
            {
              value: 'high',
              text: 'High',
              background_color: '#fecaca',
              text_color: '#991b1b',
            },
          ],
        },
        {
          name: 'assignee',
          label: 'Assignee',
          type: 'SHORT_TEXT',
          required: false,
        },
        {
          name: 'dueDate',
          label: 'Due Date',
          type: 'DATE',
          required: false,
        },
      ],
      statusField: 'status',
      kanbanHeadlineField: 'title',
      displayFields: ['priority', 'assignee', 'dueDate'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEncrypted: false,
  };

  const mockRecords: TableRecord[] = [
    {
      id: '1',
      tableId: 'test-table',
      data: {
        status: 'todo',
        title: 'Implement user authentication with JWT tokens and refresh mechanism',
        priority: 'high',
        assignee: 'John Doe',
        dueDate: '2024-12-31',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      tableId: 'test-table',
      data: {
        status: 'in_progress',
        title: 'Design database schema',
        priority: 'medium',
        assignee: 'Jane Smith',
        dueDate: '2024-12-25',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      tableId: 'test-table',
      data: {
        status: 'review',
        title: 'Write API documentation',
        priority: 'low',
        assignee: 'Bob Wilson',
        dueDate: '2024-12-28',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      tableId: 'test-table',
      data: {
        status: 'done',
        title: 'Setup CI/CD pipeline',
        priority: 'high',
        assignee: 'Alice Brown',
        dueDate: '2024-12-20',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      tableId: 'test-table',
      data: {
        status: 'todo',
        title: 'Implement search functionality',
        priority: 'medium',
        assignee: 'John Doe',
        dueDate: '2025-01-05',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      tableId: 'test-table',
      data: {
        status: 'in_progress',
        title: 'Optimize database queries',
        priority: 'high',
        assignee: 'Jane Smith',
        dueDate: '2024-12-30',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const handleRecordMove = (recordId: string, newStatus: string) => {
    console.log(`Moving record ${recordId} to ${newStatus}`);

    // Update local state optimistically
    const updatedRecords = mockRecords.map((record) => {
      if (record.id === recordId) {
        return {
          ...record,
          data: {
            ...record.data,
            status: newStatus,
          },
        };
      }
      return record;
    });

    // In real app, you would call API here:
    // updateRecordMutation.mutate({
    //   recordId,
    //   fieldName: 'status',
    //   newValue: newStatus
    // });

    console.log('Updated records:', updatedRecords);
    alert(
      `Record ${recordId} moved to ${newStatus}\n\nIn production, this would call:\nPOST /api/workspace/{workspaceId}/workflow/update_record_field/active_tables`,
    );
  };

  const handleRecordClick = (record: TableRecord) => {
    console.log('Clicked on record:', record);
    alert(`Clicked on: ${record.data.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Kanban Board V2 Test</h1>

        <KanbanBoardV2
          records={mockRecords}
          config={mockTable.config}
          onRecordMove={handleRecordMove}
          onRecordClick={handleRecordClick}
          loading={false}
          readOnly={false}
          table={mockTable}
          messages={{
            loading: 'Loading...',
            error: 'Error',
            noRecords: 'No records',
          }}
        />
      </div>
    </div>
  );
}
