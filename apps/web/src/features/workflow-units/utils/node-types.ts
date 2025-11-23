/**
 * Node type definitions for React Flow workflow builder
 * Maps to YAML block types from workflow-units-functional-spec.md
 */

export type NodeType =
  // Triggers (4)
  | 'trigger_schedule'
  | 'trigger_webhook'
  | 'trigger_form'
  | 'trigger_table'
  // Actions (7)
  | 'table_operation'
  | 'smtp_email'
  | 'google_sheet'
  | 'api_call'
  | 'user_operation'
  | 'delay'
  | 'log'
  // Logic (6)
  | 'condition'
  | 'match'
  | 'loop'
  | 'math'
  | 'definition'
  | 'log_logic'; // Separate log for logic category

export interface BaseNodeData {
  name: string;
  label?: string;
}

// Trigger Node Data Types
export interface TriggerScheduleData extends BaseNodeData {
  expression: string; // Cron expression (e.g., "*/5 * * * *")
}

export interface TriggerWebhookData extends BaseNodeData {
  webhookId: string; // UUID for webhook URL
}

export interface TriggerFormData extends BaseNodeData {
  formId: string; // Snowflake ID from Workflow Forms
  webhookId: string;
  actionId?: string;
}

export interface TriggerTableData extends BaseNodeData {
  tableId: string; // Snowflake ID from Active Tables
  actionId: string; // UUID for table action
  webhookId: string;
}

// Action Node Data Types
export interface TableOperationData extends BaseNodeData {
  connector: string; // Table ID
  action: 'get_list' | 'get_one' | 'create' | 'update' | 'delete';
  config?: Record<string, unknown>;
}

export interface SmtpEmailData extends BaseNodeData {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export interface GoogleSheetData extends BaseNodeData {
  spreadsheetId: string;
  sheetName: string;
  operation: 'read' | 'write' | 'append' | 'update';
  range?: string;
  values?: unknown[][];
}

export interface ApiCallData extends BaseNodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface UserOperationData extends BaseNodeData {
  action: 'get' | 'create' | 'update' | 'delete';
  userId?: string;
  data?: Record<string, unknown>;
}

export interface DelayData extends BaseNodeData {
  duration: number; // Milliseconds
  unit?: 'ms' | 's' | 'm' | 'h';
}

export interface LogData extends BaseNodeData {
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  context?: Record<string, unknown>;
}

// Logic Node Data Types
export interface ConditionData extends BaseNodeData {
  condition: string; // Expression to evaluate
  thenBlocks?: unknown[]; // Nested blocks for true branch
  elseBlocks?: unknown[]; // Nested blocks for false branch
}

export interface MatchData extends BaseNodeData {
  value: string; // Value to match against
  cases: Array<{
    pattern: string;
    blocks?: unknown[];
  }>;
  defaultBlocks?: unknown[];
}

export interface LoopData extends BaseNodeData {
  collection: string; // Variable/expression for array
  itemVar?: string; // Variable name for each item
  blocks?: unknown[]; // Blocks to execute in loop
}

export interface MathData extends BaseNodeData {
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'mod';
  operands: string[]; // Variable references or literal values
  result?: string; // Variable to store result
}

export interface DefinitionData extends BaseNodeData {
  variables: Record<string, unknown>; // Variable definitions
}

// Union type for all node data
export type WorkflowNodeData =
  | TriggerScheduleData
  | TriggerWebhookData
  | TriggerFormData
  | TriggerTableData
  | TableOperationData
  | SmtpEmailData
  | GoogleSheetData
  | ApiCallData
  | UserOperationData
  | DelayData
  | LogData
  | ConditionData
  | MatchData
  | LoopData
  | MathData
  | DefinitionData;

// Node categories for palette organization
export type NodeCategory = 'trigger' | 'action' | 'logic';

export interface NodeDefinition {
  type: NodeType;
  label: string;
  category: NodeCategory;
  icon: string; // Lucide icon name
  description: string;
  defaultData: Partial<WorkflowNodeData>;
}

// Node palette definitions
export const NODE_DEFINITIONS: NodeDefinition[] = [
  // Triggers
  {
    type: 'trigger_schedule',
    label: 'Schedule',
    category: 'trigger',
    icon: 'Clock',
    description: 'Run workflow on a schedule (cron)',
    defaultData: { name: 'schedule_trigger', expression: '0 * * * *' },
  },
  {
    type: 'trigger_webhook',
    label: 'Webhook',
    category: 'trigger',
    icon: 'Webhook',
    description: 'Trigger via HTTP webhook',
    defaultData: { name: 'webhook_trigger', webhookId: '' },
  },
  {
    type: 'trigger_form',
    label: 'Form Submit',
    category: 'trigger',
    icon: 'FileText',
    description: 'Trigger when form is submitted',
    defaultData: { name: 'form_trigger', formId: '', webhookId: '' },
  },
  {
    type: 'trigger_table',
    label: 'Table Action',
    category: 'trigger',
    icon: 'Table',
    description: 'Trigger on table action',
    defaultData: { name: 'table_trigger', tableId: '', actionId: '', webhookId: '' },
  },

  // Actions
  {
    type: 'table_operation',
    label: 'Table Operation',
    category: 'action',
    icon: 'Database',
    description: 'CRUD operations on Active Tables',
    defaultData: { name: 'table_op', connector: '', action: 'get_list' },
  },
  {
    type: 'smtp_email',
    label: 'Send Email',
    category: 'action',
    icon: 'Mail',
    description: 'Send email via SMTP',
    defaultData: { name: 'send_email', to: '', subject: '', body: '' },
  },
  {
    type: 'google_sheet',
    label: 'Google Sheet',
    category: 'action',
    icon: 'Sheet',
    description: 'Read/write Google Sheets',
    defaultData: { name: 'google_sheet', spreadsheetId: '', sheetName: '', operation: 'read' },
  },
  {
    type: 'api_call',
    label: 'API Call',
    category: 'action',
    icon: 'Globe',
    description: 'Make HTTP API request',
    defaultData: { name: 'api_call', method: 'GET', url: '' },
  },
  {
    type: 'user_operation',
    label: 'User Operation',
    category: 'action',
    icon: 'User',
    description: 'User CRUD operations',
    defaultData: { name: 'user_op', action: 'get' },
  },
  {
    type: 'delay',
    label: 'Delay',
    category: 'action',
    icon: 'Timer',
    description: 'Wait for specified duration',
    defaultData: { name: 'delay', duration: 1000, unit: 's' },
  },
  {
    type: 'log',
    label: 'Log',
    category: 'action',
    icon: 'FileText',
    description: 'Write to log',
    defaultData: { name: 'log', message: '', level: 'info' },
  },

  // Logic
  {
    type: 'condition',
    label: 'Condition',
    category: 'logic',
    icon: 'GitBranch',
    description: 'If/then/else branching',
    defaultData: { name: 'condition', condition: '' },
  },
  {
    type: 'match',
    label: 'Match',
    category: 'logic',
    icon: 'SplitSquareVertical',
    description: 'Switch/case pattern matching',
    defaultData: { name: 'match', value: '', cases: [] },
  },
  {
    type: 'loop',
    label: 'Loop',
    category: 'logic',
    icon: 'Repeat',
    description: 'Iterate over collection',
    defaultData: { name: 'loop', collection: '', itemVar: 'item' },
  },
  {
    type: 'math',
    label: 'Math',
    category: 'logic',
    icon: 'Calculator',
    description: 'Mathematical operations',
    defaultData: { name: 'math', operation: 'add', operands: [] },
  },
  {
    type: 'definition',
    label: 'Variables',
    category: 'logic',
    icon: 'Variable',
    description: 'Define variables',
    defaultData: { name: 'definition', variables: {} },
  },
  {
    type: 'log_logic',
    label: 'Debug Log',
    category: 'logic',
    icon: 'Bug',
    description: 'Debug logging',
    defaultData: { name: 'debug_log', message: '', level: 'debug' },
  },
];
