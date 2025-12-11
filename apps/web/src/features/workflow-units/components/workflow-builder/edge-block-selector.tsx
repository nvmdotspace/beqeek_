/**
 * Edge Block Selector - Add node on edge hover
 *
 * Inspired by Dify's edge block insertion pattern:
 * - Shows a "+" button at edge midpoint on hover
 * - Click to open block selector dropdown
 * - Insert node between two connected nodes
 */
import { memo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@workspace/ui/components/dropdown-menu';
import { NODE_DEFINITIONS, type NodeDefinition } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';

interface EdgeBlockSelectorProps {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  position: { x: number; y: number };
  onInsertNode: (nodeType: string, edgeId: string, sourceNodeId: string, targetNodeId: string) => void;
}

export const EdgeBlockSelector = memo(
  ({ edgeId, sourceNodeId, targetNodeId, position, onInsertNode }: EdgeBlockSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = useCallback(
      (nodeType: string) => {
        onInsertNode(nodeType, edgeId, sourceNodeId, targetNodeId);
        setIsOpen(false);
      },
      [edgeId, sourceNodeId, targetNodeId, onInsertNode],
    );

    // Filter out trigger nodes (can't be inserted between nodes)
    const insertableNodes = NODE_DEFINITIONS.filter(
      (def) => def.category !== 'trigger' && !def.type.startsWith('compound_'),
    );

    const actions = insertableNodes.filter((d) => d.category === 'action');
    const logic = insertableNodes.filter((d) => d.category === 'logic');

    const renderMenuItem = (def: NodeDefinition) => {
      const IconComponent = getWorkflowIcon(def.icon);
      return (
        <DropdownMenuItem
          key={def.type}
          onClick={() => handleSelect(def.type)}
          className="flex items-center gap-2 cursor-pointer"
        >
          {IconComponent && <IconComponent className="size-4 text-muted-foreground" />}
          <span>{def.label}</span>
        </DropdownMenuItem>
      );
    };

    return (
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          pointerEvents: 'all',
        }}
        className="nodrag nopan"
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full bg-background/95 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground"
              title="Add node"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="bottom" className="w-48 max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
            {actions.map(renderMenuItem)}

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">Logic</DropdownMenuLabel>
            {logic.map(renderMenuItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

EdgeBlockSelector.displayName = 'EdgeBlockSelector';
