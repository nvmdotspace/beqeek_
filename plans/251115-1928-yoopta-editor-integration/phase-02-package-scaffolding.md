# Phase 02: Package Scaffolding & Configuration

**Phase**: 02/08
**Duration**: 2 hours
**Status**: ⏸️ Pending
**Priority**: P1
**Depends on**: Phase 01 (MUST pass React 19 tests)

## Context

- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 01 complete with passing tests
- **Blocks**: Phases 03-08
- **Related packages**:
  - Reference: `/packages/comments` (structure template)
  - Reference: `/packages/active-tables-core` (React package patterns)
  - Reference: `/packages/ui` (exports structure)

## Overview

**Date**: 2025-11-15
**Description**: Create new `@workspace/beqeek-editor` package with proper structure, configuration, build setup, and exports aligned with Beqeek monorepo standards.

**Goal**: Scaffolded package ready for editor implementation in Phase 03/04.

## Key Insights

From existing packages:

- `@workspace/comments` - Lexical-based, similar structure needed
- `@workspace/active-tables-core` - React + TypeScript, peer deps pattern
- `@workspace/ui` - Exports structure (granular exports)
- All use TypeScript strict mode, ESM, React 19 peer deps

## Requirements

### Functional

- FR1: Package structure matches monorepo conventions
- FR2: TypeScript builds successfully
- FR3: Exports configured for tree-shaking
- FR4: Turborepo recognizes package

### Non-Functional

- NFR1: TypeScript strict mode enabled
- NFR2: ESLint config from @workspace/eslint-config
- NFR3: React 19 as peer dependency
- NFR4: Build outputs to `dist/` directory

## Architecture

### Package Structure

```
packages/beqeek-editor/
├── src/
│   ├── document-editor/          # Large documents mode
│   │   ├── DocumentEditor.tsx    # Main component
│   │   ├── plugins.ts            # Full plugin config
│   │   ├── tools.ts              # ActionMenu, Toolbar, LinkTool
│   │   ├── marks.ts              # Bold, Italic, etc.
│   │   └── index.ts              # Exports
│   │
│   ├── chat-editor/              # Chat/comment mode
│   │   ├── ChatEditor.tsx        # Minimal component
│   │   ├── plugins.ts            # Limited plugins
│   │   ├── tools.ts              # Minimal tools
│   │   ├── marks.ts              # Basic marks
│   │   └── index.ts              # Exports
│   │
│   ├── plugins/                  # Custom plugin extensions
│   │   ├── mention-plugin.ts     # @mentions (future)
│   │   ├── emoji-plugin.ts       # Emoji picker (future)
│   │   └── index.ts
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useDocumentEditor.ts  # Document editor hook
│   │   ├── useChatEditor.ts      # Chat editor hook
│   │   ├── useYooptaValue.ts     # Value management
│   │   └── index.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── serialization.ts      # Custom serializers
│   │   ├── validation.ts         # Content validation
│   │   ├── file-upload.ts        # Upload handlers
│   │   └── index.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── editor.ts             # Editor-specific types
│   │   ├── plugins.ts            # Plugin types
│   │   └── index.ts
│   │
│   └── index.ts                  # Main exports
│
├── package.json                  # Package config
├── tsconfig.json                 # TypeScript config
├── README.md                     # Documentation
└── .npmignore                    # Publish exclusions
```

### Exports Configuration

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./document": {
      "import": "./dist/document-editor/index.js",
      "types": "./dist/document-editor/index.d.ts"
    },
    "./chat": {
      "import": "./dist/chat-editor/index.js",
      "types": "./dist/chat-editor/index.d.ts"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js",
      "types": "./dist/hooks/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "types": "./dist/utils/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}
```

## Implementation Steps

### Step 1: Create package directory

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek/packages
mkdir beqeek-editor
cd beqeek-editor
```

### Step 2: Create package.json

File: `/packages/beqeek-editor/package.json`

```json
{
  "name": "@workspace/beqeek-editor",
  "version": "0.1.0",
  "description": "Yoopta-based rich text editor for Beqeek - supports document editing and chat modes",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./document": {
      "import": "./dist/document-editor/index.js",
      "types": "./dist/document-editor/index.d.ts"
    },
    "./chat": {
      "import": "./dist/chat-editor/index.js",
      "types": "./dist/chat-editor/index.d.ts"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js",
      "types": "./dist/hooks/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "types": "./dist/utils/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "slate": "^0.102.0",
    "slate-react": "^0.102.0"
  },
  "dependencies": {
    "@yoopta/accordion": "^4.9.9",
    "@yoopta/action-menu-list": "^4.9.9",
    "@yoopta/blockquote": "^4.9.9",
    "@yoopta/callout": "^4.9.9",
    "@yoopta/code": "^4.9.9",
    "@yoopta/divider": "^4.9.9",
    "@yoopta/editor": "^4.9.9",
    "@yoopta/embed": "^4.9.9",
    "@yoopta/exports": "^4.9.9",
    "@yoopta/file": "^4.9.9",
    "@yoopta/headings": "^4.9.9",
    "@yoopta/image": "^4.9.9",
    "@yoopta/link": "^4.9.9",
    "@yoopta/link-tool": "^4.9.9",
    "@yoopta/lists": "^4.9.9",
    "@yoopta/marks": "^4.9.9",
    "@yoopta/paragraph": "^4.9.9",
    "@yoopta/table": "^4.9.9",
    "@yoopta/toolbar": "^4.9.9",
    "@yoopta/video": "^4.9.9",
    "@workspace/beqeek-shared": "workspace:*",
    "@workspace/ui": "workspace:*",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.13",
    "@types/react-dom": "^19.1.9",
    "@workspace/eslint-config": "workspace:*",
    "@workspace/typescript-config": "workspace:*",
    "eslint": "^9.36.0",
    "typescript": "^5.9.0"
  }
}
```

### Step 3: Create TypeScript config

File: `/packages/beqeek-editor/tsconfig.json`

```json
{
  "extends": "@workspace/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### Step 4: Create directory structure

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek/packages/beqeek-editor

# Create directories
mkdir -p src/document-editor
mkdir -p src/chat-editor
mkdir -p src/plugins
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
```

### Step 5: Create placeholder files

File: `/packages/beqeek-editor/src/index.ts`

```typescript
/**
 * @workspace/beqeek-editor
 *
 * Yoopta-based rich text editor for Beqeek
 *
 * Provides two modes:
 * - Document mode: Full-featured Notion-like editor
 * - Chat mode: Lightweight editor for comments/messages
 */

export * from './document-editor/index.js';
export * from './chat-editor/index.js';
export * from './hooks/index.js';
export * from './utils/index.js';
export * from './types/index.js';
```

File: `/packages/beqeek-editor/src/document-editor/index.ts`

```typescript
/**
 * Document Editor
 *
 * Full-featured Notion-like editor for large documents
 * Includes all Yoopta plugins, tools, and marks
 */

// Placeholder - will implement in Phase 03
export {};
```

File: `/packages/beqeek-editor/src/chat-editor/index.ts`

```typescript
/**
 * Chat Editor
 *
 * Lightweight editor for chat messages and comments
 * Minimal plugin set for fast loading
 */

// Placeholder - will implement in Phase 04
export {};
```

File: `/packages/beqeek-editor/src/hooks/index.ts`

```typescript
/**
 * Custom hooks for editor instances
 */

// Placeholder - will implement in Phase 03/04
export {};
```

File: `/packages/beqeek-editor/src/utils/index.ts`

```typescript
/**
 * Utility functions for editor
 */

// Placeholder - will implement in Phase 03-05
export {};
```

File: `/packages/beqeek-editor/src/types/index.ts`

```typescript
/**
 * TypeScript type definitions
 */

// Re-export Yoopta types
export type {
  YooptaContentValue,
  YooptaBlockData,
  YooptaPath,
  YooptaEditor,
  PluginElementRenderProps,
  YooptaPlugin,
} from '@yoopta/editor';

// Placeholder for custom types - will add in Phase 03-05
export {};
```

### Step 6: Create README

File: `/packages/beqeek-editor/README.md`

```markdown
# @workspace/beqeek-editor

Yoopta-based rich text editor for Beqeek Active Tables.

## Features

- ✅ **Document Mode** - Full-featured Notion-like editor
- ✅ **Chat Mode** - Lightweight editor for comments
- ✅ **TypeScript** - Full type safety
- ✅ **React 19 Compatible** - Built for latest React
- ✅ **shadcn/ui Integration** - Styled with design system
- ✅ **Export/Import** - Markdown, HTML, plain text

## Installation

This package is part of the Beqeek monorepo:

\`\`\`bash

# From monorepo root

pnpm install

# Build the package

pnpm --filter @workspace/beqeek-editor build
\`\`\`

## Usage

### Document Editor

\`\`\`tsx
import { DocumentEditor } from '@workspace/beqeek-editor/document';

function MyPage() {
return <DocumentEditor />;
}
\`\`\`

### Chat Editor

\`\`\`tsx
import { ChatEditor } from '@workspace/beqeek-editor/chat';

function MyChat() {
return <ChatEditor />;
}
\`\`\`

## Documentation

See [implementation plan](/plans/251115-1928-yoopta-editor-integration/plan.md) for details.

## Dependencies

- React 19+
- slate@0.102.0
- slate-react@0.102.0
- @yoopta/editor@4.9.9+

## License

Private - Part of Beqeek monorepo
```

### Step 7: Update root package.json

Add to `/package.json` (if not already added in Phase 01):

```json
{
  "pnpm": {
    "overrides": {
      "slate": "0.102.0",
      "slate-react": "0.102.0"
    }
  }
}
```

### Step 8: Install dependencies

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek

# Install all Yoopta packages
pnpm --filter @workspace/beqeek-editor add \
  @yoopta/editor@^4.9.9 \
  @yoopta/paragraph@latest \
  @yoopta/headings@latest \
  @yoopta/blockquote@latest \
  @yoopta/lists@latest \
  @yoopta/code@latest \
  @yoopta/table@latest \
  @yoopta/image@latest \
  @yoopta/video@latest \
  @yoopta/file@latest \
  @yoopta/embed@latest \
  @yoopta/link@latest \
  @yoopta/accordion@latest \
  @yoopta/divider@latest \
  @yoopta/callout@latest \
  @yoopta/marks@latest \
  @yoopta/toolbar@latest \
  @yoopta/action-menu-list@latest \
  @yoopta/link-tool@latest \
  @yoopta/exports@latest

# Install peer deps (if not already installed)
pnpm --filter @workspace/beqeek-editor add -D \
  slate@0.102.0 \
  slate-react@0.102.0
```

### Step 9: Verify TypeScript compiles

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek

# Type check
pnpm --filter @workspace/beqeek-editor check-types

# Build (should succeed with placeholders)
pnpm --filter @workspace/beqeek-editor build
```

### Step 10: Verify Turborepo recognizes package

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek

# Should list @workspace/beqeek-editor
pnpm turbo run build --filter=@workspace/beqeek-editor

# Should show dependency graph
pnpm turbo run build --filter=@workspace/beqeek-editor --graph
```

### Step 11: Add to web app dependencies

Edit `/apps/web/package.json`:

```json
{
  "dependencies": {
    "@workspace/beqeek-editor": "workspace:*"
  }
}
```

Install:

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek
pnpm install
```

### Step 12: Verify web app can import

Create test file `/apps/web/src/test-beqeek-editor-import.ts`:

```typescript
// This should compile without errors
import type { YooptaContentValue } from '@workspace/beqeek-editor';
// import { DocumentEditor } from '@workspace/beqeek-editor/document'; // Will work in Phase 03
// import { ChatEditor } from '@workspace/beqeek-editor/chat'; // Will work in Phase 04

export const testImport: YooptaContentValue = {};
```

Type check:

```bash
pnpm --filter web check-types
```

## Related Code Files

**Created**:

- `/packages/beqeek-editor/` (entire package)
- `/packages/beqeek-editor/package.json`
- `/packages/beqeek-editor/tsconfig.json`
- `/packages/beqeek-editor/README.md`
- `/packages/beqeek-editor/src/index.ts`
- `/packages/beqeek-editor/src/document-editor/index.ts`
- `/packages/beqeek-editor/src/chat-editor/index.ts`
- `/packages/beqeek-editor/src/hooks/index.ts`
- `/packages/beqeek-editor/src/utils/index.ts`
- `/packages/beqeek-editor/src/types/index.ts`
- `/apps/web/src/test-beqeek-editor-import.ts`

**Modified**:

- `/package.json` (pnpm overrides)
- `/apps/web/package.json` (add dependency)

**Reference**:

- `/packages/comments/package.json`
- `/packages/active-tables-core/package.json`
- `/packages/ui/package.json`

## Todo List

- [ ] Create package directory
- [ ] Create package.json with all deps
- [ ] Create tsconfig.json
- [ ] Create directory structure (document-editor, chat-editor, plugins, hooks, utils, types)
- [ ] Create placeholder index.ts files
- [ ] Create README.md
- [ ] Add pnpm overrides to root package.json (if not done in Phase 01)
- [ ] Install all Yoopta dependencies
- [ ] Install peer deps (slate, slate-react)
- [ ] Run type check (should pass with placeholders)
- [ ] Run build (should succeed)
- [ ] Verify Turborepo recognizes package
- [ ] Add to web app dependencies
- [ ] Install in web app
- [ ] Create test import file
- [ ] Verify web app type check passes
- [ ] Commit changes to test branch

## Success Criteria

✅ **Phase complete when**:

- Package structure created with all directories
- package.json configured with correct deps/exports
- TypeScript builds successfully (placeholders)
- Turborepo recognizes package in graph
- Web app can import types from package
- No TypeScript errors in monorepo
- README documents usage patterns

## Risk Assessment

| Risk                       | Likelihood | Impact | Mitigation                    |
| -------------------------- | ---------- | ------ | ----------------------------- |
| Missing Yoopta packages    | Low        | Low    | Install all packages upfront  |
| Incorrect exports config   | Low        | Medium | Follow @workspace/ui pattern  |
| Peer dep version conflicts | Low        | Medium | Lock to exact 0.102.0         |
| Build config issues        | Low        | Low    | Copy from @workspace/comments |

## Security Considerations

- No security impact (scaffolding only)
- All packages from trusted sources (npm registry)
- Versions locked to specific releases

## Performance Considerations

- No performance impact (no code yet)
- All deps will be bundled by web app (not published separately)

## Next Steps

→ Proceed to [Phase 03: Document Editor Core](./phase-03-document-editor-core.md)

## Unresolved Questions

1. Should we add CSS files for Yoopta styles or rely on shadcn/ui only?
2. Do we need separate build output for ESM vs CJS? (Answer: ESM only, matching monorepo)
3. Should plugins be lazy-loaded or bundled together? (Defer to Phase 03)
