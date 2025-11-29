/**
 * Workflow node components
 * All nodes use BaseWorkflowNode with different configurations
 */
import { type NodeProps } from '@xyflow/react';
import { BaseWorkflowNode } from './base-workflow-node';
import { CompoundConditionNode } from './compound-condition-node';
import { CompoundLoopNode } from './compound-loop-node';
import { MergeNode } from './merge-node';
import type {
  TriggerScheduleData,
  TriggerWebhookData,
  TriggerFormData,
  TriggerTableData,
  TableOperationData,
  TableCommentCreateData,
  TableCommentGetOneData,
  SmtpEmailData,
  GoogleSheetData,
  ApiCallData,
  UserOperationData,
  DelayData,
  LogData,
  ConditionData,
  MatchData,
  LoopData,
  MathData,
  DefinitionData,
  ObjectLookupData,
} from '../../../utils/node-types';

// Trigger Nodes
export const TriggerScheduleNode = (props: NodeProps) => {
  const data = props.data as unknown as TriggerScheduleData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Clock"
      category="trigger"
      label="Schedule Trigger"
      summary={data.expression || '* * * * *'}
    />
  );
};

export const TriggerWebhookNode = (props: NodeProps) => {
  const data = props.data as unknown as TriggerWebhookData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Webhook"
      category="trigger"
      label="Webhook Trigger"
      summary={data.webhookId ? `ID: ${data.webhookId.slice(0, 8)}...` : 'Not configured'}
    />
  );
};

export const TriggerFormNode = (props: NodeProps) => {
  const data = props.data as unknown as TriggerFormData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="FileText"
      category="trigger"
      label="Form Submit Trigger"
      summary={data.formId ? `Form: ${data.formId.slice(0, 12)}...` : 'Not configured'}
    />
  );
};

export const TriggerTableNode = (props: NodeProps) => {
  const data = props.data as unknown as TriggerTableData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Table"
      category="trigger"
      label="Table Action Trigger"
      summary={data.tableId ? `Table: ${data.tableId.slice(0, 12)}...` : 'Not configured'}
    />
  );
};

// Action Nodes
export const TableOperationNode = (props: NodeProps) => {
  const data = props.data as unknown as TableOperationData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Database"
      category="action"
      label="Table Operation"
      summary={`${data.action || 'get_list'}`}
    />
  );
};

export const TableCommentCreateNode = (props: NodeProps) => {
  const data = props.data as unknown as TableCommentCreateData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="MessageSquarePlus"
      category="action"
      label="Create Comment"
      summary={data.content ? data.content.slice(0, 30) + '...' : 'Not configured'}
    />
  );
};

export const TableCommentGetOneNode = (props: NodeProps) => {
  const data = props.data as unknown as TableCommentGetOneData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="MessageSquare"
      category="action"
      label="Get Comment"
      summary={data.commentId ? `ID: ${data.commentId.slice(0, 12)}...` : 'Not configured'}
    />
  );
};

export const SmtpEmailNode = (props: NodeProps) => {
  const data = props.data as unknown as SmtpEmailData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Mail"
      category="action"
      label="Send Email"
      summary={data.to ? `To: ${data.to}` : 'Not configured'}
    />
  );
};

export const GoogleSheetNode = (props: NodeProps) => {
  const data = props.data as unknown as GoogleSheetData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Sheet"
      category="action"
      label="Google Sheet"
      summary={`${data.operation || 'read'}: ${data.sheetName || 'Sheet1'}`}
    />
  );
};

export const ApiCallNode = (props: NodeProps) => {
  const data = props.data as unknown as ApiCallData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Globe"
      category="action"
      label="API Call"
      summary={`${data.method || 'GET'} ${data.url || ''}`}
    />
  );
};

export const UserOperationNode = (props: NodeProps) => {
  const data = props.data as unknown as UserOperationData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="User"
      category="action"
      label="User Operation"
      summary={data.action || 'get'}
    />
  );
};

export const DelayNode = (props: NodeProps) => {
  const data = props.data as unknown as DelayData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Timer"
      category="action"
      label="Delay"
      summary={`${data.duration || 0}${data.unit || 'ms'}`}
    />
  );
};

export const LogNode = (props: NodeProps) => {
  const data = props.data as unknown as LogData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="FileText"
      category="action"
      label="Log"
      summary={`[${data.level || 'info'}] ${data.message || ''}`}
    />
  );
};

// Logic Nodes
export const ConditionNode = (props: NodeProps) => {
  const data = props.data as unknown as ConditionData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="GitBranch"
      category="logic"
      label="Condition"
      summary={data.condition || 'No condition set'}
    />
  );
};

export const MatchNode = (props: NodeProps) => {
  const data = props.data as unknown as MatchData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="SplitSquareVertical"
      category="logic"
      label="Match"
      summary={`${data.cases?.length || 0} cases`}
    />
  );
};

export const LoopNode = (props: NodeProps) => {
  const data = props.data as unknown as LoopData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Repeat"
      category="logic"
      label="Loop"
      summary={`forEach ${data.itemVar || 'item'} in ${data.collection || '[]'}`}
    />
  );
};

export const MathNode = (props: NodeProps) => {
  const data = props.data as unknown as MathData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Calculator"
      category="logic"
      label="Math"
      summary={data.operation || 'add'}
    />
  );
};

export const DefinitionNode = (props: NodeProps) => {
  const data = props.data as unknown as DefinitionData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Variable"
      category="logic"
      label="Variables"
      summary={`${Object.keys(data.variables || {}).length} vars`}
    />
  );
};

export const ObjectLookupNode = (props: NodeProps) => {
  const data = props.data as unknown as ObjectLookupData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Search"
      category="logic"
      label="Object Lookup"
      summary={data.key ? `${data.object || 'obj'}.${data.key}` : 'Not configured'}
    />
  );
};

export const LogLogicNode = (props: NodeProps) => {
  const data = props.data as unknown as LogData;
  return (
    <BaseWorkflowNode
      {...props}
      data={data}
      icon="Bug"
      category="logic"
      label="Debug Log"
      summary={`[${data.level || 'debug'}] ${data.message || ''}`}
    />
  );
};

// Node registry for React Flow
export const NODE_TYPES = {
  // Trigger nodes
  trigger_schedule: TriggerScheduleNode,
  trigger_webhook: TriggerWebhookNode,
  trigger_form: TriggerFormNode,
  trigger_table: TriggerTableNode,

  // Action nodes
  table_operation: TableOperationNode,
  table_comment_create: TableCommentCreateNode,
  table_comment_get_one: TableCommentGetOneNode,
  smtp_email: SmtpEmailNode,
  google_sheet: GoogleSheetNode,
  api_call: ApiCallNode,
  user_operation: UserOperationNode,
  delay: DelayNode,
  log: LogNode,

  // Logic nodes (simple mode)
  condition: ConditionNode,
  match: MatchNode,
  loop: LoopNode,
  math: MathNode,
  definition: DefinitionNode,
  object_lookup: ObjectLookupNode,
  log_logic: LogLogicNode,

  // Compound nodes (for nested blocks)
  compound_condition: CompoundConditionNode,
  compound_loop: CompoundLoopNode,

  // Merge node (for branch rejoining)
  merge: MergeNode,
};
