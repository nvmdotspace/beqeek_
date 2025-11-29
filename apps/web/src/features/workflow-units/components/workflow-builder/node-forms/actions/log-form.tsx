/**
 * LogForm - Log/debug output configuration
 *
 * Configures message, level, and optional context data.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';
import { ValueBuilder } from '../../../value-builder';

interface LogFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function LogForm({ data, onUpdate }: LogFormProps) {
  const name = (data.name as string) || 'log';
  const message = (data.message as string) || '';
  const level = (data.level as string) || 'info';
  const context = typeof data.context === 'string' ? data.context : JSON.stringify(data.context || {}, null, 2);

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="log-name" description="Unique identifier for this step" required>
        <Input id="log-name" value={name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="log" />
      </FormField>

      <FormField label="Message" htmlFor="log-message" description="Log message with variable support" required>
        <Input
          id="log-message"
          value={message}
          onChange={(e) => onUpdate({ message: e.target.value })}
          placeholder="Processing order $[trigger.order_id]..."
        />
      </FormField>

      <FormField label="Level" htmlFor="log-level" description="Log severity level" required>
        <Select value={level} onValueChange={(value) => onUpdate({ level: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="debug">Debug</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Context" htmlFor="log-context" description="Additional data to include in log">
        <ValueBuilder value={context} onChange={(value) => onUpdate({ context: value })} mode="object" />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Log levels:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <span className="text-blue-500">debug</span> - Development details
          </li>
          <li>
            <span className="text-green-500">info</span> - General information
          </li>
          <li>
            <span className="text-yellow-500">warning</span> - Potential issues
          </li>
          <li>
            <span className="text-red-500">error</span> - Error conditions
          </li>
        </ul>
      </div>
    </div>
  );
}
