/**
 * GoogleSheetForm - Google Sheets operations
 *
 * Configures spreadsheet ID, range, and operation type.
 */

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface GoogleSheetFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function GoogleSheetForm({ data, onUpdate }: GoogleSheetFormProps) {
  const name = (data.name as string) || 'google_sheet';
  const connector = (data.connector as string) || '';
  const spreadsheetId = (data.spreadsheetId as string) || '';
  const sheetName = (data.sheetName as string) || '';
  const operation = (data.operation as string) || 'read';
  const range = (data.range as string) || '';
  const values = (data.values as string) || '';

  const showValues = operation === 'write' || operation === 'append' || operation === 'update';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="sheet-name" description="Unique identifier for this step" required>
        <Input
          id="sheet-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="google_sheet"
        />
      </FormField>

      <FormField
        label="Google Sheets Connector"
        htmlFor="sheet-connector"
        description="Connector ID for Google authentication"
      >
        <Input
          id="sheet-connector"
          value={connector}
          onChange={(e) => onUpdate({ connector: e.target.value })}
          placeholder="Enter connector ID"
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Spreadsheet ID"
        htmlFor="sheet-spreadsheet-id"
        description="ID from the spreadsheet URL"
        required
      >
        <Input
          id="sheet-spreadsheet-id"
          value={spreadsheetId}
          onChange={(e) => onUpdate({ spreadsheetId: e.target.value })}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
          className="font-mono text-sm"
        />
      </FormField>

      <FormField label="Sheet Name" htmlFor="sheet-sheet-name" description="Tab name within the spreadsheet">
        <Input
          id="sheet-sheet-name"
          value={sheetName}
          onChange={(e) => onUpdate({ sheetName: e.target.value })}
          placeholder="Sheet1"
        />
      </FormField>

      <FormField label="Operation" htmlFor="sheet-operation" description="Type of operation to perform" required>
        <Select value={operation} onValueChange={(value) => onUpdate({ operation: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="append">Append</SelectItem>
            <SelectItem value="update">Update</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Range" htmlFor="sheet-range" description="Cell range in A1 notation">
        <Input
          id="sheet-range"
          value={range}
          onChange={(e) => onUpdate({ range: e.target.value })}
          placeholder="A1:D10"
          className="font-mono"
        />
      </FormField>

      {showValues && (
        <FormField
          label="Values (CSV)"
          htmlFor="sheet-values"
          description="Data to write (one row per line, comma-separated)"
        >
          <Textarea
            id="sheet-values"
            value={values}
            onChange={(e) => onUpdate({ values: e.target.value })}
            placeholder="Name,Email,Phone&#10;John,john@example.com,0901234567"
            className="font-mono text-sm min-h-[100px]"
          />
        </FormField>
      )}
    </div>
  );
}
