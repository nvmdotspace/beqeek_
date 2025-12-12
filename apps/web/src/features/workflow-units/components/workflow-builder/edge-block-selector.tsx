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
import { cn } from '@workspace/ui/lib/utils';
import { NODE_DEFINITIONS, type NodeDefinition, type NodeCategory } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';

// Category-based icon styles (matching node-palette.tsx)
const CATEGORY_STYLES: Record<NodeCategory, { bg: string; text: string }> = {
  trigger: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  action: {
    bg: 'bg-violet-100 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  logic: {
    bg: 'bg-orange-100 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
  },
};

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
      const styles = CATEGORY_STYLES[def.category];
      return (
        <DropdownMenuItem
          key={def.type}
          onClick={() => handleSelect(def.type)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', styles.bg, styles.text)}>
            {IconComponent && <IconComponent className="size-3.5" />}
          </div>
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
