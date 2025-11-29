/**
 * DelayForm - Delay/wait configuration
 *
 * Configures duration and optional target time for delayed execution.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface DelayFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function DelayForm({ data, onUpdate }: DelayFormProps) {
  // IR converter stores: data.label (name) and data.config.* (config fields)
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'delay';
  const durationValue = (config.durationValue as number) || (config.duration as number) || 1;
  const durationUnit = (config.durationUnit as string) || (config.unit as string) || 'seconds';
  const targetTime = (config.targetTime as string) || '';
  const callback = (config.callback as string) || '';

  // Helper to update config fields while preserving structure
  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="delay-name" description="Unique identifier for this step" required>
        <Input id="delay-name" value={name} onChange={(e) => onUpdate({ label: e.target.value })} placeholder="delay" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Duration" htmlFor="delay-duration" description="Wait time value" required>
          <Input
            id="delay-duration"
            type="number"
            min={0}
            value={durationValue}
            onChange={(e) => updateConfig({ durationValue: parseInt(e.target.value) || 0 })}
            placeholder="1"
          />
        </FormField>

        <FormField label="Unit" htmlFor="delay-unit" description="Time unit" required>
          <Select value={durationUnit} onValueChange={(value) => updateConfig({ durationUnit: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        label="Target Time (Optional)"
        htmlFor="delay-target"
        description="Specific time to wait until, e.g. $[trigger.scheduled_time]"
      >
        <Input
          id="delay-target"
          value={targetTime}
          onChange={(e) => updateConfig({ targetTime: e.target.value })}
          placeholder="2024-12-25T09:00:00Z"
          className="font-mono text-sm"
        />
      </FormField>

      <FormField label="Callback" htmlFor="delay-callback" description="Callback stage name to execute after delay">
        <Input
          id="delay-callback"
          value={callback}
          onChange={(e) => updateConfig({ callback: e.target.value })}
          placeholder="on_delay_complete"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">How delays work:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>Workflow pauses for specified duration</li>
          <li>Target time overrides duration if provided</li>
          <li>Callback runs the named stage after delay</li>
        </ul>
      </div>
    </div>
  );
}
