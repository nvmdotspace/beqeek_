/**
 * EditorModeToggle Component
 *
 * Tab-based UI for switching between Visual and YAML editor modes.
 */

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { useWorkflowEditorStore, type EditorMode } from '../../stores/workflow-editor-store';
import { Workflow, Code2 } from 'lucide-react';

export function EditorModeToggle() {
  const { mode, setMode } = useWorkflowEditorStore();

  const handleModeChange = (value: string) => {
    setMode(value as EditorMode);
  };

  return (
    <Tabs value={mode} onValueChange={handleModeChange}>
      <TabsList className="grid w-[200px] grid-cols-2">
        <TabsTrigger value="visual" className="gap-2">
          <Workflow className="h-4 w-4" />
          Visual
        </TabsTrigger>
        <TabsTrigger value="yaml" className="gap-2">
          <Code2 className="h-4 w-4" />
          YAML
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
