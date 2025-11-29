/**
 * TableCommentCreateForm - Create comment on table record
 *
 * Configures table connector, record ID, and comment content.
 */

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { FormField } from '../form-field';

interface TableCommentCreateFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function TableCommentCreateForm({ data, onUpdate }: TableCommentCreateFormProps) {
  const name = (data.name as string) || 'create_comment';
  const connector = (data.connector as string) || '';
  const recordId = (data.recordId as string) || '';
  const content = (data.content as string) || '';
  const parentId = (data.parentId as string) || '';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="comment-name" description="Unique identifier for this step" required>
        <Input
          id="comment-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="create_comment"
        />
      </FormField>

      <FormField
        label="Table Connector"
        htmlFor="comment-connector"
        description="Snowflake ID of the Active Table"
        required
      >
        <Input
          id="comment-connector"
          value={connector}
          onChange={(e) => onUpdate({ connector: e.target.value })}
          placeholder="Enter table ID"
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Record ID"
        htmlFor="comment-record-id"
        description="Record to attach comment to, e.g. $[trigger.record_id]"
        required
      >
        <Input
          id="comment-record-id"
          value={recordId}
          onChange={(e) => onUpdate({ recordId: e.target.value })}
          placeholder="$[trigger.record_id]"
          className="font-mono"
        />
      </FormField>

      <FormField label="Comment Content" htmlFor="comment-content" description="The comment text to create" required>
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter comment content..."
          className="min-h-[100px]"
        />
      </FormField>

      <FormField
        label="Parent Comment ID (Optional)"
        htmlFor="comment-parent-id"
        description="For replies, specify the parent comment ID"
      >
        <Input
          id="comment-parent-id"
          value={parentId}
          onChange={(e) => onUpdate({ parentId: e.target.value })}
          placeholder="Leave empty for top-level comment"
          className="font-mono"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Result access:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>
            <code className="text-primary">$[{name}.id]</code> - Created comment ID
          </li>
          <li>
            <code className="text-primary">$[{name}.created_at]</code> - Creation timestamp
          </li>
        </ul>
      </div>
    </div>
  );
}
