/**
 * TriggerScheduleForm - Schedule trigger configuration
 *
 * Configures cron expression for scheduled workflow execution.
 */

import { Input } from '@workspace/ui/components/input';
import { FormField } from '../form-field';

interface TriggerScheduleFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function TriggerScheduleForm({ data, onUpdate }: TriggerScheduleFormProps) {
  const expression = (data.expression as string) || '0 * * * *';
  const name = (data.name as string) || 'schedule_trigger';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="trigger-name" description="Unique identifier for this trigger" required>
        <Input
          id="trigger-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="schedule_trigger"
        />
      </FormField>

      <FormField
        label="Cron Expression"
        htmlFor="trigger-cron"
        description="Schedule format: minute hour day month weekday"
        required
      >
        <Input
          id="trigger-cron"
          value={expression}
          onChange={(e) => onUpdate({ expression: e.target.value })}
          placeholder="0 * * * *"
          className="font-mono"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Common patterns:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <code className="bg-background px-1 rounded">* * * * *</code> - Every minute
          </li>
          <li>
            <code className="bg-background px-1 rounded">0 * * * *</code> - Every hour
          </li>
          <li>
            <code className="bg-background px-1 rounded">0 0 * * *</code> - Daily at midnight
          </li>
          <li>
            <code className="bg-background px-1 rounded">0 9 * * 1-5</code> - Weekdays at 9am
          </li>
        </ul>
      </div>
    </div>
  );
}
