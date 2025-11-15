# Phase 06: TypeScript Types & Exports

**Parent Plan:** [plan.md](./plan.md)
**Phase:** 06/07
**Dependencies:** Phase 05 (Media upload abstraction complete)

## Context

Finalize TypeScript type definitions, barrel exports, and JSDoc documentation for comprehensive API surface. Ensure 100% type coverage and excellent DX (developer experience).

**Reference Files:**

- `/packages/comments/src/index.ts` - Barrel export pattern
- `/packages/comments/src/types/index.ts` - Type exports pattern

## Overview

**Date:** 2025-11-15
**Description:** Polish TypeScript types, exports, and JSDoc comments
**Priority:** P1 - Developer experience
**Implementation Status:** Not Started
**Review Status:** Pending

## Key Insights

1. **Barrel Exports:** Multi-level barrel files (src/index.ts, src/types/index.ts, etc.) for clean imports
2. **Type-Only Exports:** Use `export type` for interfaces/types to prevent runtime bloat
3. **Re-exports:** Main index.ts re-exports from subdirectories for convenience
4. **JSDoc Comments:** Essential for IDE intellisense and documentation generation
5. **Specialized Exports:** package.json exports field enables `@workspace/beqeek-editor/types` imports
6. **Type Guards:** Useful for runtime type checking (e.g., `isEditorValue`)

## Requirements

### Functional Requirements

- [x] All public types exported from `types/index.ts`
- [x] All public components exported from `components/index.ts`
- [x] All public hooks exported from `hooks/index.ts`
- [x] All public utilities exported from `utils/index.ts`
- [x] Main `index.ts` re-exports all public APIs
- [x] JSDoc comments on all exported functions/types
- [x] Type guards for runtime validation (optional but useful)

### Non-Functional Requirements

- 100% type coverage (no `any` types in public API)
- Comprehensive JSDoc with @param, @returns, @example
- Consistent naming conventions (PascalCase types, camelCase functions)
- No circular dependencies
- Tree-shakeable exports

## Architecture

### Export Structure

```
@workspace/beqeek-editor           → Main exports (components, hooks, utilities)
@workspace/beqeek-editor/types     → Type definitions only
@workspace/beqeek-editor/components → Component exports
@workspace/beqeek-editor/hooks     → Hook exports
@workspace/beqeek-editor/utils     → Utility exports
```

### Type Organization

```typescript
// types/index.ts
export type {
  // Editor core types
  EditorValue,
  BeqeekEditorProps,
  EditorConfig,
} from './editor.js';

export type {
  // Tools & Marks types
  ToolsConfig,
  MarksArray,
} from './tools.js';

export type {
  // Media upload types
  MediaUploadProvider,
  ImageUploadResult,
  VideoUploadResult,
  VideoPosterUploadResult,
  FileUploadResult,
  ImageUploadHandler,
  VideoUploadHandler,
  FileUploadHandler,
} from './media.js';

export type {
  // Plugin types
  PluginConfig,
  PluginCategory,
} from './plugins.js';
```

### JSDoc Standards

````typescript
/**
 * Creates a new Beqeek editor instance.
 *
 * Use this factory function to create a Yoopta editor instance configured
 * for Beqeek's large document editing features. Call once per editor component,
 * typically inside useMemo to prevent re-initialization.
 *
 * @returns {YooEditor} Configured Yoopta editor instance
 *
 * @example
 * ```tsx
 * import { createBeqeekEditor } from '@workspace/beqeek-editor';
 * import { useMemo } from 'react';
 *
 * function MyEditor() {
 *   const editor = useMemo(() => createBeqeekEditor(), []);
 *   return <BeqeekEditor editor={editor} plugins={[]} />;
 * }
 * ```
 */
export function createBeqeekEditor(): YooEditor {
  return createYooptaEditor();
}
````

### Type Guards (Optional Enhancement)

```typescript
// utils/type-guards.ts
import type { EditorValue, MediaUploadProvider } from '../types/index.js';

/**
 * Type guard to check if a value is a valid EditorValue.
 *
 * @param value - Value to check
 * @returns True if value is EditorValue
 */
export function isEditorValue(value: unknown): value is EditorValue {
  if (typeof value !== 'object' || value === null) return false;
  // EditorValue is Record<string, YooptaBlockData>
  return Object.values(value).every(
    (block) => typeof block === 'object' && block !== null && 'id' in block && 'type' in block && 'value' in block,
  );
}

/**
 * Type guard to check if a value is a MediaUploadProvider.
 *
 * @param value - Value to check
 * @returns True if value is MediaUploadProvider
 */
export function isMediaUploadProvider(value: unknown): value is MediaUploadProvider {
  if (typeof value !== 'object' || value === null) return false;
  const provider = value as Partial<MediaUploadProvider>;
  return (
    typeof provider.uploadImage === 'function' ||
    typeof provider.uploadVideo === 'function' ||
    typeof provider.uploadVideoPoster === 'function' ||
    typeof provider.uploadFile === 'function'
  );
}
```

## Related Code Files

**Update Files:**

- `/packages/beqeek-editor/src/index.ts` - Main barrel export
- `/packages/beqeek-editor/src/types/index.ts` - Type barrel export
- `/packages/beqeek-editor/src/components/index.ts` - Component barrel export
- `/packages/beqeek-editor/src/hooks/index.ts` - Hook barrel export
- `/packages/beqeek-editor/src/utils/index.ts` - Utility barrel export
- `/packages/beqeek-editor/src/plugins/index.ts` - Plugin barrel export
- `/packages/beqeek-editor/src/tools/index.ts` - Tool barrel export
- `/packages/beqeek-editor/src/marks/index.ts` - Mark barrel export

**New Files (Optional):**

- `/packages/beqeek-editor/src/utils/type-guards.ts` - Runtime type guards
- `/packages/beqeek-editor/src/types/plugins.ts` - Plugin-specific types

**Reference Files:**

- `/packages/comments/src/index.ts`
- `/packages/comments/src/types/index.ts`

## Implementation Steps

### Step 1: Audit Existing Type Exports

Review all TypeScript files and identify public types:

```bash
grep -r "export type" packages/beqeek-editor/src/types/
grep -r "export interface" packages/beqeek-editor/src/types/
```

Ensure all are exported from `types/index.ts`.

### Step 2: Add Missing Type Files

Create `types/plugins.ts` for plugin-related types:

```typescript
// types/plugins.ts
export type PluginCategory = 'typography' | 'lists' | 'structural' | 'media' | 'code' | 'other';

export interface PluginConfig {
  category: PluginCategory;
  name: string;
  enabled: boolean;
}
```

### Step 3: Enhance Editor Types with JSDoc

```typescript
// types/editor.ts
import type { YooEditor, YooptaBlockData } from '@yoopta/editor';
import type { PluginElementsMap } from '@yoopta/editor';

/**
 * Editor content value structure.
 * Maps block IDs to block data objects.
 */
export type EditorValue = Record<string, YooptaBlockData>;

/**
 * Props for BeqeekEditor component.
 */
export interface BeqeekEditorProps {
  /**
   * Editor instance from createBeqeekEditor().
   * Create once per component using useMemo.
   */
  editor: YooEditor;

  /**
   * Array of configured Yoopta plugins.
   * Use getDefaultPlugins() or custom plugin array.
   */
  plugins: PluginElementsMap[];

  /**
   * Tools configuration (ActionMenu, Toolbar, LinkTool).
   * Use getDefaultTools() or custom tools.
   */
  tools?: Record<string, any>;

  /**
   * Text formatting marks (Bold, Italic, etc.).
   * Use getDefaultMarks() or custom marks array.
   */
  marks?: any[];

  /**
   * Controlled editor value.
   * Use with onChange for controlled mode.
   */
  value?: EditorValue;

  /**
   * Default value for uncontrolled mode.
   */
  defaultValue?: EditorValue;

  /**
   * Auto-focus editor on mount.
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Change handler for controlled mode.
   * Called on every content change.
   */
  onChange?: (value: EditorValue) => void;

  /**
   * Additional wrapper class name.
   */
  className?: string;

  /**
   * Read-only mode (disables editing).
   * @default false
   */
  readOnly?: boolean;

  /**
   * Placeholder text when editor is empty.
   */
  placeholder?: string;
}

/**
 * Complete editor configuration.
 * Returned by getDefaultEditorConfig().
 */
export interface EditorConfig {
  plugins: PluginElementsMap[];
  tools?: Record<string, any>;
  marks?: any[];
  defaultValue?: EditorValue;
}
```

### Step 4: Add JSDoc to All Public Functions

**hooks/useEditor.ts:**

````typescript
/**
 * Creates a new Beqeek editor instance.
 *
 * @returns Configured Yoopta editor instance
 * @example
 * ```tsx
 * const editor = useMemo(() => createBeqeekEditor(), []);
 * ```
 */
export function createBeqeekEditor(): YooEditor {
  return createYooptaEditor();
}
````

**plugins/default.ts:**

````typescript
/**
 * Get default editor configuration with all plugins, tools, and marks.
 *
 * @param mediaUploadProvider - Optional media upload provider
 * @returns Complete editor configuration
 * @example
 * ```tsx
 * const config = getDefaultEditorConfig(cloudinaryProvider);
 * ```
 */
export function getDefaultEditorConfig(mediaUploadProvider?: MediaUploadProvider): EditorConfig {
  // ...
}

/**
 * Get default Yoopta plugins (14 total).
 * Includes typography, lists, structural, media, and code plugins.
 *
 * @param mediaUploadProvider - Optional media upload provider
 * @returns Array of configured plugins
 */
export function getDefaultPlugins(mediaUploadProvider?: MediaUploadProvider): PluginElementsMap[] {
  // ...
}
````

**tools/index.ts:**

````typescript
/**
 * Get default editor tools (ActionMenu, Toolbar, LinkTool).
 *
 * @returns Tools configuration object
 * @example
 * ```tsx
 * const tools = getDefaultTools();
 * ```
 */
export function getDefaultTools(): ToolsConfig {
  return DEFAULT_TOOLS;
}
````

**marks/index.ts:**

````typescript
/**
 * Get default text formatting marks.
 * Includes Bold, Italic, Code, Underline, Strike, Highlight.
 *
 * @returns Array of mark modules
 * @example
 * ```tsx
 * const marks = getDefaultMarks();
 * ```
 */
export function getDefaultMarks(): MarksArray {
  return DEFAULT_MARKS;
}
````

### Step 5: Create Type Guards (Optional)

```typescript
// utils/type-guards.ts
// Implementation as shown in Architecture section
```

Export from `utils/index.ts`:

```typescript
export { isEditorValue, isMediaUploadProvider } from './type-guards.js';
```

### Step 6: Finalize Barrel Exports

**types/index.ts:**

```typescript
// Editor types
export type { EditorValue, BeqeekEditorProps, EditorConfig } from './editor.js';

// Tools & Marks types
export type { ToolsConfig, MarksArray } from './tools.js';

// Media upload types
export type {
  MediaUploadProvider,
  ImageUploadResult,
  VideoUploadResult,
  VideoPosterUploadResult,
  FileUploadResult,
  ImageUploadHandler,
  VideoUploadHandler,
  FileUploadHandler,
} from './media.js';

// Plugin types
export type { PluginCategory, PluginConfig } from './plugins.js';
```

**components/index.ts:**

```typescript
// Main editor component
export { BeqeekEditor } from './editor/beqeek-editor.js';

// Typography render components (if created in package)
export * from './renders/typography.js';
export * from './renders/accordion.js';
export * from './renders/table.js';
```

**hooks/index.ts:**

```typescript
export { createBeqeekEditor } from './useEditor.js';
// Add more hooks if created (e.g., useEditorValue, useEditorContent)
```

**utils/index.ts:**

```typescript
export { defaultMediaUploadProvider } from './default-upload-provider.js';
export { isEditorValue, isMediaUploadProvider } from './type-guards.js';
// Add more utilities as needed
```

**plugins/index.ts:**

```typescript
export { getTypographyPlugins } from './typography.js';
export { getListPlugins } from './lists.js';
export { getStructuralPlugins } from './structural.js';
export { getMediaPlugins } from './media.js';
export { getCodePlugin } from './code.js';
export { getDefaultPlugins, getDefaultEditorConfig } from './default.js';
```

**tools/index.ts:**

```typescript
export { DEFAULT_TOOLS, getDefaultTools } from './index.js';
// If custom renders created, export them
```

**marks/index.ts:**

```typescript
export { DEFAULT_MARKS, getDefaultMarks } from './index.js';
```

**Main index.ts:**

```typescript
// Components
export { BeqeekEditor } from './components/index.js';
export * from './components/index.js';

// Hooks
export { createBeqeekEditor } from './hooks/index.js';

// Configuration factories
export {
  getDefaultPlugins,
  getDefaultTools,
  getDefaultMarks,
  getDefaultEditorConfig,
  getTypographyPlugins,
  getListPlugins,
  getStructuralPlugins,
  getMediaPlugins,
  getCodePlugin,
} from './plugins/index.js';

// Types (re-export for convenience)
export type {
  EditorValue,
  BeqeekEditorProps,
  EditorConfig,
  ToolsConfig,
  MarksArray,
  MediaUploadProvider,
  ImageUploadResult,
  VideoUploadResult,
  FileUploadResult,
} from './types/index.js';

// Utilities
export { defaultMediaUploadProvider, isEditorValue, isMediaUploadProvider } from './utils/index.js';

// Constants
export * from './constants/index.js';
```

### Step 7: Validate Export Structure

Test imports in apps/web:

```typescript
// Root imports
import {
  BeqeekEditor,
  createBeqeekEditor,
  getDefaultEditorConfig,
  defaultMediaUploadProvider,
} from '@workspace/beqeek-editor';

// Specialized type imports
import type { EditorValue, MediaUploadProvider, ImageUploadResult } from '@workspace/beqeek-editor/types';

// Specialized component imports (if needed)
import { TypographyH1, TypographyP } from '@workspace/beqeek-editor/components';

// Specialized hook imports
import { createBeqeekEditor } from '@workspace/beqeek-editor/hooks';

// Specialized utility imports
import { isEditorValue } from '@workspace/beqeek-editor/utils';
```

### Step 8: Generate API Documentation

```bash
# Using TypeDoc (optional - install as dev dependency)
pnpm add -D typedoc --filter @workspace/beqeek-editor

# Add script to package.json
"docs": "typedoc --out docs src/index.ts"

# Generate docs
pnpm --filter @workspace/beqeek-editor docs
```

### Step 9: Validate Build with Full Type Coverage

```bash
pnpm --filter @workspace/beqeek-editor build
pnpm --filter @workspace/beqeek-editor check-types

# Check for any types in build output
grep -r "any" packages/beqeek-editor/dist/ || echo "No 'any' types found ✓"
```

### Step 10: Update README with Import Examples

````markdown
## API Reference

### Components

- `BeqeekEditor` - Main editor component

### Hooks

- `createBeqeekEditor()` - Create editor instance

### Configuration

- `getDefaultEditorConfig(provider?)` - Complete editor config
- `getDefaultPlugins(provider?)` - All 14 plugins
- `getDefaultTools()` - ActionMenu, Toolbar, LinkTool
- `getDefaultMarks()` - Bold, Italic, Code, Underline, Strike, Highlight

### Types

See [TypeScript definitions](./src/types/index.ts) for complete type reference.

### Import Patterns

```typescript
// Root imports (components, hooks, config)
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';

// Type imports (for props, config)
import type { EditorValue, MediaUploadProvider } from '@workspace/beqeek-editor/types';

// Component imports (if using renders separately)
import { TypographyH1 } from '@workspace/beqeek-editor/components';

// Utility imports
import { isEditorValue } from '@workspace/beqeek-editor/utils';
```
````

```

## Todo

- [ ] Audit all public types and ensure exported
- [ ] Create types/plugins.ts with plugin-related types
- [ ] Add comprehensive JSDoc to editor types
- [ ] Add JSDoc to all public functions (createBeqeekEditor, getDefaultPlugins, etc.)
- [ ] Create type guards (isEditorValue, isMediaUploadProvider)
- [ ] Finalize types/index.ts barrel export
- [ ] Finalize components/index.ts barrel export
- [ ] Finalize hooks/index.ts barrel export
- [ ] Finalize utils/index.ts barrel export
- [ ] Finalize plugins/index.ts barrel export
- [ ] Finalize main index.ts re-exports
- [ ] Test import patterns in apps/web
- [ ] Validate build with zero 'any' types
- [ ] Update README with import examples
- [ ] (Optional) Generate TypeDoc API documentation

## Success Criteria

- [x] All public types exported from types/index.ts
- [x] All public functions have JSDoc comments
- [x] Main index.ts re-exports all public APIs
- [x] Specialized exports work (@workspace/beqeek-editor/types, /components, etc.)
- [x] Zero `any` types in build output
- [x] Type guards implemented for runtime validation
- [x] TypeScript strict mode with zero errors
- [x] Import patterns validated in apps/web
- [x] README documents import patterns
- [x] IDE intellisense works perfectly (autocomplete, docs)

## Risk Assessment

**Low Risk: Export Conflicts**
- Barrel exports may conflict if names overlap
- **Mitigation:** Use descriptive names, namespace if needed

**Low Risk: Circular Dependencies**
- Barrel files can create circular imports
- **Mitigation:** Use `export type` for types, separate type/value exports

**Negligible Risk: Type Guard Accuracy**
- Type guards may not catch all edge cases
- **Mitigation:** Use conservative checks, document limitations

## Security Considerations

- No runtime security concerns in type definitions
- Type guards should not be used for security validation (user input sanitization)
- JSDoc examples should not include sensitive data

## Unresolved Questions

1. Should we generate TypeDoc API docs as part of build? (Optional - defer to Phase 07)
2. Do we need additional type guards beyond isEditorValue, isMediaUploadProvider? (Add as needed)
3. Should plugin types be more granular (e.g., TypographyPluginConfig)? (YAGNI - defer)

## Next Steps

1. Complete all implementation steps
2. Validate all import patterns work
3. Ensure 100% type coverage
4. Commit with message: `feat(beqeek-editor): finalize TypeScript types and exports with JSDoc`
5. Proceed to **Phase 07: Documentation & Examples** for comprehensive docs
```
