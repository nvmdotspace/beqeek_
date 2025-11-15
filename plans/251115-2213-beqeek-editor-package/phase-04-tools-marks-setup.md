# Phase 04: Tools & Marks Setup

**Parent Plan:** [plan.md](./plan.md)
**Phase:** 04/07
**Dependencies:** Phase 03 (Plugin configuration complete)

## Context

Configure Yoopta editing tools (ActionMenu, Toolbar, LinkTool) and text marks (Bold, Italic, Code, Underline, Strike, Highlight) for comprehensive editing UX.

**Reference Files:**

- `/docs/yoopta-editor/large_document_code.md` (lines 158-173) - Tools and Marks configuration

## Overview

**Date:** 2025-11-15
**Description:** Integrate 3 editing tools and 6 text formatting marks
**Priority:** P0 - Core editing UX
**Implementation Status:** Not Started
**Review Status:** Pending

## Key Insights

1. **Tools Configuration:** Tools are objects with `render` and `tool` properties (not React components)
2. **Default Renders:** Yoopta provides DefaultActionMenuRender, DefaultToolbarRender, DefaultLinkToolRender
3. **Custom Renders:** Can replace default renders with shadcn/ui styled versions (optional enhancement)
4. **Marks Array:** Simple array of mark modules, no configuration needed
5. **Toolbar Positioning:** Toolbar appears on text selection, ActionMenu on slash command
6. **Tool Customization:** Tools accept options for behavior (e.g., link validation, toolbar position)

## Requirements

### Functional Requirements

- [x] ActionMenu tool configured (slash command block insertion)
- [x] Toolbar tool configured (floating text formatting toolbar)
- [x] LinkTool configured (link insertion/editing modal)
- [x] 6 text marks: Bold, Italic, CodeMark, Underline, Strike, Highlight
- [x] Tool configuration factory (getDefaultTools)
- [x] Marks configuration factory (getDefaultMarks)
- [x] Custom tool renders with shadcn/ui (optional - Phase 04 or defer)

### Non-Functional Requirements

- Design system compliance for custom tool renders
- Keyboard shortcuts preserved (Cmd+B, Cmd+I, etc.)
- Accessible toolbar (keyboard navigation, ARIA)
- Mobile-friendly toolbar positioning
- i18n-ready labels for tools

## Architecture

### Tools Structure

```typescript
// tools/index.ts
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

export const DEFAULT_TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

export function getDefaultTools() {
  return DEFAULT_TOOLS;
}
```

### Marks Structure

```typescript
// marks/index.ts
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';

export const DEFAULT_MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

export function getDefaultMarks() {
  return DEFAULT_MARKS;
}
```

### Custom Tool Renders (Optional Enhancement)

```typescript
// tools/custom-renders.tsx
import { ActionMenuRenderProps } from '@yoopta/action-menu-list';
import { cn } from '@workspace/ui/lib/utils';

export function CustomActionMenuRender({ editor, view }: ActionMenuRenderProps) {
  // Use shadcn/ui Popover, Command components
  // Full implementation deferred if complex - use defaults in Phase 04
  return <DefaultActionMenuRender editor={editor} view={view} />;
}
```

### Tool Types

```typescript
// types/tools.ts
import type { ActionMenuListProps } from '@yoopta/action-menu-list';
import type { ToolbarProps } from '@yoopta/toolbar';
import type { LinkToolProps } from '@yoopta/link-tool';

export interface ToolsConfig {
  ActionMenu?: {
    render: React.ComponentType<ActionMenuListProps>;
    tool: typeof ActionMenuList;
  };
  Toolbar?: {
    render: React.ComponentType<ToolbarProps>;
    tool: typeof Toolbar;
  };
  LinkTool?: {
    render: React.ComponentType<LinkToolProps>;
    tool: typeof LinkTool;
  };
}
```

## Related Code Files

**New Files (Create):**

- `/packages/beqeek-editor/src/tools/index.ts`
- `/packages/beqeek-editor/src/marks/index.ts`
- `/packages/beqeek-editor/src/types/tools.ts`
- `/packages/beqeek-editor/src/tools/custom-renders.tsx` (optional)

**Update Files:**

- `/packages/beqeek-editor/src/index.ts` - Export tools/marks
- `/packages/beqeek-editor/src/types/index.ts` - Export ToolsConfig

**Reference Files:**

- `/docs/yoopta-editor/large_document_code.md`

## Implementation Steps

### Step 1: Define Tool Types

```typescript
// types/tools.ts
import type { ActionMenuListProps } from '@yoopta/action-menu-list';
import type { ToolbarProps } from '@yoopta/toolbar';
import type { LinkToolProps } from '@yoopta/link-tool';

export interface ToolsConfig {
  ActionMenu?: {
    render: React.ComponentType<any>;
    tool: any;
  };
  Toolbar?: {
    render: React.ComponentType<any>;
    tool: any;
  };
  LinkTool?: {
    render: React.ComponentType<any>;
    tool: any;
  };
}

export type MarksArray = any[]; // Yoopta mark modules
```

### Step 2: Implement Default Tools Configuration

```typescript
// tools/index.ts
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import type { ToolsConfig } from '../types/tools.js';

export const DEFAULT_TOOLS: ToolsConfig = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

/**
 * Get default editor tools (ActionMenu, Toolbar, LinkTool)
 * with Yoopta's default renders.
 */
export function getDefaultTools(): ToolsConfig {
  return DEFAULT_TOOLS;
}
```

### Step 3: Implement Default Marks Configuration

```typescript
// marks/index.ts
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import type { MarksArray } from '../types/tools.js';

export const DEFAULT_MARKS: MarksArray = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

/**
 * Get default text formatting marks.
 * Shortcuts: Cmd+B (Bold), Cmd+I (Italic), Cmd+E (Code),
 * Cmd+U (Underline), Cmd+Shift+X (Strike), Cmd+Shift+H (Highlight)
 */
export function getDefaultMarks(): MarksArray {
  return DEFAULT_MARKS;
}
```

### Step 4: Update BeqeekEditor to Accept Tools/Marks

Verify `BeqeekEditor` component already accepts tools/marks props (from Phase 02):

```typescript
// components/editor/beqeek-editor.tsx
export function BeqeekEditor({
  editor,
  plugins,
  tools, // ✓ Already defined
  marks, // ✓ Already defined
  // ...
}: BeqeekEditorProps) {
  // ...
  return (
    <YooptaEditor
      tools={tools}
      marks={marks}
      // ...
    />
  );
}
```

### Step 5: Update Default Plugin Configuration

Integrate tools/marks into default editor setup:

```typescript
// plugins/default.ts
import { getTypographyPlugins } from './typography.js';
import { getListPlugins } from './lists.js';
import { getStructuralPlugins } from './structural.js';
import { getMediaPlugins } from './media.js';
import { getCodePlugin } from './code.js';
import { getDefaultTools } from '../tools/index.js';
import { getDefaultMarks } from '../marks/index.js';
import type { EditorConfig } from '../types/editor.js';

export function getDefaultEditorConfig(): EditorConfig {
  return {
    plugins: [
      ...getTypographyPlugins(),
      ...getListPlugins(),
      ...getStructuralPlugins(),
      getCodePlugin(),
      ...getMediaPlugins(),
    ],
    tools: getDefaultTools(),
    marks: getDefaultMarks(),
  };
}
```

### Step 6: Update Exports

```typescript
// tools/index.ts (already exports getDefaultTools)
export { DEFAULT_TOOLS, getDefaultTools } from './index.js';

// marks/index.ts (already exports getDefaultMarks)
export { DEFAULT_MARKS, getDefaultMarks } from './index.js';

// Main index.ts
export { getDefaultTools } from './tools/index.js';
export { getDefaultMarks } from './marks/index.js';
export { getDefaultEditorConfig } from './plugins/default.js';
```

### Step 7: Update README with Full Configuration Example

```markdown
## Complete Editor Setup

import {
BeqeekEditor,
createBeqeekEditor,
getDefaultPlugins,
getDefaultTools,
getDefaultMarks,
} from '@workspace/beqeek-editor';
import { useMemo } from 'react';

function MyDocument() {
const editor = useMemo(() => createBeqeekEditor(), []);
const plugins = useMemo(() => getDefaultPlugins(), []);
const tools = useMemo(() => getDefaultTools(), []);
const marks = useMemo(() => getDefaultMarks(), []);

return (
<BeqeekEditor
      editor={editor}
      plugins={plugins}
      tools={tools}
      marks={marks}
      autoFocus
    />
);
}

## Or use getDefaultEditorConfig()

import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import { useMemo } from 'react';

function MyDocument() {
const editor = useMemo(() => createBeqeekEditor(), []);
const config = useMemo(() => getDefaultEditorConfig(), []);

return (
<BeqeekEditor
      editor={editor}
      plugins={config.plugins}
      tools={config.tools}
      marks={config.marks}
      autoFocus
    />
);
}
```

### Step 8: Test Tools and Marks Functionality

In apps/web test page:

```tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import { useMemo } from 'react';

export function TestToolsMarks() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const { plugins, tools, marks } = useMemo(() => getDefaultEditorConfig(), []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tools & Marks Test</h1>
      <BeqeekEditor
        editor={editor}
        plugins={plugins}
        tools={tools}
        marks={marks}
        placeholder="Type / for commands, select text for formatting..."
      />
    </div>
  );
}
```

**Test Checklist:**

- [ ] Type `/` → ActionMenu appears with plugin options
- [ ] Select text → Toolbar appears with formatting buttons
- [ ] Click Link button → LinkTool modal opens
- [ ] Cmd+B → Bold applied
- [ ] Cmd+I → Italic applied
- [ ] Cmd+E → Code mark applied
- [ ] Cmd+U → Underline applied
- [ ] Cmd+Shift+X → Strikethrough applied
- [ ] Cmd+Shift+H → Highlight applied

### Step 9: Validate Build

```bash
pnpm --filter @workspace/beqeek-editor build
pnpm --filter @workspace/beqeek-editor check-types
```

### Step 10: (Optional) Custom Tool Renders with shadcn/ui

**Defer to post-MVP or separate PR if complex.**

Placeholder for custom ActionMenu with shadcn Command component:

```typescript
// tools/custom-action-menu.tsx
import { Command, CommandInput, CommandList, CommandItem } from '@workspace/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';

export function CustomActionMenuRender({ editor, view }: any) {
  // Complex implementation - defer if not P0
  // Use shadcn/ui Command for search, Popover for positioning
  // For now, use DefaultActionMenuRender
  return <DefaultActionMenuRender editor={editor} view={view} />;
}
```

## Todo

- [ ] Define ToolsConfig and MarksArray types
- [ ] Implement getDefaultTools() with default renders
- [ ] Implement getDefaultMarks() with 6 marks
- [ ] Update getDefaultEditorConfig() to include tools/marks
- [ ] Update main index.ts exports
- [ ] Add complete usage examples to README
- [ ] Test ActionMenu (slash command)
- [ ] Test Toolbar (text selection)
- [ ] Test LinkTool (link insertion)
- [ ] Test all 6 mark shortcuts (Cmd+B, Cmd+I, etc.)
- [ ] Validate build and type-check
- [ ] (Optional) Implement custom tool renders with shadcn/ui

## Success Criteria

- [x] ActionMenu appears on `/` command with plugin list
- [x] Toolbar appears on text selection with formatting buttons
- [x] LinkTool modal opens for link insertion/editing
- [x] All 6 marks functional with keyboard shortcuts
- [x] getDefaultEditorConfig() exports complete config
- [x] TypeScript strict mode with zero errors
- [x] Documentation includes tools/marks usage examples
- [x] Keyboard shortcuts match Yoopta defaults (Cmd+B, etc.)
- [x] Mobile-friendly toolbar positioning (Yoopta handles this)

## Risk Assessment

**Low Risk: Default Tool Renders**

- Yoopta provides production-ready default renders
- **Mitigation:** Use defaults in Phase 04, custom renders optional

**Low Risk: Mark Keyboard Shortcuts**

- Yoopta handles shortcuts internally
- **Mitigation:** Document shortcuts in README for users

**Negligible Risk: Tools Configuration Structure**

- Straightforward object with render/tool properties
- **Mitigation:** Follow reference implementation exactly

## Security Considerations

- **Link Validation:** LinkTool should validate URL format (Yoopta default behavior)
- **XSS in Marks:** Text marks are safe (Bold, Italic, etc. are semantic HTML)
- **ActionMenu Injection:** Plugin list hardcoded, no user input

## Unresolved Questions

1. Should we customize tool renders with shadcn/ui in Phase 04 or defer? (Defer if complex)
2. Do we need additional marks (e.g., Subscript, Superscript)? (Not in reference, skip)
3. Should tools be configurable per-editor instance? (Yes, via props - already supported)

## Next Steps

1. Complete all implementation steps
2. Test all tools and marks thoroughly
3. Commit with message: `feat(beqeek-editor): add ActionMenu, Toolbar, LinkTool and 6 text marks`
4. Proceed to **Phase 05: Media Upload Abstraction** for file handling
