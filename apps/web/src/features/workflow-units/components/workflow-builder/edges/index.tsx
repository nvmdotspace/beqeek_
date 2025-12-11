/**
 * Custom Edge Components for Workflow Builder
 *
 * Design inspired by Sim.ai + Dify:
 * - Clean, minimal edge lines
 * - Smooth bezier curves
 * - Subtle hover effects
 * - Delete button only on hover
 * - Block insertion on edge hover (Dify-inspired)
 */

import { memo, useState, useCallback, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge, useReactFlow } from '@xyflow/react';
import { X, Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@workspace/ui/components/dropdown-menu';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';
import { NODE_DEFINITIONS, type NodeDefinition } from '../../../utils/node-types';
import { getWorkflowIcon } from '../../../utils/workflow-icons';
import { BranchEdge } from './branch-edge';
import { LoopEdge } from './loop-edge';

// Pre-compute insertable nodes outside component to avoid recalculation
const INSERTABLE_NODES = NODE_DEFINITIONS.filter(
  (def) => def.category !== 'trigger' && !def.type.startsWith('compound_') && def.type !== 'merge',
);
const ACTION_NODES = INSERTABLE_NODES.filter((d) => d.category === 'action');
const LOGIC_NODES = INSERTABLE_NODES.filter((d) => d.category === 'logic');

// Category colors using CSS variables for dark/light mode support
const CATEGORY_COLORS = {
  trigger: 'var(--accent-blue)',
  action: 'var(--accent-green)',
  logic: 'var(--accent-teal)',
  default: 'var(--muted-foreground)',
};

// Get category from node type
function getCategoryFromType(nodeType: string | undefined): keyof typeof CATEGORY_COLORS {
  if (!nodeType) return 'default';

  const nodeDef = NODE_DEFINITIONS.find((def) => def.type === nodeType);
  if (nodeDef) {
    return nodeDef.category;
  }

  // Fallback based on type prefix
  if (nodeType.startsWith('trigger_')) return 'trigger';
  if (
    nodeType.startsWith('log') ||
    nodeType.startsWith('table_') ||
    nodeType.startsWith('smtp_') ||
    nodeType.startsWith('api_') ||
    nodeType.startsWith('google_') ||
    nodeType.startsWith('user_') ||
    nodeType.startsWith('delay')
  )
    return 'action';
  return 'logic';
}

/**
 * Custom Workflow Edge
 *
 * Design Decisions:
 * 1. BEZIER CURVES (not step paths):
 *    - Provides organic, flowing connections that feel natural
 *    - Reduces visual clutter compared to right-angle paths
 *    - Better handles complex layouts with overlapping connections
 *
 * 2. CATEGORY-BASED COLORS via CSS variables:
 *    - Trigger nodes (blue): Starting points of workflows
 *    - Action nodes (green): Operations that do something
 *    - Logic nodes (teal): Decision/branching points
 *    - Colors automatically adapt to dark/light mode via CSS variables
 *    - Reduced saturation in dark mode prevents eye strain
 *
 * 3. SUBTLE INTERACTIONS:
 *    - Edges have 70% opacity by default, 100% on hover
 *    - Delete button appears only on hover to keep canvas clean
 *    - Wider invisible hit area (24px) for easier selection
 *
 * 4. BLOCK INSERTION (Dify-inspired):
 *    - "+" button appears on hover at edge midpoint
 *    - Click to open dropdown with available node types
 *    - Insert node between source and target nodes
 */
export const WorkflowEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, source, target, selected }: EdgeProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Use separate selectors to minimize re-renders
    // Only subscribe to the specific data we need
    const nodes = useWorkflowEditorStore((state) => state.nodes);
    const setNodes = useWorkflowEditorStore((state) => state.setNodes);
    const setEdges = useWorkflowEditorStore((state) => state.setEdges);

    // Get source node to determine color - memoize to prevent recalc on unrelated node changes
    const strokeColor = useMemo(() => {
      const sourceNode = nodes.find((n) => n.id === source);
      const category = getCategoryFromType(sourceNode?.type);
      return CATEGORY_COLORS[category];
    }, [nodes, source]);

    // Calculate bezier path (smooth curves)
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Handle edge deletion - use functional update to avoid stale closure
    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        // Use store.getState() to get fresh edges instead of depending on edges in closure
        const currentEdges = useWorkflowEditorStore.getState().edges;
        setEdges(currentEdges.filter((edge) => edge.id !== id));
      },
      [id, setEdges],
    );

    // Handle inserting a new node on this edge
    // Use store.getState() to avoid depending on nodes/edges arrays which change frequently
    const handleInsertNode = useCallback(
      (nodeType: string) => {
        const timestamp = Date.now();
        const newNodeId = `${nodeType}-${timestamp}`;

        // Calculate position at edge midpoint
        const newNodePosition = {
          x: labelX - 100, // Center the node
          y: labelY - 40,
        };

        // Get default data for node type
        const nodeDef = NODE_DEFINITIONS.find((def) => def.type === nodeType);
        const newNode = {
          id: newNodeId,
          type: nodeType,
          position: newNodePosition,
          data: {
            name: `${nodeType}_${timestamp}`,
            ...nodeDef?.defaultData,
          },
        };

        // Get fresh state to avoid stale closure issues
        const { nodes: currentNodes, edges: currentEdges } = useWorkflowEditorStore.getState();

        // Create two new edges: source -> new node, new node -> target
        const newEdges = currentEdges.filter((edge) => edge.id !== id);
        newEdges.push({
          id: `edge-${source}-${newNodeId}`,
          source: source!,
          target: newNodeId,
          type: 'workflow',
        });
        newEdges.push({
          id: `edge-${newNodeId}-${target}`,
          source: newNodeId,
          target: target!,
          type: 'workflow',
        });

        // Update state
        setNodes([...currentNodes, newNode]);
        setEdges(newEdges);
        setIsMenuOpen(false);
      },
      [id, labelX, labelY, setEdges, setNodes, source, target],
    );

    const isActive = isHovered || selected || isMenuOpen;
    const strokeWidth = isActive ? 2 : 1.5;

    // Memoize menu item renderer to prevent recreation on every render
    const renderMenuItem = useCallback(
      (def: NodeDefinition) => {
        const IconComponent = getWorkflowIcon(def.icon);
        return (
          <DropdownMenuItem
            key={def.type}
            onClick={() => handleInsertNode(def.type)}
            className="flex cursor-pointer items-center gap-2"
          >
            {IconComponent && <IconComponent className="size-4 text-muted-foreground" />}
            <span>{def.label}</span>
          </DropdownMenuItem>
        );
      },
      [handleInsertNode],
    );

    return (
      <>
        {/* Invisible wider path for easier interaction */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={24}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => !isMenuOpen && setIsHovered(false)}
          style={{ cursor: 'pointer' }}
        />

        {/* Main edge path - uses CSS variable for theme support */}
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: strokeColor,
            strokeWidth,
            strokeLinecap: 'round',
            strokeOpacity: isActive ? 1 : 0.7,
            transition: 'stroke-width 0.15s ease, stroke-opacity 0.15s ease',
          }}
        />

        {/* Action buttons on hover */}
        {isActive && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan flex items-center gap-1"
            >
              {/* Add node button with dropdown */}
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full border-border bg-background/95 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                    title="Add node"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="bottom" className="max-h-80 w-48 overflow-y-auto">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                  {ACTION_NODES.map(renderMenuItem)}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Logic</DropdownMenuLabel>
                  {LOGIC_NODES.map(renderMenuItem)}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Delete button */}
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5 rounded-full border-border bg-background/95 shadow-sm backdrop-blur-sm transition-colors hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDelete}
                title="Delete connection"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

WorkflowEdge.displayName = 'WorkflowEdge';

// Edge types export for ReactFlow
// Include 'default' to handle existing edges without explicit type
export const EDGE_TYPES = {
  default: WorkflowEdge,
  workflow: WorkflowEdge,
  branch: BranchEdge, // For compound condition branches (then/else)
  loop: LoopEdge, // For loop iteration edges (entry, sequential, repeat)
};

// Default edge options
export const DEFAULT_EDGE_OPTIONS: Partial<Edge> = {
  type: 'workflow',
  animated: false,
};
