/**
 * Custom Edge Components for Workflow Builder
 *
 * Design inspired by Sim.ai:
 * - Clean, minimal edge lines
 * - Smooth bezier curves
 * - Subtle hover effects
 * - Delete button only on hover
 */

import { memo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import { X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';
import { NODE_DEFINITIONS } from '../../../utils/node-types';

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
 */
export const WorkflowEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, source, selected }: EdgeProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { nodes, setEdges } = useWorkflowEditorStore();

    // Get source node to determine color
    const sourceNode = nodes.find((n) => n.id === source);
    const category = getCategoryFromType(sourceNode?.type);
    const strokeColor = CATEGORY_COLORS[category];

    // Calculate bezier path (smooth curves)
    // Bezier curves provide a more organic, flowing look compared to step paths
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Handle edge deletion
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    const isActive = isHovered || selected;
    const strokeWidth = isActive ? 2 : 1.5;

    return (
      <>
        {/* Invisible wider path for easier interaction */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={24}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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

        {/* Delete button on hover - small and unobtrusive */}
        {isActive && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5 rounded-full bg-background/95 backdrop-blur-sm border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
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
};

// Default edge options
export const DEFAULT_EDGE_OPTIONS: Partial<Edge> = {
  type: 'workflow',
  animated: false,
};
