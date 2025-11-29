/**
 * TableCommentGetOneForm - Get a specific comment from table record
 *
 * Configures table connector, record ID, and comment ID.
 */

import { Input } from '@workspace/ui/components/input';
import { FormField } from '../form-field';

interface TableCommentGetOneFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function TableCommentGetOneForm({ data, onUpdate }: TableCommentGetOneFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'get_comment';
  const connector = (config.connector as string) || '';
  const recordId = (config.recordId as string) || '';
  const commentId = (config.commentId as string) || '';

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="comment-name" description="Unique identifier for this step" required>
        <Input
          id="comment-name"
          value={name}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="get_comment"
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
          onChange={(e) => updateConfig({ connector: e.target.value })}
          placeholder="Enter table ID"
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Record ID"
        htmlFor="comment-record-id"
        description="Record containing the comment, e.g. $[trigger.record_id]"
        required
      >
        <Input
          id="comment-record-id"
          value={recordId}
          onChange={(e) => updateConfig({ recordId: e.target.value })}
          placeholder="$[trigger.record_id]"
          className="font-mono"
        />
      </FormField>

      <FormField label="Comment ID" htmlFor="comment-id" description="ID of the comment to retrieve" required>
        <Input
          id="comment-id"
          value={commentId}
          onChange={(e) => updateConfig({ commentId: e.target.value })}
          placeholder="$[trigger.comment_id]"
          className="font-mono"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Result access:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>
            <code className="text-primary">$[{name}.content]</code> - Comment text
          </li>
          <li>
            <code className="text-primary">$[{name}.author_id]</code> - Author ID
          </li>
          <li>
            <code className="text-primary">$[{name}.created_at]</code> - Creation time
          </li>
          <li>
            <code className="text-primary">$[{name}.parent_id]</code> - Parent comment ID
          </li>
        </ul>
      </div>
    </div>
  );
}
