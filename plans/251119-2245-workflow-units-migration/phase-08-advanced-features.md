# Phase 8: Advanced Features

**Date**: 2025-11-19 22:45
**Duration**: Week 9-10 (10 days)
**Status**: ⚪ Not Started

---

## Overview

Enhance workflow editing with undo/redo, keyboard shortcuts, auto-layout, node grouping, copy/paste, export/import, performance optimizations.

---

## Features

**Undo/Redo** (2 days):

- History stack for nodes/edges changes
- Cmd+Z / Cmd+Shift+Z
- Zustand middleware for history

**Keyboard Shortcuts** (1 day):

- Delete: Remove selected nodes
- Cmd+A: Select all
- Cmd+C/Cmd+V: Copy/paste nodes
- Cmd+S: Save workflow
- Escape: Deselect all

**Auto-Layout** (2 days):

- Dagre hierarchical layout
- Re-layout button
- Preserve manual adjustments option

**Node Grouping** (2 days):

- Group nodes into "stages"
- Collapsible groups
- Visual grouping with background node

**Copy/Paste** (1 day):

- Copy selected nodes + edges
- Paste with offset position
- Cross-workflow copy (clipboard API)

**Export/Import** (1 day):

- Export workflow as JSON
- Import workflow from JSON
- Template library

**Performance** (1 day):

- Memoize node components
- Virtual rendering for 1000+ nodes
- Debounce auto-save (2s)
- Lazy load node palette

---

## Implementation Highlights

**Undo/Redo with Zustand**:

```typescript
import { temporal } from 'zundo';

export const useWorkflowEditorStore = create<WorkflowEditorState>()(
  temporal(
    devtools((set) => ({
      /* ... */
    })),
    { limit: 50 },
  ),
);

// Usage
const { undo, redo, clear } = useTemporalStore();
```

**Keyboard Shortcuts**:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'z') {
      e.shiftKey ? redo() : undo();
    }
    if (e.key === 'Delete') {
      deleteSelectedNodes();
    }
    // ... more shortcuts
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Auto-Layout**:

```typescript
const handleAutoLayout = () => {
  const layoutedNodes = autoLayout(nodes, edges);
  setNodes(layoutedNodes);
};
```

---

## Success Criteria

- ✅ Undo/redo works for 50 steps
- ✅ All keyboard shortcuts functional
- ✅ Auto-layout produces readable graphs
- ✅ Node grouping visual + collapsible
- ✅ Copy/paste preserves connections
- ✅ Export/import round-trips successfully
- ✅ Performance: <500ms for 100 nodes

---

**Phase 8 Completion**: When all advanced features implemented
