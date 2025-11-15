# Phase 07: Documentation & Examples

**Parent Plan:** [plan.md](./plan.md)
**Phase:** 07/07
**Dependencies:** Phase 06 (TypeScript types complete)

## Context

Create comprehensive documentation with usage examples, API reference, integration guide, and troubleshooting. Ensure developers can adopt the package without prior Yoopta knowledge.

**Reference Files:**

- `/packages/comments/README.md` - Package README pattern
- `/docs/yoopta-editor/large_document_code.md` - Reference implementation

## Overview

**Date:** 2025-11-15
**Description:** Write complete documentation with examples and integration guide
**Priority:** P1 - Developer onboarding
**Implementation Status:** Not Started
**Review Status:** Pending

## Key Insights

1. **Progressive Examples:** Start simple (minimal setup) → intermediate (custom plugins) → advanced (custom providers)
2. **Integration Guide:** Show how to use in apps/web with existing features (Active Tables, Workflows)
3. **API Reference:** Document all exports, props, types with examples
4. **Troubleshooting:** Common issues and solutions (React 19 compat, upload errors, etc.)
5. **Vietnamese Documentation:** Consider Vietnamese README for local team
6. **Live Examples:** Link to Yoopta official examples for visual reference

## Requirements

### Functional Requirements

- [x] README.md with installation, usage, API reference
- [x] Integration guide for apps/web
- [x] Code examples (basic, intermediate, advanced)
- [x] Troubleshooting section
- [x] Contributing guidelines
- [x] Changelog template
- [x] TypeScript type documentation

### Non-Functional Requirements

- Clear, concise writing (sacrifice grammar for concision)
- Code examples must compile
- Vietnamese translation (optional - defer if time-constrained)
- Link to Yoopta official docs for deep dives
- Markdown formatting for readability

## Architecture

### Documentation Structure

```
packages/beqeek-editor/
├── README.md                   # Main documentation
├── CHANGELOG.md                # Version history
├── INTEGRATION.md              # Integration guide for apps/web
├── TROUBLESHOOTING.md          # Common issues
├── CONTRIBUTING.md             # Development guide
└── examples/
    ├── basic.tsx               # Minimal setup
    ├── custom-plugins.tsx      # Custom plugin configuration
    ├── cloudinary-upload.tsx   # Cloudinary integration
    └── controlled-mode.tsx     # Controlled editor
```

### README.md Structure

```markdown
# @workspace/beqeek-editor

> Notion-like large document editor powered by Yoopta Editor v4

## Features

## Installation

## Quick Start

## Usage

- Basic Setup
- With Default Configuration
- Custom Plugin Configuration
- Media Upload Configuration
- Controlled Mode

## API Reference

- Components
- Hooks
- Configuration Functions
- Types
- Utilities

## Integration Guide

## Troubleshooting

## Contributing

## License
```

## Related Code Files

**New Files (Create):**

- `/packages/beqeek-editor/README.md`
- `/packages/beqeek-editor/CHANGELOG.md`
- `/packages/beqeek-editor/INTEGRATION.md`
- `/packages/beqeek-editor/TROUBLESHOOTING.md`
- `/packages/beqeek-editor/CONTRIBUTING.md`
- `/packages/beqeek-editor/examples/basic.tsx`
- `/packages/beqeek-editor/examples/custom-plugins.tsx`
- `/packages/beqeek-editor/examples/cloudinary-upload.tsx`
- `/packages/beqeek-editor/examples/controlled-mode.tsx`

**Reference Files:**

- `/packages/comments/README.md`
- `/docs/yoopta-editor/large_document_code.md`

## Implementation Steps

### Step 1: Create README.md

````markdown
# @workspace/beqeek-editor

> Notion-like large document editor for Beqeek platform, powered by Yoopta Editor v4

## Features

- 🚀 **14 Built-in Plugins:** Typography, lists, tables, accordions, code, media
- 🎨 **shadcn/ui Integration:** Consistent design system compliance
- 📤 **Flexible Media Upload:** Abstract provider interface (Cloudinary, S3, etc.)
- ⌨️ **Rich Editing Tools:** ActionMenu (slash commands), Toolbar, LinkTool
- 🎯 **Text Formatting:** Bold, Italic, Code, Underline, Strike, Highlight
- 📝 **Large Documents:** Optimized for extensive content (Yoopta v4 performance)
- 🌍 **i18n Ready:** Vietnamese/English support
- 🔧 **TypeScript:** Full type safety with strict mode
- ♿ **Accessible:** WCAG 2.1 AA compliant (via shadcn/ui)

## Installation

```bash
# Already installed as workspace package
# Import directly in apps/web
```
````

## Quick Start

```tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import { useMemo } from 'react';

function MyDocument() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const config = useMemo(() => getDefaultEditorConfig(), []);

  return <BeqeekEditor editor={editor} plugins={config.plugins} tools={config.tools} marks={config.marks} autoFocus />;
}
```

## Usage

### Basic Setup (Minimal)

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import { getDefaultPlugins } from '@workspace/beqeek-editor';
import { useMemo } from 'react';

function MinimalEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const plugins = useMemo(() => getDefaultPlugins(), []);

  return <BeqeekEditor editor={editor} plugins={plugins} />;
}
```

### With Media Upload Provider (Cloudinary)

```tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import type { MediaUploadProvider } from '@workspace/beqeek-editor/types';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { useMemo } from 'react';

const cloudinaryProvider: MediaUploadProvider = {
  uploadImage: async (file) => {
    const data = await uploadToCloudinary(file, 'image');
    return {
      src: data.secure_url,
      alt: file.name,
      sizes: { width: data.width, height: data.height },
    };
  },
  uploadVideo: async (file) => {
    const data = await uploadToCloudinary(file, 'video');
    return {
      src: data.secure_url,
      alt: file.name,
      sizes: { width: data.width, height: data.height },
    };
  },
  uploadVideoPoster: async (file) => {
    const data = await uploadToCloudinary(file, 'image');
    return { src: data.secure_url };
  },
  uploadFile: async (file) => {
    const data = await uploadToCloudinary(file, 'auto');
    return {
      src: data.secure_url,
      format: data.format,
      name: file.name,
      size: data.bytes,
    };
  },
};

function EditorWithUpload() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const config = useMemo(() => getDefaultEditorConfig(cloudinaryProvider), []);

  return <BeqeekEditor editor={editor} plugins={config.plugins} tools={config.tools} marks={config.marks} />;
}
```

### Custom Plugin Configuration

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import {
  getTypographyPlugins,
  getListPlugins,
  getCodePlugin,
  getDefaultTools,
  getDefaultMarks,
} from '@workspace/beqeek-editor';
import { useMemo } from 'react';

function CustomEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);

  const plugins = useMemo(
    () => [
      ...getTypographyPlugins(), // H1, H2, H3, P, Blockquote, Link
      ...getListPlugins(), // Numbered, Bulleted, Todo
      getCodePlugin(), // Code blocks only
    ],
    [],
  );

  const tools = useMemo(() => getDefaultTools(), []);
  const marks = useMemo(() => getDefaultMarks(), []);

  return <BeqeekEditor editor={editor} plugins={plugins} tools={tools} marks={marks} />;
}
```

### Controlled Mode

```tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import type { EditorValue } from '@workspace/beqeek-editor/types';
import { useMemo, useState } from 'react';

function ControlledEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const config = useMemo(() => getDefaultEditorConfig(), []);
  const [value, setValue] = useState<EditorValue>({});

  const handleChange = (newValue: EditorValue) => {
    setValue(newValue);
    // Auto-save to backend
    saveToBackend(newValue);
  };

  return (
    <BeqeekEditor
      editor={editor}
      plugins={config.plugins}
      tools={config.tools}
      marks={config.marks}
      value={value}
      onChange={handleChange}
    />
  );
}
```

## API Reference

### Components

#### `<BeqeekEditor />`

Main editor component.

**Props:**

| Prop           | Type                           | Default     | Description                                 |
| -------------- | ------------------------------ | ----------- | ------------------------------------------- |
| `editor`       | `YooEditor`                    | -           | Editor instance from `createBeqeekEditor()` |
| `plugins`      | `PluginElementsMap[]`          | -           | Array of Yoopta plugins                     |
| `tools`        | `ToolsConfig`                  | `undefined` | Tools configuration                         |
| `marks`        | `MarksArray`                   | `undefined` | Text formatting marks                       |
| `value`        | `EditorValue`                  | `undefined` | Controlled mode value                       |
| `defaultValue` | `EditorValue`                  | `{}`        | Uncontrolled mode default                   |
| `onChange`     | `(value: EditorValue) => void` | `undefined` | Change handler                              |
| `autoFocus`    | `boolean`                      | `true`      | Auto-focus on mount                         |
| `readOnly`     | `boolean`                      | `false`     | Read-only mode                              |
| `placeholder`  | `string`                       | `undefined` | Placeholder text                            |
| `className`    | `string`                       | `undefined` | Additional CSS classes                      |

### Hooks

#### `createBeqeekEditor()`

Creates Yoopta editor instance. Call once per component (use `useMemo`).

**Returns:** `YooEditor`

**Example:**

```tsx
const editor = useMemo(() => createBeqeekEditor(), []);
```

### Configuration Functions

#### `getDefaultEditorConfig(mediaUploadProvider?)`

Returns complete editor configuration with all plugins, tools, marks.

**Parameters:**

- `mediaUploadProvider?: MediaUploadProvider` - Optional upload provider

**Returns:** `EditorConfig`

#### `getDefaultPlugins(mediaUploadProvider?)`

Returns all 14 default plugins.

#### `getDefaultTools()`

Returns default tools (ActionMenu, Toolbar, LinkTool).

#### `getDefaultMarks()`

Returns default marks (Bold, Italic, Code, Underline, Strike, Highlight).

#### `getTypographyPlugins()`

Returns typography plugins (Paragraph, H1, H2, H3, Blockquote, Link).

#### `getListPlugins()`

Returns list plugins (Numbered, Bulleted, Todo).

#### `getStructuralPlugins()`

Returns structural plugins (Table, Accordion, Divider, Callout).

#### `getMediaPlugins(provider?)`

Returns media plugins (Image, Video, File, Embed).

#### `getCodePlugin()`

Returns code block plugin.

### Types

See [types/index.ts](./src/types/index.ts) for complete type reference.

**Key Types:**

- `EditorValue` - Editor content structure
- `MediaUploadProvider` - Upload provider interface
- `BeqeekEditorProps` - Component props
- `EditorConfig` - Configuration object
- `ImageUploadResult`, `VideoUploadResult`, `FileUploadResult` - Upload result types

### Utilities

#### `defaultMediaUploadProvider`

Default upload provider using blob URLs (development only).

#### `isEditorValue(value: unknown): boolean`

Type guard for EditorValue.

#### `isMediaUploadProvider(value: unknown): boolean`

Type guard for MediaUploadProvider.

## Integration Guide

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration guide with apps/web.

**Quick integration steps:**

1. Import editor and config factories
2. Create upload provider (Cloudinary, S3, etc.)
3. Use `getDefaultEditorConfig(provider)` or compose custom config
4. Render `<BeqeekEditor>` with editor instance and config

## Keyboard Shortcuts

**Text Formatting:**

- `Cmd+B` / `Ctrl+B` - Bold
- `Cmd+I` / `Ctrl+I` - Italic
- `Cmd+U` / `Ctrl+U` - Underline
- `Cmd+E` / `Ctrl+E` - Code
- `Cmd+Shift+X` - Strikethrough
- `Cmd+Shift+H` - Highlight

**Block Actions:**

- `/` - Open ActionMenu (insert blocks)
- `Enter` - New paragraph
- `Tab` - Indent
- `Shift+Tab` - Outdent

**Selection:**

- Text selection - Open Toolbar
- Drag blocks - Reorder content

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

**Quick fixes:**

- **Build errors:** Run `pnpm build` from monorepo root
- **Type errors:** Ensure React 19 and slate peer deps installed
- **Upload not working:** Check MediaUploadProvider implementation
- **Styles missing:** Import `@yoopta/editor` CSS in your app

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guide.

## Resources

- [Yoopta Editor Official Docs](https://yoopta.dev)
- [Yoopta Examples](https://yoopta.dev/examples/withShadcnUILibrary)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Beqeek Design System](../../docs/design-system.md)

## License

Private workspace package - Beqeek Platform

````

### Step 2: Create INTEGRATION.md

```markdown
# Integration Guide

## Integrating @workspace/beqeek-editor in apps/web

### Prerequisites

- React 19+ installed
- @workspace/ui package configured
- TailwindCSS v4 setup complete

### Step 1: Create Upload Provider

If using Cloudinary:

```typescript
// apps/web/src/utils/cloudinary-upload-provider.ts
import type { MediaUploadProvider } from '@workspace/beqeek-editor/types';
import { uploadToCloudinary } from './cloudinary';

export const cloudinaryUploadProvider: MediaUploadProvider = {
  uploadImage: async (file) => {
    const data = await uploadToCloudinary(file, 'image');
    return {
      src: data.secure_url,
      alt: file.name,
      sizes: { width: data.width, height: data.height },
    };
  },
  uploadVideo: async (file) => {
    const data = await uploadToCloudinary(file, 'video');
    return {
      src: data.secure_url,
      alt: file.name,
      sizes: { width: data.width, height: data.height },
    };
  },
  uploadVideoPoster: async (file) => {
    const data = await uploadToCloudinary(file, 'image');
    return { src: data.secure_url };
  },
  uploadFile: async (file) => {
    const data = await uploadToCloudinary(file, 'auto');
    return {
      src: data.secure_url,
      format: data.format,
      name: file.name,
      size: data.bytes,
    };
  },
};
````

### Step 2: Create Editor Component

```typescript
// apps/web/src/features/documents/components/document-editor.tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import { cloudinaryUploadProvider } from '@/utils/cloudinary-upload-provider';
import { useMemo } from 'react';

export function DocumentEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const config = useMemo(
    () => getDefaultEditorConfig(cloudinaryUploadProvider),
    []
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <BeqeekEditor
        editor={editor}
        plugins={config.plugins}
        tools={config.tools}
        marks={config.marks}
        placeholder="Start typing..."
      />
    </div>
  );
}
```

### Step 3: Create Route

```typescript
// apps/web/src/routes/$locale/documents/$documentId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const DocumentEditorLazy = lazy(() =>
  import('@/features/documents/components/document-editor').then((m) => ({
    default: m.DocumentEditor,
  }))
);

export const Route = createFileRoute('/$locale/documents/$documentId')({
  component: DocumentPage,
});

function DocumentPage() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <DocumentEditorLazy />
    </Suspense>
  );
}
```

### Step 4: Add to Active Tables (Rich Text Field)

For Active Tables rich text fields:

```typescript
// apps/web/src/features/active-tables/components/rich-text-editor.tsx
import { BeqeekEditor, createBeqeekEditor, getTypographyPlugins, getDefaultTools, getDefaultMarks } from '@workspace/beqeek-editor';
import type { EditorValue } from '@workspace/beqeek-editor/types';
import { useMemo } from 'react';

interface RichTextEditorProps {
  value: EditorValue;
  onChange: (value: EditorValue) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const plugins = useMemo(() => getTypographyPlugins(), []); // Typography only
  const tools = useMemo(() => getDefaultTools(), []);
  const marks = useMemo(() => getDefaultMarks(), []);

  return (
    <BeqeekEditor
      editor={editor}
      plugins={plugins}
      tools={tools}
      marks={marks}
      value={value}
      onChange={onChange}
      className="border rounded-md p-4"
    />
  );
}
```

### Step 5: Persist to Backend

```typescript
// apps/web/src/features/documents/hooks/useDocumentEditor.ts
import { useState, useCallback } from 'react';
import type { EditorValue } from '@workspace/beqeek-editor/types';
import { useMutation } from '@tanstack/react-query';
import { documentsApi } from '../api';

export function useDocumentEditor(documentId: string) {
  const [value, setValue] = useState<EditorValue>({});

  const saveMutation = useMutation({
    mutationFn: (content: EditorValue) => documentsApi.update(documentId, { content }),
  });

  const handleChange = useCallback(
    (newValue: EditorValue) => {
      setValue(newValue);
      // Debounced auto-save
      saveMutation.mutate(newValue);
    },
    [saveMutation],
  );

  return { value, onChange: handleChange };
}
```

## Advanced Integrations

### With E2EE (Encrypted Documents)

```typescript
import { encryptEditorValue, decryptEditorValue } from '@workspace/encryption-core';
import type { EditorValue } from '@workspace/beqeek-editor/types';

// Encrypt before save
const encryptedContent = encryptEditorValue(editorValue, encryptionKey);
await documentsApi.save({ content: encryptedContent });

// Decrypt after load
const decryptedValue = decryptEditorValue(encryptedContent, encryptionKey);
setValue(decryptedValue);
```

### With Workflows (Approval Process)

```typescript
// Add approval metadata to editor value
const editorValueWithMetadata = {
  ...editorValue,
  _metadata: {
    status: 'pending_approval',
    reviewerId: currentUserId,
    version: 1,
  },
};
```

````

### Step 3: Create TROUBLESHOOTING.md

```markdown
# Troubleshooting

## Common Issues

### Build Errors

**Error:** `Cannot find module '@workspace/beqeek-editor'`

**Solution:**
```bash
# Build package first
pnpm --filter @workspace/beqeek-editor build

# Then build web app
pnpm --filter web build
````

### Type Errors

**Error:** `Type 'YooEditor' is not assignable to type '...'`

**Solution:** Ensure peer dependencies installed:

```bash
pnpm install react@^19.0.0 react-dom@^19.0.0 slate@^0.103.0 slate-react@^0.110.0
```

### Upload Not Working

**Error:** Media files not uploading or showing blob URLs

**Solution:** Verify MediaUploadProvider implementation:

```typescript
// Check all methods implemented
const provider: MediaUploadProvider = {
  uploadImage: async (file) => {
    /* ... */
  },
  uploadVideo: async (file) => {
    /* ... */
  },
  uploadVideoPoster: async (file) => {
    /* ... */
  },
  uploadFile: async (file) => {
    /* ... */
  },
};
```

### Styles Missing

**Error:** Editor has no styling or looks broken

**Solution:** Import Yoopta CSS in your app:

```typescript
// apps/web/src/main.tsx
import '@yoopta/editor/dist/style.css'; // Add this
```

### React 19 Compatibility

**Error:** `React.renderSubtreeIntoContainer is not a function`

**Solution:** Yoopta v4 should support React 19. If issues persist, check versions:

```json
{
  "dependencies": {
    "@yoopta/editor": "^4.0.0", // Ensure v4+
    "react": "^19.0.0"
  }
}
```

### ActionMenu Not Appearing

**Error:** Typing `/` does not show block menu

**Solution:** Ensure tools configured:

```typescript
const tools = getDefaultTools();
<BeqeekEditor tools={tools} />
```

### Toolbar Not Appearing

**Error:** Selecting text does not show formatting toolbar

**Solution:** Verify marks configured:

```typescript
const marks = getDefaultMarks();
<BeqeekEditor marks={marks} />
```

## Performance Issues

### Slow Rendering with Large Documents

**Solution:** Use virtualization (Yoopta handles internally, but can optimize):

```typescript
// Limit initial plugins for faster load
const plugins = useMemo(
  () => [
    ...getTypographyPlugins(),
    ...getListPlugins(),
    // Add media plugins only when needed
  ],
  [],
);
```

### Memory Leaks with Blob URLs

**Solution:** Revoke blob URLs when unmounting:

```typescript
useEffect(() => {
  return () => {
    // Revoke blob URLs if using default provider
    Object.values(editorValue).forEach((block) => {
      if (block.type === 'Image' && block.value.src.startsWith('blob:')) {
        URL.revokeObjectURL(block.value.src);
      }
    });
  };
}, [editorValue]);
```

## Still Having Issues?

1. Check [Yoopta official docs](https://yoopta.dev)
2. Review [large_document_code.md](../../docs/yoopta-editor/large_document_code.md)
3. Search Beqeek codebase for existing editor usage patterns

````

### Step 4: Create CONTRIBUTING.md

```markdown
# Contributing to @workspace/beqeek-editor

## Development Setup

```bash
# Install dependencies
pnpm install

# Build package
pnpm --filter @workspace/beqeek-editor build

# Watch mode
pnpm --filter @workspace/beqeek-editor build --watch

# Type check
pnpm --filter @workspace/beqeek-editor check-types

# Lint
pnpm --filter @workspace/beqeek-editor lint
````

## Project Structure

```
src/
├── components/   # React components
├── plugins/      # Yoopta plugin configurations
├── tools/        # Editor tools
├── marks/        # Text marks
├── hooks/        # React hooks
├── types/        # TypeScript types
├── utils/        # Helper utilities
└── constants/    # Default configurations
```

## Adding New Plugins

1. Install Yoopta plugin: `pnpm add @yoopta/your-plugin`
2. Create config in `plugins/your-category.ts`
3. Add shadcn render component in `components/renders/`
4. Export from `plugins/index.ts`
5. Update `getDefaultPlugins()` if default

## Adding New Types

1. Define in `types/your-module.ts`
2. Export from `types/index.ts`
3. Add JSDoc comments
4. Update README API reference

## Code Standards

- TypeScript strict mode
- JSDoc for all public APIs
- Consistent naming (PascalCase components, camelCase functions)
- Use design system tokens (no hardcoded colors)
- Follow existing patterns

## Testing

Currently no automated tests. Test manually in apps/web:

```typescript
// apps/web/src/features/test-editor.tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';

export function TestEditor() {
  // Test your changes here
}
```

## Submitting Changes

1. Create feature branch: `feat/your-feature`
2. Make changes
3. Build and type-check: `pnpm build && pnpm check-types`
4. Test in apps/web
5. Commit: `feat(beqeek-editor): your description`
6. Create PR

## Questions?

Check codebase or ask team.

````

### Step 5: Create CHANGELOG.md

```markdown
# Changelog

## [0.1.0] - 2025-11-15

### Added

- Initial package setup with Yoopta Editor v4
- 14 default plugins (Typography, Lists, Structural, Media, Code)
- shadcn/ui component renders
- ActionMenu, Toolbar, LinkTool
- 6 text formatting marks
- Media upload abstraction layer
- TypeScript strict mode support
- Comprehensive documentation

### Plugin Support

- Typography: Paragraph, H1, H2, H3, Blockquote, Link
- Lists: Numbered, Bulleted, Todo
- Structural: Table, Accordion, Divider, Callout
- Media: Image, Video, File, Embed
- Code: Syntax-highlighted code blocks

### Breaking Changes

None (initial release)

---

## Future Versions

Track changes here as package evolves.
````

### Step 6: Create Example Files

**examples/basic.tsx:**

```tsx
// See Quick Start in README
```

**examples/custom-plugins.tsx:**

```tsx
// See Custom Plugin Configuration in README
```

**examples/cloudinary-upload.tsx:**

```tsx
// See With Media Upload Provider in README
```

**examples/controlled-mode.tsx:**

```tsx
// See Controlled Mode in README
```

### Step 7: Update package.json with Metadata

```json
{
  "name": "@workspace/beqeek-editor",
  "version": "0.1.0",
  "description": "Notion-like large document editor powered by Yoopta Editor v4",
  "keywords": ["editor", "yoopta", "rich-text", "notion", "large-documents", "react"],
  "author": "Beqeek Team",
  "repository": {
    "type": "git",
    "url": "https://github.com/beqeek/beqeek",
    "directory": "packages/beqeek-editor"
  }
}
```

### Step 8: Validate Documentation

- [ ] All code examples compile
- [ ] Links work (internal and external)
- [ ] API reference complete
- [ ] Examples cover common use cases
- [ ] Troubleshooting addresses known issues

### Step 9: Final Review

Read through all documentation as new developer. Ensure:

- Can install and use package without prior knowledge
- Examples are clear and runnable
- API reference is comprehensive
- Troubleshooting solves common problems

## Todo

- [ ] Write README.md with features, usage, API reference
- [ ] Create INTEGRATION.md with apps/web integration guide
- [ ] Create TROUBLESHOOTING.md with common issues
- [ ] Create CONTRIBUTING.md with development guide
- [ ] Create CHANGELOG.md with version history
- [ ] Create example files (basic, custom, upload, controlled)
- [ ] Update package.json metadata (keywords, description, repository)
- [ ] Validate all code examples compile
- [ ] Test examples in apps/web
- [ ] Review documentation for clarity
- [ ] (Optional) Create Vietnamese README.vi.md

## Success Criteria

- [x] README.md complete with all sections
- [x] INTEGRATION.md covers apps/web usage
- [x] TROUBLESHOOTING.md addresses common issues
- [x] CONTRIBUTING.md guides developers
- [x] All code examples compile and run
- [x] API reference documents all exports
- [x] Examples cover 80% of use cases
- [x] New developer can use package without assistance
- [x] Documentation follows concise writing style

## Risk Assessment

**Low Risk: Code Examples**

- Examples may become outdated as package evolves
- **Mitigation:** Test examples during build, update with package changes

**Low Risk: External Links**

- Yoopta docs URLs may change
- **Mitigation:** Use versioned docs URLs when possible

**Negligible Risk: Documentation Clarity**

- May need iteration based on user feedback
- **Mitigation:** Update docs as questions arise

## Security Considerations

- No sensitive data in documentation
- Examples use placeholder API keys
- Warn about production upload provider security

## Next Steps

1. Complete all documentation files
2. Test all code examples in apps/web
3. Review with team for feedback
4. Commit with message: `docs(beqeek-editor): add comprehensive documentation and examples`
5. **Package complete and ready for use!**
