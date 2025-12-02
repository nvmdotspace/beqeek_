/**
 * Canvas Keyboard Shortcuts Hook
 *
 * Handles keyboard shortcuts for the workflow canvas:
 * - Cmd/Ctrl+A: Select all nodes
 * - Cmd/Ctrl+C: Copy selected nodes
 * - Cmd/Ctrl+V: Paste nodes
 * - Delete/Backspace: Delete selected nodes
 * - Escape: Deselect all
 */

import { useEffect, useCallback, useRef } from 'react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { toast } from 'sonner';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface UseCanvasShortcutsOptions {
  /** Whether shortcuts are enabled (disabled when editing text inputs, etc.) */
  enabled?: boolean;
}

export function useCanvasShortcuts(options: UseCanvasShortcutsOptions = {}) {
  const { enabled = true } = options;

  const {
    mode,
    nodes,
    selectedNodeIds,
    clipboard,
    selectAllNodes,
    deselectAllNodes,
    deleteSelectedNodes,
    copySelectedNodes,
    pasteNodes,
  } = useWorkflowEditorStore();

  // Track paste offset for stacking pasted nodes
  const pasteCountRef = useRef(0);

  // Reset paste count when clipboard changes
  useEffect(() => {
    pasteCountRef.current = 0;
  }, [clipboard]);

  const handleSelectAll = useCallback(() => {
    if (nodes.length === 0) return;
    selectAllNodes();
    toast.success(m.workflowCanvas_toast_selected({ count: nodes.length }));
  }, [nodes.length, selectAllNodes]);

  const handleCopy = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      toast.info(m.workflowCanvas_toast_noNodesToCopy());
      return;
    }
    copySelectedNodes();
    pasteCountRef.current = 0; // Reset paste offset on new copy
    toast.success(m.workflowCanvas_toast_copied({ count: selectedNodeIds.length }));
  }, [selectedNodeIds.length, copySelectedNodes]);

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.nodes.length === 0) {
      toast.info(m.workflowCanvas_toast_clipboardEmpty());
      return;
    }

    // Increment paste count for offset stacking
    pasteCountRef.current += 1;
    const offset = { x: 50 * pasteCountRef.current, y: 50 * pasteCountRef.current };

    pasteNodes(offset);
    toast.success(m.workflowCanvas_toast_pasted({ count: clipboard.nodes.length }));
  }, [clipboard, pasteNodes]);

  const handleDelete = useCallback(() => {
    if (selectedNodeIds.length === 0) return;

    const count = selectedNodeIds.length;
    deleteSelectedNodes();
    toast.success(m.workflowCanvas_toast_deleted({ count }));
  }, [selectedNodeIds.length, deleteSelectedNodes]);

  const handleDeselect = useCallback(() => {
    if (selectedNodeIds.length === 0) return;
    deselectAllNodes();
  }, [selectedNodeIds.length, deselectAllNodes]);

  useEffect(() => {
    if (!enabled || mode !== 'visual') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on text input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTextInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      if (isTextInput) return;

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+A: Select all nodes
      if (isMod && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
        return;
      }

      // Cmd/Ctrl+C: Copy selected nodes
      if (isMod && e.key === 'c') {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Cmd/Ctrl+V: Paste nodes
      if (isMod && e.key === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Delete/Backspace: Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
        return;
      }

      // Escape: Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDeselect();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, mode, handleSelectAll, handleCopy, handlePaste, handleDelete, handleDeselect]);

  // Return action handlers for programmatic use (e.g., toolbar buttons)
  return {
    selectAll: handleSelectAll,
    copy: handleCopy,
    paste: handlePaste,
    deleteSelected: handleDelete,
    deselect: handleDeselect,
    hasSelection: selectedNodeIds.length > 0,
    hasClipboard: clipboard !== null && clipboard.nodes.length > 0,
  };
}
