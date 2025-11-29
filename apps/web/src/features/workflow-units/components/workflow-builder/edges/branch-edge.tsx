/**
 * Branch Edge - Custom edge for conditional branches
 *
 * Used to connect compound nodes to their child branches (then/else/loop body).
 * Displays a label badge and uses color-coding for branch type.
 */
import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

export const BranchEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Determine label color based on the label text
    const getLabelStyles = () => {
      const labelStr = String(label || '').toLowerCase();
      if (labelStr === 'then') {
        return 'bg-accent-green-subtle text-accent-green border-accent-green/30';
      }
      if (labelStr === 'else') {
        return 'bg-accent-red-subtle text-accent-red border-accent-red/30';
      }
      if (labelStr === 'loop body' || labelStr === 'loop') {
        return 'bg-accent-purple-subtle text-accent-purple border-accent-purple/30';
      }
      return 'bg-background text-foreground border-border';
    };

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            strokeWidth: 2,
            strokeDasharray: '4 2',
            ...style,
          }}
        />
        {label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className={`px-2 py-0.5 text-xs font-medium border rounded-full ${getLabelStyles()}`}
            >
              {label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

BranchEdge.displayName = 'BranchEdge';
