# Phase 03: Document Editor Core Implementation

**Phase**: 03/08
**Duration**: 3 hours
**Status**: ⏸️ Pending
**Priority**: P1
**Depends on**: Phase 02

## Context

- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 02 (package scaffolded)
- **Blocks**: Phases 06, 07
- **References**:
  - [Yoopta shadcn example](https://github.com/yoopta-editor/Yoopta-Editor/blob/master/web/next-example/src/components/examples/withShadcnUILibrary/index.tsx)
  - Research: [251115-yoopta-editor-v4-analysis.md](./research/251115-yoopta-editor-v4-analysis.md)

## Overview

**Description**: Implement full-featured DocumentEditor component with all 14 Yoopta plugins, tools, marks, and shadcn/ui integration.

**Goal**: Working Notion-like editor for Active Tables large documents.

## Key Insights

- All plugins configured via `.extend()` for shadcn renders
- Tools (ActionMenu, Toolbar, LinkTool) need default renders
- File uploads (Image, Video, File) need `onUpload` handlers
- Export/import via `@yoopta/exports` package

## Requirements

### Functional

- FR1: Render DocumentEditor with all 14 plugins
- FR2: Slash command menu (/) shows all plugins
- FR3: Floating toolbar for marks (Bold, Italic, etc.)
- FR4: File upload for images/videos
- FR5: Export to markdown/HTML

### Non-Functional

- NFR1: Type-safe props interface
- NFR2: Uses shadcn/ui Typography components
- NFR3: Follows Beqeek design tokens
- NFR4: Memoizes editor instance

## Architecture

### Plugin Configuration

```
Plugins (14 total):
├── Content blocks
│   ├── Paragraph (always first)
│   ├── HeadingOne, HeadingTwo, HeadingThree
│   ├── Blockquote
│   ├── BulletedList, NumberedList, TodoList
│   ├── Divider
│   └── Callout
├── Code & Data
│   ├── Code (with syntax highlighting)
│   └── Table (with merge cells support)
├── Media
│   ├── Image (with upload)
│   ├── Video (with upload)
│   ├── File (with upload)
│   └── Embed (YouTube, etc.)
└── Structure
    ├── Accordion (collapsible sections)
    └── Link (inline links)

Marks (6 total):
├── Bold (Cmd+B)
├── Italic (Cmd+I)
├── CodeMark (inline code)
├── Underline (Cmd+U)
├── Strike (strikethrough)
└── Highlight (background color)

Tools (3 total):
├── ActionMenuList (slash commands)
├── Toolbar (floating toolbar)
└── LinkTool (link editor)
```

## Implementation Steps

### Step 1: Create plugin configuration

File: `/packages/beqeek-editor/src/document-editor/plugins.ts`

```typescript
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import Code from '@yoopta/code';
import Table from '@yoopta/table';
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import Embed from '@yoopta/embed';
import Accordion from '@yoopta/accordion';
import Divider from '@yoopta/divider';
import Callout from '@yoopta/callout';
import Link from '@yoopta/link';

// shadcn/ui Typography components
import {
  TypographyP,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyBlockquote,
} from '@workspace/ui/components/typography';

export interface DocumentPluginsConfig {
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
  onVideoUpload?: (file: File) => Promise<{ src: string; poster?: string }>;
  onFileUpload?: (file: File) => Promise<{ src: string; name: string; size: number }>;
}

export function createDocumentPlugins(config?: DocumentPluginsConfig) {
  const { onImageUpload, onVideoUpload, onFileUpload } = config || {};

  return [
    Paragraph.extend({
      renders: {
        paragraph: ({ children }) => <TypographyP>{children}</TypographyP>,
      },
    }),
    HeadingOne.extend({
      renders: {
        'heading-one': ({ children }) => <TypographyH1>{children}</TypographyH1>,
      },
    }),
    HeadingTwo.extend({
      renders: {
        'heading-two': ({ children }) => <TypographyH2>{children}</TypographyH2>,
      },
    }),
    HeadingThree.extend({
      renders: {
        'heading-three': ({ children }) => <TypographyH3>{children}</TypographyH3>,
      },
    }),
    Blockquote.extend({
      renders: {
        blockquote: ({ children }) => <TypographyBlockquote>{children}</TypographyBlockquote>,
      },
    }),
    BulletedList,
    NumberedList,
    TodoList,
    Code.extend({
      options: {
        display: {
          title: 'Code Block',
          description: 'Insert code with syntax highlighting',
        },
      },
    }),
    Table,
    Image.extend({
      options: {
        onUpload: onImageUpload,
      },
    }),
    Video.extend({
      options: {
        onUpload: onVideoUpload,
      },
    }),
    File.extend({
      options: {
        onUpload: onFileUpload,
      },
    }),
    Embed,
    Accordion,
    Divider,
    Callout,
    Link,
  ];
}
```

### Step 2: Create marks configuration

File: `/packages/beqeek-editor/src/document-editor/marks.ts`

```typescript
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';

export const DOCUMENT_MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];
```

### Step 3: Create tools configuration

File: `/packages/beqeek-editor/src/document-editor/tools.ts`

```typescript
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

export const DOCUMENT_TOOLS = {
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
```

### Step 4: Create DocumentEditor component

File: `/packages/beqeek-editor/src/document-editor/DocumentEditor.tsx`

```typescript
import YooptaEditor, { createYooptaEditor, type YooptaContentValue } from '@yoopta/editor';
import { useMemo, useRef } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { createDocumentPlugins, type DocumentPluginsConfig } from './plugins.js';
import { DOCUMENT_MARKS } from './marks.js';
import { DOCUMENT_TOOLS } from './tools.js';

export interface DocumentEditorProps {
  /** Editor content value */
  value?: YooptaContentValue;
  /** Content change callback */
  onChange?: (value: YooptaContentValue) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Image upload handler */
  onImageUpload?: DocumentPluginsConfig['onImageUpload'];
  /** Video upload handler */
  onVideoUpload?: DocumentPluginsConfig['onVideoUpload'];
  /** File upload handler */
  onFileUpload?: DocumentPluginsConfig['onFileUpload'];
  /** Additional CSS classes */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function DocumentEditor({
  value,
  onChange,
  placeholder = "Type '/' for commands",
  autoFocus = true,
  readOnly = false,
  onImageUpload,
  onVideoUpload,
  onFileUpload,
  className,
  style,
}: DocumentEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);

  const plugins = useMemo(
    () =>
      createDocumentPlugins({
        onImageUpload,
        onVideoUpload,
        onFileUpload,
      }),
    [onImageUpload, onVideoUpload, onFileUpload]
  );

  const selectionBoxRoot = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={selectionBoxRoot}
      className={cn(
        'document-editor',
        'prose prose-slate dark:prose-invert max-w-none',
        'p-6 md:p-8 lg:p-12',
        className
      )}
      style={style}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        marks={DOCUMENT_MARKS}
        tools={DOCUMENT_TOOLS}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        readOnly={readOnly}
        selectionBoxRoot={selectionBoxRoot}
      />
    </div>
  );
}
```

### Step 5: Create custom hook

File: `/packages/beqeek-editor/src/hooks/useDocumentEditor.ts`

```typescript
import { createYooptaEditor, type YooptaContentValue } from '@yoopta/editor';
import { useMemo, useState } from 'react';

export interface UseDocumentEditorOptions {
  initialValue?: YooptaContentValue;
}

export function useDocumentEditor(options?: UseDocumentEditorOptions) {
  const { initialValue } = options || {};

  const editor = useMemo(() => createYooptaEditor(), []);
  const [value, setValue] = useState<YooptaContentValue>(initialValue || {});

  const isEmpty = useMemo(() => {
    return editor.isEmpty();
  }, [editor, value]);

  const reset = () => {
    setValue({});
    editor.setEditorValue({});
  };

  return {
    editor,
    value,
    setValue,
    isEmpty,
    reset,
  };
}
```

### Step 6: Update exports

File: `/packages/beqeek-editor/src/document-editor/index.ts`

```typescript
export { DocumentEditor } from './DocumentEditor.js';
export type { DocumentEditorProps } from './DocumentEditor.js';
export { createDocumentPlugins } from './plugins.js';
export type { DocumentPluginsConfig } from './plugins.js';
export { DOCUMENT_MARKS } from './marks.js';
export { DOCUMENT_TOOLS } from './tools.js';
```

File: `/packages/beqeek-editor/src/hooks/index.ts`

```typescript
export { useDocumentEditor } from './useDocumentEditor.js';
export type { UseDocumentEditorOptions } from './useDocumentEditor.js';
```

### Step 7: Build & test

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek

# Build package
pnpm --filter @workspace/beqeek-editor build

# Type check
pnpm --filter @workspace/beqeek-editor check-types
```

### Step 8: Create test page in web app

File: `/apps/web/src/features/test/pages/document-editor-test.tsx`

```typescript
import { DocumentEditor } from '@workspace/beqeek-editor/document';
import { useDocumentEditor } from '@workspace/beqeek-editor/hooks';

export function DocumentEditorTest() {
  const { value, setValue } = useDocumentEditor();

  const handleImageUpload = async (file: File) => {
    // Mock upload - replace with actual API call
    const url = URL.createObjectURL(file);
    return { src: url, alt: file.name };
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Document Editor Test</h1>
      <DocumentEditor
        value={value}
        onChange={setValue}
        onImageUpload={handleImageUpload}
        onVideoUpload={handleImageUpload}
        onFileUpload={async (file) => ({
          src: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })}
      />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Content JSON:</h2>
        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

### Step 9: Manual testing checklist

Navigate to test page and verify:

- [ ] Editor renders without errors
- [ ] Type text in paragraph
- [ ] Type `/` shows action menu
- [ ] Select "Heading 1" from menu
- [ ] Text converts to H1 (large, bold)
- [ ] Type `/h2` creates Heading 2
- [ ] Type `-` creates bulleted list
- [ ] Type `1.` creates numbered list
- [ ] Select text, toolbar appears
- [ ] Click Bold button (Cmd+B)
- [ ] Click Italic button (Cmd+I)
- [ ] Type `/code` inserts code block
- [ ] Type `/table` inserts table
- [ ] Can edit table cells
- [ ] Upload image works
- [ ] Image displays correctly
- [ ] JSON preview updates on changes
- [ ] No console errors

## Todo List

- [ ] Create plugins.ts with all 14 plugins
- [ ] Create marks.ts with 6 marks
- [ ] Create tools.ts with 3 tools
- [ ] Create DocumentEditor.tsx component
- [ ] Create useDocumentEditor.ts hook
- [ ] Update document-editor/index.ts exports
- [ ] Update hooks/index.ts exports
- [ ] Build package
- [ ] Type check passes
- [ ] Create test page in web app
- [ ] Manual testing (all features)
- [ ] Fix any bugs found
- [ ] Document known issues

## Success Criteria

✅ **Phase complete when**:

- DocumentEditor component renders
- All 14 plugins functional
- Slash commands work
- Toolbar formatting works
- File upload works (mock)
- No TypeScript errors
- No runtime errors
- JSON preview updates correctly

## Next Steps

→ Proceed to [Phase 04: Chat Editor Implementation](./phase-04-chat-editor-implementation.md)

## Unresolved Questions

1. Should we add keyboard shortcuts help UI?
2. How to integrate with Active Tables file upload API?
3. Should code blocks have language selector?
4. Do we need custom table styling beyond default?
