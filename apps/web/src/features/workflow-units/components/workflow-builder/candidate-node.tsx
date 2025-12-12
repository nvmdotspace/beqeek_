/**
 * Candidate Node - Ghost node preview during drag from palette
 *
 * Inspired by Dify's candidate node pattern:
 * - Shows a preview of the node at mouse position
 * - Click to place, right-click or ESC to cancel
 * - Scales with canvas zoom level
 */
import { memo, useEffect, useRef } from 'react';
import { useViewport, useReactFlow } from '@xyflow/react';
import { useCandidateNodeState } from '../../stores/workflow-editor-store';
import { NODE_DEFINITIONS } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';

const CandidateNodeContent = memo(() => {
  const { candidateNode, mousePosition, placeCandidateNode, cancelCandidateNode, setMousePosition } =
    useCandidateNodeState();
  const { zoom } = useViewport();
  const reactflow = useReactFlow();

  // Store mouse position in ref to avoid stale closure in click handler
  // This prevents re-attaching listeners on every mouse move
  const mousePositionRef = useRef(mousePosition);
  mousePositionRef.current = mousePosition;

  // Handle click/keyboard events - separate from mouse tracking to avoid re-attach on mousemove
  useEffect(() => {
    if (!candidateNode) return;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Use ref to get latest mouse position without causing effect re-run
      const position = reactflow.screenToFlowPosition({
        x: mousePositionRef.current.pageX,
        y: mousePositionRef.current.pageY,
      });

      placeCandidateNode(position);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      cancelCandidateNode();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelCandidateNode();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [candidateNode, placeCandidateNode, cancelCandidateNode, reactflow]);

  // Separate effect for mouse tracking - only depends on candidateNode existence
  // This prevents the click/keyboard listeners from being re-attached on every mouse move
  useEffect(() => {
    if (!candidateNode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.getElementById('workflow-canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        pageX: e.pageX,
        pageY: e.pageY,
        elementX: e.clientX - rect.left,
        elementY: e.clientY - rect.top,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [candidateNode, setMousePosition]);

  if (!candidateNode) return null;

  // Get node definition for display
  const nodeDef = NODE_DEFINITIONS.find((def) => def.type === candidateNode.type);
  const IconComponent = nodeDef ? getWorkflowIcon(nodeDef.icon) : null;

  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{
        left: mousePosition.elementX,
        top: mousePosition.elementY,
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
        opacity: 0.8,
      }}
    >
      {/* Render a simplified preview of the node */}
      <div className="rounded-lg border-2 border-dashed border-primary bg-card/90 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="size-4 text-muted-foreground" />}
          <span className="text-sm font-medium">{nodeDef?.label || candidateNode.type}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Click to place</div>
      </div>
    </div>
  );
});

CandidateNodeContent.displayName = 'CandidateNodeContent';

/**
 * Main Candidate Node component
 * Only renders if there's an active candidate
 */
export const CandidateNode = memo(() => {
  const candidateNode = useCandidateNodeState().candidateNode;

  if (!candidateNode) return null;

  return <CandidateNodeContent />;
});

CandidateNode.displayName = 'CandidateNode';
