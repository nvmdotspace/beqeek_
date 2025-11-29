/**
 * NodeFormRouter - Routes to appropriate form based on node type
 *
 * Central dispatcher for all node configuration forms.
 */

import type { Node } from '@xyflow/react';
import type { NodeType } from '../../../utils/node-types';

// Trigger forms
import { TriggerScheduleForm } from './triggers/trigger-schedule-form';
import { TriggerWebhookForm } from './triggers/trigger-webhook-form';
import { TriggerFormForm } from './triggers/trigger-form-form';
import { TriggerTableForm } from './triggers/trigger-table-form';

// Action forms
import { TableOperationForm } from './actions/table-operation-form';
import { TableCommentCreateForm } from './actions/table-comment-create-form';
import { TableCommentGetOneForm } from './actions/table-comment-get-one-form';
import { SmtpEmailForm } from './actions/smtp-email-form';
import { GoogleSheetForm } from './actions/google-sheet-form';
import { ApiCallForm } from './actions/api-call-form';
import { UserOperationForm } from './actions/user-operation-form';
import { DelayForm } from './actions/delay-form';
import { LogForm } from './actions/log-form';

// Logic forms
import { ConditionForm } from './logic/condition-form';
import { MatchForm } from './logic/match-form';
import { LoopForm } from './logic/loop-form';
import { MathForm } from './logic/math-form';
import { DefinitionForm } from './logic/definition-form';
import { ObjectLookupForm } from './logic/object-lookup-form';

interface NodeFormRouterProps {
  node: Node;
  onUpdate: (data: Record<string, unknown>) => void;
}

/**
 * Routes to the appropriate form component based on node type
 */
export function NodeFormRouter({ node, onUpdate }: NodeFormRouterProps) {
  const nodeType = node.type as NodeType;

  switch (nodeType) {
    // Triggers
    case 'trigger_schedule':
      return <TriggerScheduleForm data={node.data} onUpdate={onUpdate} />;
    case 'trigger_webhook':
      return <TriggerWebhookForm data={node.data} onUpdate={onUpdate} />;
    case 'trigger_form':
      return <TriggerFormForm data={node.data} onUpdate={onUpdate} />;
    case 'trigger_table':
      return <TriggerTableForm data={node.data} onUpdate={onUpdate} />;

    // Actions
    case 'table_operation':
      return <TableOperationForm data={node.data} onUpdate={onUpdate} />;
    case 'table_comment_create':
      return <TableCommentCreateForm data={node.data} onUpdate={onUpdate} />;
    case 'table_comment_get_one':
      return <TableCommentGetOneForm data={node.data} onUpdate={onUpdate} />;
    case 'smtp_email':
      return <SmtpEmailForm data={node.data} onUpdate={onUpdate} />;
    case 'google_sheet':
      return <GoogleSheetForm data={node.data} onUpdate={onUpdate} />;
    case 'api_call':
      return <ApiCallForm data={node.data} onUpdate={onUpdate} />;
    case 'user_operation':
      return <UserOperationForm data={node.data} onUpdate={onUpdate} />;
    case 'delay':
      return <DelayForm data={node.data} onUpdate={onUpdate} />;
    case 'log':
      return <LogForm data={node.data} onUpdate={onUpdate} />;

    // Logic
    case 'condition':
    case 'compound_condition':
      return <ConditionForm data={node.data} onUpdate={onUpdate} />;
    case 'match':
      return <MatchForm data={node.data} onUpdate={onUpdate} />;
    case 'loop':
    case 'compound_loop':
      return <LoopForm data={node.data} onUpdate={onUpdate} />;
    case 'math':
      return <MathForm data={node.data} onUpdate={onUpdate} />;
    case 'definition':
      return <DefinitionForm data={node.data} onUpdate={onUpdate} />;
    case 'object_lookup':
      return <ObjectLookupForm data={node.data} onUpdate={onUpdate} />;
    case 'log_logic':
      return <LogForm data={node.data} onUpdate={onUpdate} />;

    default:
      return (
        <div className="p-4 text-sm text-muted-foreground">No configuration form available for this node type.</div>
      );
  }
}

export { FormField } from './form-field';
