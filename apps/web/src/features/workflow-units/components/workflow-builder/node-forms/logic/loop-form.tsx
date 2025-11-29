/**
 * LoopForm - Loop/iteration configuration
 *
 * Configures iteration over collections with variable binding.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface LoopFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function LoopForm({ data, onUpdate }: LoopFormProps) {
  const name = (data.name as string) || 'loop';
  const collection = (data.collection as string) || '';
  const iterator = (data.iterator as string) || 'item';
  const indexVar = (data.indexVar as string) || 'index';
  const mode = (data.mode as string) || 'sequential';
  const bodyStage = (data.bodyStage as string) || '';
  const maxIterations = (data.maxIterations as number) || 0;

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="loop-name" description="Unique identifier for this step" required>
        <Input id="loop-name" value={name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="loop" />
      </FormField>

      <FormField
        label="Collection"
        htmlFor="loop-collection"
        description="Array to iterate over, e.g. $[trigger.items]"
        required
      >
        <Input
          id="loop-collection"
          value={collection}
          onChange={(e) => onUpdate({ collection: e.target.value })}
          placeholder="$[trigger.items]"
          className="font-mono"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Iterator Variable" htmlFor="loop-iterator" description="Current item variable" required>
          <Input
            id="loop-iterator"
            value={iterator}
            onChange={(e) => onUpdate({ iterator: e.target.value })}
            placeholder="item"
            className="font-mono"
          />
        </FormField>

        <FormField label="Index Variable" htmlFor="loop-index" description="Current index variable">
          <Input
            id="loop-index"
            value={indexVar}
            onChange={(e) => onUpdate({ indexVar: e.target.value })}
            placeholder="index"
            className="font-mono"
          />
        </FormField>
      </div>

      <FormField label="Execution Mode" htmlFor="loop-mode" description="How iterations are processed">
        <Select value={mode} onValueChange={(value) => onUpdate({ mode: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequential">Sequential</SelectItem>
            <SelectItem value="parallel">Parallel</SelectItem>
            <SelectItem value="batch">Batch</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Body Stage" htmlFor="loop-body" description="Stage to execute for each iteration">
        <Input
          id="loop-body"
          value={bodyStage}
          onChange={(e) => onUpdate({ bodyStage: e.target.value })}
          placeholder="process_item"
        />
      </FormField>

      <FormField label="Max Iterations" htmlFor="loop-max" description="Limit iterations (0 = unlimited)">
        <Input
          id="loop-max"
          type="number"
          min={0}
          value={maxIterations}
          onChange={(e) => onUpdate({ maxIterations: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Access loop variables:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>
            <code className="text-primary">
              $[{name}.{iterator}]
            </code>{' '}
            - Current item
          </li>
          <li>
            <code className="text-primary">
              $[{name}.{indexVar}]
            </code>{' '}
            - Current index
          </li>
          <li>
            <code className="text-primary">$[{name}.length]</code> - Total items
          </li>
        </ul>
      </div>
    </div>
  );
}
