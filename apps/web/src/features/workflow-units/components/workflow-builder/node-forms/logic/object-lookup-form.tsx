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
  const name = (data.name as string) || 'lookup';
  const object = (data.object as string) || '';
  const key = (data.key as string) || '';
  const defaultValue = (data.defaultValue as string) || '';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="lookup-name" description="Unique identifier for this step" required>
        <Input
          id="lookup-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
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
          onChange={(e) => onUpdate({ object: e.target.value })}
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
          onChange={(e) => onUpdate({ key: e.target.value })}
          placeholder="user.profile.name"
          className="font-mono"
        />
      </FormField>

      <FormField label="Default Value" htmlFor="lookup-default" description="Value to use if key path not found">
        <Input
          id="lookup-default"
          value={defaultValue}
          onChange={(e) => onUpdate({ defaultValue: e.target.value })}
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
