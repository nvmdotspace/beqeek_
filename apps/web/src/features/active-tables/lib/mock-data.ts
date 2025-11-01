/**
 * Mock data generator for Active Tables UI preview
 *
 * This file generates realistic mock data for testing and previewing
 * Record Detail, Kanban, and Gantt views
 */

import type { TableConfig, KanbanConfig, GanttConfig, RecordDetailConfig } from '@workspace/active-tables-core';
import type { TableRecord } from '@workspace/active-tables-core';
import type { FieldConfig } from '@workspace/active-tables-core';

/**
 * Generate a mock table config with all features enabled
 */
export function generateMockTableConfig(): TableConfig {
  return {
    title: 'Project Tasks - BEQEEK',
    e2eeEncryption: false,
    encryptionAuthKey: '',
    hashedKeywordFields: [],
    tableLimit: 100,
    defaultSort: 'desc',
    fields: generateMockFields(),
    actions: [
      {
        actionId: 'create',
        name: 'Create',
        type: 'create',
        icon: 'plus',
      },
      {
        actionId: 'update',
        name: 'Update',
        type: 'update',
        icon: 'edit',
      },
    ],
    quickFilters: [{ fieldName: 'status' }],
    kanbanConfigs: [generateMockKanbanConfig()],
    ganttCharts: [generateMockGanttConfig()],
    recordListConfig: {
      layout: 'table',
      titleField: 'task_title',
      subLineFields: ['assignee', 'status'],
      tailFields: ['duo_date'],
    },
    recordDetailConfig: generateMockRecordDetailConfig('two-column-detail'),
    permissionsConfig: [],
  };
}

/**
 * Generate mock field definitions
 */
export function generateMockFields(): FieldConfig[] {
  return [
    {
      type: 'SHORT_TEXT',
      label: 'Task Title',
      name: 'task_title',
      placeholder: 'Enter task title',
      required: true,
    },
    {
      type: 'RICH_TEXT',
      label: 'Task Description',
      name: 'task_description',
      placeholder: 'Describe the task',
      required: false,
    },
    {
      type: 'SELECT_ONE',
      label: 'Status',
      name: 'status',
      placeholder: 'Select status',
      required: true,
      options: [
        {
          value: 'todo',
          text: 'To Do',
          text_color: '#ffffff',
          background_color: '#6b7280',
        },
        {
          value: 'in_progress',
          text: 'In Progress',
          text_color: '#ffffff',
          background_color: '#3b82f6',
        },
        {
          value: 'review',
          text: 'In Review',
          text_color: '#ffffff',
          background_color: '#f59e0b',
        },
        {
          value: 'done',
          text: 'Done',
          text_color: '#ffffff',
          background_color: '#10b981',
        },
      ],
    },
    {
      type: 'SELECT_ONE',
      label: 'Priority',
      name: 'priority',
      placeholder: 'Select priority',
      required: false,
      options: [
        {
          value: 'low',
          text: 'Low',
          text_color: '#ffffff',
          background_color: '#6b7280',
        },
        {
          value: 'medium',
          text: 'Medium',
          text_color: '#ffffff',
          background_color: '#f59e0b',
        },
        {
          value: 'high',
          text: 'High',
          text_color: '#ffffff',
          background_color: '#ef4444',
        },
      ],
    },
    {
      type: 'SELECT_ONE',
      label: 'Matrix Quadrant',
      name: 'matrix_quadrant',
      placeholder: 'Select quadrant',
      required: false,
      options: [
        {
          value: 'important_urgent',
          text: 'Important & Urgent',
          text_color: '#ffffff',
          background_color: '#ef4444',
        },
        {
          value: 'important_not_urgent',
          text: 'Important, Not Urgent',
          text_color: '#ffffff',
          background_color: '#f59e0b',
        },
        {
          value: 'not_important_urgent',
          text: 'Not Important, Urgent',
          text_color: '#ffffff',
          background_color: '#3b82f6',
        },
        {
          value: 'not_important_not_urgent',
          text: 'Not Important, Not Urgent',
          text_color: '#ffffff',
          background_color: '#6b7280',
        },
      ],
    },
    {
      type: 'SHORT_TEXT',
      label: 'Assignee',
      name: 'assignee',
      placeholder: 'Assign to...',
      required: false,
    },
    {
      type: 'DATETIME',
      label: 'Start Date',
      name: 'start_date',
      placeholder: 'Select start date',
      required: false,
    },
    {
      type: 'DATETIME',
      label: 'Due Date',
      name: 'duo_date',
      placeholder: 'Select due date',
      required: false,
    },
    {
      type: 'INTEGER',
      label: 'Progress (%)',
      name: 'progress',
      placeholder: '0-100',
      required: false,
    },
    {
      type: 'TEXT',
      label: 'Self Evaluation',
      name: 'self_evaluation',
      placeholder: 'Reflect on your work',
      required: false,
    },
  ];
}

/**
 * Generate mock Kanban configuration
 */
export function generateMockKanbanConfig(): KanbanConfig {
  return {
    kanbanScreenId: 'kanban-1',
    screenName: 'Task Progress Board',
    screenDescription: 'Track tasks by status',
    statusField: 'status',
    kanbanHeadlineField: 'task_title',
    displayFields: ['assignee', 'duo_date', 'priority'],
  };
}

/**
 * Generate mock Gantt configuration
 */
export function generateMockGanttConfig(): GanttConfig {
  return {
    ganttScreenId: 'gantt-1',
    screenName: 'Project Timeline',
    screenDescription: 'View tasks on a timeline',
    taskNameField: 'task_title',
    startDateField: 'start_date',
    endDateField: 'duo_date',
    progressField: 'progress',
  };
}

/**
 * Generate mock Record Detail configuration
 */
export function generateMockRecordDetailConfig(
  layout: 'head-detail' | 'two-column-detail' = 'two-column-detail',
): RecordDetailConfig {
  if (layout === 'head-detail') {
    return {
      layout,
      commentsPosition: 'right-panel',
      titleField: 'task_title',
      subLineFields: ['matrix_quadrant', 'assignee', 'status'],
      tailFields: ['task_description', 'start_date', 'duo_date', 'progress', 'self_evaluation'],
    } as RecordDetailConfig;
  }

  return {
    layout,
    commentsPosition: 'right-panel',
    titleField: 'task_title',
    subLineFields: ['matrix_quadrant', 'assignee', 'status'],
    tailFields: [],
    column1Fields: ['task_description', 'start_date', 'duo_date'],
    column2Fields: ['progress', 'priority', 'self_evaluation'],
  } as RecordDetailConfig;
}

/**
 * Generate mock records for testing
 */
export function generateMockRecords(count: number = 12): TableRecord[] {
  const statuses = ['todo', 'in_progress', 'review', 'done'];
  const priorities = ['low', 'medium', 'high'];
  const assignees = ['Alice', 'Bob', 'Charlie', 'Diana'];
  const quadrants = ['important_urgent', 'important_not_urgent', 'not_important_urgent', 'not_important_not_urgent'];

  const baseDate = new Date('2025-11-01');

  const records: TableRecord[] = [];

  for (let i = 0; i < count; i++) {
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() + i * 3);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7 + Math.floor(Math.random() * 14));

    const statusIndex = Math.floor(Math.random() * statuses.length);
    const progress = statusIndex === 3 ? 100 : Math.floor(Math.random() * 80);

    records.push({
      id: `record-${i + 1}`,
      record: {
        task_title: `Task ${i + 1}: ${getTaskTitle(i)}`,
        task_description: `<p>${getTaskDescription(i)}</p>`,
        status: statuses[statusIndex],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        matrix_quadrant: quadrants[Math.floor(Math.random() * quadrants.length)],
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        start_date: startDate.toISOString(),
        duo_date: endDate.toISOString(),
        progress,
        self_evaluation: getSelfEvaluation(i),
      },
      createdAt: new Date(baseDate.getTime() - i * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: {
        access: true,
        update: true,
        delete: true,
      },
    });
  }

  return records;
}

/**
 * Generate varied task titles
 */
function getTaskTitle(index: number): string {
  const titles = [
    'Implement user authentication',
    'Design landing page',
    'Set up CI/CD pipeline',
    'Write API documentation',
    'Refactor database schema',
    'Add dark mode support',
    'Optimize image loading',
    'Create mobile responsive layout',
    'Implement search functionality',
    'Add unit tests',
    'Fix bug in payment flow',
    'Update dependencies',
  ];
  return titles[index % titles.length] || 'Generic task';
}

/**
 * Generate task descriptions
 */
function getTaskDescription(index: number): string {
  const descriptions = [
    'Complete the authentication flow with OAuth2 and JWT tokens. Ensure proper session management.',
    'Create an engaging landing page with modern design principles. Include hero section, features, and CTA.',
    'Configure GitHub Actions for automated testing and deployment to staging and production environments.',
    'Document all API endpoints with request/response examples. Use OpenAPI 3.0 specification.',
    'Optimize database indexes and normalize tables. Consider adding read replicas for better performance.',
    'Implement theme switching between light and dark modes. Persist user preference in localStorage.',
    'Use lazy loading and WebP format for images. Implement responsive images with srcset.',
    'Ensure all components work well on mobile devices. Test on various screen sizes.',
    'Add full-text search with filters. Consider using Elasticsearch for better performance.',
    'Write comprehensive unit tests with good coverage. Use Jest and React Testing Library.',
    'Fix the issue where payment confirmation emails are not sent. Check webhook configuration.',
    'Update all npm packages to their latest compatible versions. Test thoroughly after update.',
  ];
  return descriptions[index % descriptions.length] || 'Task description';
}

/**
 * Generate self evaluation text
 */
function getSelfEvaluation(index: number): string {
  const evaluations = [
    'Completed successfully with good code quality.',
    'Took longer than expected but delivered quality results.',
    'Met requirements and learned new techniques.',
    'Could have been optimized better.',
    'Excellent collaboration with the team.',
    '',
    'Faced some challenges but overcame them.',
    'Very satisfied with the outcome.',
    '',
    'Need to improve time estimation.',
  ];
  return evaluations[index % evaluations.length] || '';
}
