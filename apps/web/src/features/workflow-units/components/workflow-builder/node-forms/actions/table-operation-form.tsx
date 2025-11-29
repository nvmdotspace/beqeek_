/**
 * TableOperationForm - Active Table CRUD operations
 *
 * Configures table connector and action type.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';
import { ValueBuilder } from '../../../value-builder';

interface TableOperationFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function TableOperationForm({ data, onUpdate }: TableOperationFormProps) {
  const name = (data.name as string) || 'table_op';
  const connector = (data.connector as string) || '';
  const action = (data.action as string) || 'get_list';
  const record = (data.record as string) || '';
  const query = (data.query as string) || '';
  const dataField = typeof data.data === 'string' ? data.data : JSON.stringify(data.data || {}, null, 2);

  const showRecord = action === 'get_one' || action === 'update' || action === 'delete';
  const showQuery = action === 'get_list';
  const showData = action === 'create' || action === 'update';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="table-name" description="Unique identifier for this step" required>
        <Input
          id="table-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="table_op"
        />
      </FormField>

      <FormField
        label="Table Connector"
        htmlFor="table-connector"
        description="Snowflake ID of the Active Table"
        required
      >
        <Input
          id="table-connector"
          value={connector}
          onChange={(e) => onUpdate({ connector: e.target.value })}
          placeholder="Enter table ID"
          className="font-mono"
        />
      </FormField>

      <FormField label="Action" htmlFor="table-action" description="CRUD operation to perform" required>
        <Select value={action} onValueChange={(value) => onUpdate({ action: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="get_list">Get List</SelectItem>
            <SelectItem value="get_one">Get One</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {showRecord && (
        <FormField
          label="Record ID"
          htmlFor="table-record"
          description="Record identifier, e.g. $[trigger.record_id]"
          required
        >
          <Input
            id="table-record"
            value={record}
            onChange={(e) => onUpdate({ record: e.target.value })}
            placeholder="$[trigger.record_id]"
            className="font-mono"
          />
        </FormField>
      )}

      {showQuery && (
        <FormField label="Query" htmlFor="table-query" description="Filter and sort parameters">
          <ValueBuilder value={query} onChange={(value) => onUpdate({ query: value })} mode="object" />
        </FormField>
      )}

      {showData && (
        <FormField label="Data" htmlFor="table-data" description="Record data to create/update" required>
          <ValueBuilder value={dataField} onChange={(value) => onUpdate({ data: value })} mode="object" />
        </FormField>
      )}
    </div>
  );
}
