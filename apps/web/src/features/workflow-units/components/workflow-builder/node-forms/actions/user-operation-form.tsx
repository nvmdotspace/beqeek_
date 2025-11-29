/**
 * UserOperationForm - User CRUD operations
 *
 * Configures user action type and target user.
 */

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface UserOperationFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function UserOperationForm({ data, onUpdate }: UserOperationFormProps) {
  const name = (data.name as string) || 'user_op';
  const action = (data.action as string) || 'get';
  const userId = (data.userId as string) || '';
  const query = typeof data.query === 'string' ? data.query : JSON.stringify(data.query || {}, null, 2);
  const userData = typeof data.data === 'string' ? data.data : JSON.stringify(data.data || {}, null, 2);

  const showUserId = action === 'get' || action === 'update' || action === 'delete';
  const showQuery = action === 'get_list';
  const showData = action === 'create' || action === 'update';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="user-name" description="Unique identifier for this step" required>
        <Input id="user-name" value={name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="user_op" />
      </FormField>

      <FormField label="Action" htmlFor="user-action" description="User operation to perform" required>
        <Select value={action} onValueChange={(value) => onUpdate({ action: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="get_list">Get List</SelectItem>
            <SelectItem value="get">Get One</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {showUserId && (
        <FormField
          label="User ID"
          htmlFor="user-id"
          description="Target user identifier, e.g. $[trigger.user_id]"
          required
        >
          <Input
            id="user-id"
            value={userId}
            onChange={(e) => onUpdate({ userId: e.target.value })}
            placeholder="$[trigger.user_id]"
            className="font-mono"
          />
        </FormField>
      )}

      {showQuery && (
        <FormField label="Query (JSON)" htmlFor="user-query" description="Filter parameters for listing users">
          <Textarea
            id="user-query"
            value={query}
            onChange={(e) => onUpdate({ query: e.target.value })}
            placeholder={'{\n  "role": "admin"\n}'}
            className="font-mono text-sm min-h-[80px]"
          />
        </FormField>
      )}

      {showData && (
        <FormField label="Data (JSON)" htmlFor="user-data" description="User data for create/update" required>
          <Textarea
            id="user-data"
            value={userData}
            onChange={(e) => onUpdate({ data: e.target.value })}
            placeholder={'{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'}
            className="font-mono text-sm min-h-[100px]"
          />
        </FormField>
      )}
    </div>
  );
}
