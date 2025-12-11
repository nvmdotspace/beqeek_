/**
 * Node Toolbar - Compact floating toolbar for adding nodes
 *
 * Design Philosophy:
 * - Compact floating toolbar that doesn't consume canvas space
 * - Expandable categories with smooth animations
 * - Quick access to frequently used nodes
 * - Unique to Beqeek: Category-based expandable sections (not icon-only like Dify)
 *
 * UX Features:
 * - Click category icon to expand/collapse node list
 * - Drag nodes directly from toolbar
 * - Click to activate candidate mode (ghost node)
 * - Keyboard shortcuts for power users
 */
import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@workspace/ui/lib/utils';
import {
  Zap, // Triggers
  Play, // Actions
  GitBranch, // Logic
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { NODE_DEFINITIONS, type NodeDefinition, type NodeCategory } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';
import { useCandidateNodeState } from '../../stores/workflow-editor-store';

// Category configuration
const CATEGORIES: {
  id: NodeCategory;
  label: string;
  icon: typeof Zap;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    id: 'trigger',
    label: 'Triggers',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'action',
    label: 'Actions',
    icon: Play,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    id: 'logic',
    label: 'Logic',
    icon: GitBranch,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10 hover:bg-teal-500/20',
    borderColor: 'border-teal-500/30',
  },
];

// Filter nodes by category (exclude compound nodes)
const getNodesByCategory = (category: NodeCategory): NodeDefinition[] => {
  return NODE_DEFINITIONS.filter(
    (def) => def.category === category && !def.type.startsWith('compound_') && def.type !== 'merge',
  );
};

interface NodeItemProps {
  definition: NodeDefinition;
  categoryColor: string;
  onActivate: (definition: NodeDefinition) => void;
}

const NodeItem = memo(({ definition, categoryColor, onActivate }: NodeItemProps) => {
  const IconComponent = getWorkflowIcon(definition.icon);

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', definition.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = () => {
    onActivate(definition);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2',
              'text-left text-sm transition-colors',
              'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              'cursor-pointer',
            )}
            draggable
            onDragStart={handleDragStart}
            onClick={handleClick}
          >
            {IconComponent && <IconComponent className={cn('size-4 flex-shrink-0', categoryColor)} />}
            <span className="truncate">{definition.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="font-medium">{definition.label}</p>
          <p className="text-xs text-muted-foreground">{definition.description}</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
});

NodeItem.displayName = 'NodeItem';

interface CategorySectionProps {
  category: (typeof CATEGORIES)[0];
  isExpanded: boolean;
  onToggle: () => void;
  onActivateNode: (definition: NodeDefinition) => void;
}

const CategorySection = memo(({ category, isExpanded, onToggle, onActivateNode }: CategorySectionProps) => {
  const nodes = getNodesByCategory(category.id);
  const CategoryIcon = category.icon;

  return (
    <div className="relative">
      {/* Category Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              'border transition-all duration-200',
              category.bgColor,
              category.borderColor,
              isExpanded && 'ring-2 ring-ring ring-offset-1',
            )}
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={`${category.label} - ${nodes.length} nodes`}
          >
            <CategoryIcon className={cn('size-5', category.color)} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>
            {category.label} ({nodes.length})
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Expanded Node List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: 180, marginLeft: 8 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('absolute left-full top-0 z-50', 'overflow-hidden rounded-lg border bg-popover shadow-lg')}
          >
            <div className="p-2">
              {/* Header */}
              <div className="mb-2 flex items-center justify-between px-2">
                <span className={cn('text-xs font-semibold', category.color)}>{category.label}</span>
                <button className="rounded p-0.5 hover:bg-accent" onClick={onToggle} aria-label="Close">
                  <X className="size-3 text-muted-foreground" />
                </button>
              </div>

              {/* Node List */}
              <div className="max-h-[300px] space-y-0.5 overflow-y-auto">
                {nodes.map((def) => (
                  <NodeItem
                    key={def.type}
                    definition={def}
                    categoryColor={category.color}
                    onActivate={onActivateNode}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

/**
 * Main Node Toolbar Component
 *
 * Positioned as a floating toolbar on the left side of the canvas.
 * Compact by default, expands on category click.
 */
export const NodeToolbar = memo(() => {
  const [expandedCategory, setExpandedCategory] = useState<NodeCategory | null>(null);
  const { setCandidateNode } = useCandidateNodeState();

  const handleToggleCategory = useCallback((category: NodeCategory) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }, []);

  const handleActivateNode = useCallback(
    (definition: NodeDefinition) => {
      const timestamp = Date.now();
      const candidateNode = {
        id: `${definition.type}-${timestamp}`,
        type: definition.type,
        position: { x: 0, y: 0 },
        data: {
          name: `${definition.type}_${timestamp}`,
          _isCandidate: true,
          ...definition.defaultData,
        },
      };
      setCandidateNode(candidateNode);
      setExpandedCategory(null); // Close panel after selection
    },
    [setCandidateNode],
  );

  // Close expanded panel when clicking outside
  const handleBackdropClick = useCallback(() => {
    setExpandedCategory(null);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      {/* Backdrop to close panel when clicking outside */}
      {expandedCategory && <div className="fixed inset-0 z-40" onClick={handleBackdropClick} aria-hidden="true" />}

      {/* Toolbar Container */}
      <div
        className={cn(
          'absolute left-4 top-1/2 z-50 -translate-y-1/2',
          'flex flex-col gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur-sm',
        )}
        role="toolbar"
        aria-label="Node toolbar"
      >
        {CATEGORIES.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggle={() => handleToggleCategory(category.id)}
            onActivateNode={handleActivateNode}
          />
        ))}

        {/* Divider */}
        <div className="mx-1 h-px bg-border" />

        {/* Quick tip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex size-10 cursor-help items-center justify-center text-muted-foreground">
              <span className="text-xs font-medium">?</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="font-medium">Quick Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              <li>Click category to see nodes</li>
              <li>Click node to place on canvas</li>
              <li>Drag node for precise positioning</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});

NodeToolbar.displayName = 'NodeToolbar';
