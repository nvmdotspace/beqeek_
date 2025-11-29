/**
 * VariablePicker - Dropdown for selecting $[...] variable references
 */

import { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

interface VariablePickerProps {
  variables: string[];
  onSelect: (variable: string) => void;
  children: ReactNode;
}

// Default context variables available in workflows
const DEFAULT_VARIABLES = [
  { category: 'Trigger', vars: ['trigger.data', 'trigger.id', 'trigger.timestamp'] },
  { category: 'Environment', vars: ['env.APP_URL', 'env.API_KEY'] },
  { category: 'Secrets', vars: ['secrets.api_key', 'secrets.token'] },
];

export function VariablePicker({ variables, onSelect, children }: VariablePickerProps) {
  // Merge default with custom variables
  const customVars = variables.filter((v) => !DEFAULT_VARIABLES.flatMap((d) => d.vars).includes(v));

  const handleSelect = (variable: string) => {
    onSelect(`$[${variable}]`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-64 overflow-auto">
        <DropdownMenuLabel>Insert Variable</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {DEFAULT_VARIABLES.map((group) => (
          <div key={group.category}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">{group.category}</DropdownMenuLabel>
            {group.vars.map((v) => (
              <DropdownMenuItem key={v} onClick={() => handleSelect(v)} className="font-mono text-xs">
                $[{v}]
              </DropdownMenuItem>
            ))}
          </div>
        ))}

        {customVars.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Workflow Steps</DropdownMenuLabel>
            {customVars.map((v) => (
              <DropdownMenuItem key={v} onClick={() => handleSelect(v)} className="font-mono text-xs">
                $[{v}]
              </DropdownMenuItem>
            ))}
          </>
        )}

        {variables.length === 0 && customVars.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">No custom variables available</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
