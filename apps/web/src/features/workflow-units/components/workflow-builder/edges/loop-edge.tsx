/**
 * Loop Edge - Custom edge for loop iteration connections
 *
 * Used for:
 * - Entry edges (parent loop to first child)
 * - Sequential edges (between loop children)
 * - Loop-back edges (last child back to parent with "repeat" indicator)
 *
 * Features dashed styling with purple accent to match CompoundLoopNode theme.
 */
import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { Repeat } from 'lucide-react';

export const LoopEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style, animated }: EdgeProps) => {
    const isRepeatEdge = String(label || '').toLowerCase() === 'repeat';

    // For repeat edges, use a curved path that goes around the side
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      // Increase curvature for loop-back edge
      curvature: isRepeatEdge ? 0.8 : 0.25,
    });

    // Label styles based on edge type
    const getLabelStyles = () => {
      if (isRepeatEdge) {
        return 'bg-accent-purple text-white border-accent-purple';
      }
      if (String(label || '').toLowerCase() === 'each item') {
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
            strokeWidth: isRepeatEdge ? 1.5 : 2,
            strokeDasharray: isRepeatEdge ? '3 3' : '5 5',
            strokeLinecap: 'round',
            ...style,
          }}
          className={animated ? 'animated-edge' : ''}
        />
        {label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className={`px-2 py-0.5 text-xs font-medium border rounded-full flex items-center gap-1 ${getLabelStyles()}`}
            >
              {isRepeatEdge && <Repeat className="h-3 w-3" />}
              {label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

LoopEdge.displayName = 'LoopEdge';
