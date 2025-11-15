# @workspace/beqeek-editor

Notion-like large document editor powered by Yoopta Editor v4.

## Overview

This package provides a comprehensive, feature-rich document editor for the Beqeek platform, built on top of Yoopta Editor v4. It includes 14 plugins, 3 tools, and 6 text formatting marks, integrated with shadcn/ui components for design system compliance.

## Features

- **Rich Text Editing:** Headings, paragraphs, blockquotes, links
- **Lists:** Numbered, bulleted, and todo lists
- **Media:** Image, video, file uploads with abstract provider interface
- **Structural Elements:** Tables, accordions, dividers, callouts
- **Code Blocks:** Syntax highlighting with theme support
- **Embeds:** YouTube, Vimeo, and other embed support
- **Text Formatting:** Bold, italic, underline, strikethrough, code, highlight
- **Collaborative Tools:** ActionMenu, Toolbar, LinkTool
- **Large Documents:** Optimized for handling extensive content

## Installation

```bash
pnpm add @workspace/beqeek-editor
```

## Usage

### Quick Start (Complete Setup)

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import { getDefaultEditorConfig } from '@workspace/beqeek-editor/plugins';
import { useMemo } from 'react';

function MyDocument() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const { plugins, tools, marks } = useMemo(() => getDefaultEditorConfig(), []);

  return (
    <BeqeekEditor
      editor={editor}
      plugins={plugins}
      tools={tools}
      marks={marks}
      autoFocus
      placeholder="Start typing..."
    />
  );
}
```

**Included Features:**

- **Typography**: Headings (H1-H3), Paragraphs, Blockquotes, Links
- **Lists**: Numbered, Bulleted, Todo lists
- **Structural**: Tables, Accordions, Dividers, Callouts
- **Media**: Images, Videos, Files, Embeds
- **Code**: Syntax-highlighted code blocks
- **Tools**: ActionMenu (slash commands), Toolbar (selection formatting), LinkTool
- **Marks**: Bold, Italic, Code, Underline, Strike, Highlight

### Basic Example (Plugins Only)

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import { getDefaultPlugins } from '@workspace/beqeek-editor/plugins';
import { useMemo } from 'react';

function MyDocument() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const plugins = useMemo(() => getDefaultPlugins(), []);

  return <BeqeekEditor editor={editor} plugins={plugins} autoFocus placeholder="Start typing..." />;
}
```

### With State Management

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import { getDefaultEditorConfig } from '@workspace/beqeek-editor/plugins';
import type { EditorValue } from '@workspace/beqeek-editor/types';
import { useMemo, useState } from 'react';

function ControlledEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const { plugins, tools, marks } = useMemo(() => getDefaultEditorConfig(), []);
  const [value, setValue] = useState<EditorValue>({});

  return (
    <BeqeekEditor editor={editor} plugins={plugins} tools={tools} marks={marks} value={value} onChange={setValue} />
  );
}
```

### Keyboard Shortcuts

**Text Formatting (Marks):**

- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + U` - Underline
- `Cmd/Ctrl + E` - Code mark
- `Cmd/Ctrl + Shift + X` - Strikethrough
- `Cmd/Ctrl + Shift + H` - Highlight

**Editing Tools:**

- `/` - Open ActionMenu (slash commands for block insertion)
- Select text - Toolbar appears automatically
- `Cmd/Ctrl + K` - Insert/edit link (LinkTool)

### Custom Configuration

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import {
  getTypographyPlugins,
  getListPlugins,
  getDefaultTools,
  getDefaultMarks,
} from '@workspace/beqeek-editor/plugins';
import { useMemo } from 'react';

function CustomEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);

  // Use only specific plugin categories
  const plugins = useMemo(() => [...getTypographyPlugins(), ...getListPlugins()], []);

  const tools = useMemo(() => getDefaultTools(), []);
  const marks = useMemo(() => getDefaultMarks(), []);

  return <BeqeekEditor editor={editor} plugins={plugins} tools={tools} marks={marks} />;
}
```

### API Reference

Full documentation will be available in Phase 07.

## Development

```bash
# Build package
pnpm --filter @workspace/beqeek-editor build

# Type check
pnpm --filter @workspace/beqeek-editor check-types

# Lint
pnpm --filter @workspace/beqeek-editor lint
```

## Architecture

Package follows monorepo patterns from `@workspace/comments`:

- ESM-only module system
- TypeScript strict mode
- Multi-entry exports for tree-shaking
- shadcn/ui component integration
- React 19 compatibility

## License

Private - Beqeek Platform
