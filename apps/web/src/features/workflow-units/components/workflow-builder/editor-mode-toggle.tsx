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
    <Tabs value={mode} onValueChange={handleModeChange} aria-label="Editor mode">
      <TabsList className="grid w-[200px] grid-cols-2" aria-label="Switch between Visual and YAML editor">
        <TabsTrigger value="visual" className="gap-2" aria-label="Visual editor mode">
          <Workflow className="h-4 w-4" aria-hidden="true" />
          Visual
        </TabsTrigger>
        <TabsTrigger value="yaml" className="gap-2" aria-label="YAML code editor mode">
          <Code2 className="h-4 w-4" aria-hidden="true" />
          YAML
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
