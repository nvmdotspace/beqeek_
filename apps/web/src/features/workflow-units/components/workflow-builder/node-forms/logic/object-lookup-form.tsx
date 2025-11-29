/**
 * ObjectLookupForm - Get value from object by key path
 *
 * Configures object expression, key path, and optional default value.
 */

import { Input } from '@workspace/ui/components/input';
import { FormField } from '../form-field';

interface ObjectLookupFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function ObjectLookupForm({ data, onUpdate }: ObjectLookupFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'lookup';
  const object = (config.object as string) || '';
  const key = (config.key as string) || '';
  const defaultValue = (config.defaultValue as string) || '';

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="lookup-name" description="Unique identifier for this step" required>
        <Input
          id="lookup-name"
          value={name}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="lookup"
        />
      </FormField>

      <FormField
        label="Object"
        htmlFor="lookup-object"
        description="Object to look up from, e.g. $[trigger.data]"
        required
      >
        <Input
          id="lookup-object"
          value={object}
          onChange={(e) => updateConfig({ object: e.target.value })}
          placeholder="$[trigger.data]"
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Key Path"
        htmlFor="lookup-key"
        description="Dot notation path to the value, e.g. user.profile.name"
        required
      >
        <Input
          id="lookup-key"
          value={key}
          onChange={(e) => updateConfig({ key: e.target.value })}
          placeholder="user.profile.name"
          className="font-mono"
        />
      </FormField>

      <FormField label="Default Value" htmlFor="lookup-default" description="Value to use if key path not found">
        <Input
          id="lookup-default"
          value={defaultValue}
          onChange={(e) => updateConfig({ defaultValue: e.target.value })}
          placeholder="null"
          className="font-mono"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Result access:</p>
        <p className="text-muted-foreground">
          Use <code className="text-primary">$[{name}.result]</code> to get the looked-up value
        </p>
        <p className="mt-2 font-medium">Example:</p>
        <p className="text-muted-foreground">
          Object: <code className="text-primary">$[api_call.response]</code>
          <br />
          Key: <code className="text-primary">data.items[0].id</code>
        </p>
      </div>
    </div>
  );
}
