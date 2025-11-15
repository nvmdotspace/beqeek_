# Phase 01: Package Scaffolding and Configuration

**Parent Plan:** [plan.md](./plan.md)
**Phase:** 01/07
**Dependencies:** None (Initial phase)

## Context

Establish foundational package structure for `@workspace/beqeek-editor` following monorepo conventions from `@workspace/comments` pattern.

**Reference Files:**

- `/packages/comments/package.json` - Package config pattern
- `/packages/comments/tsconfig.json` - TypeScript config
- `/turbo.json` - Build pipeline integration
- `/@workspace/typescript-config/react-library.json` - Base TS config

## Overview

**Date:** 2025-11-15
**Description:** Create package directory structure, configuration files, and build setup
**Priority:** P0 - Foundational
**Implementation Status:** ✅ Complete
**Review Status:** ✅ Approved (see reports/251115-code-review-phase-01-report.md)

## Key Insights

1. **Export Pattern Strategy:** Multi-entry exports (root + specialized) enables tree-shaking and clear API surface
2. **Type-only Module:** ESM-only (`"type": "module"`) aligns with Vite/modern tooling
3. **Peer Dependency Management:** React 19 + slate ecosystem requires careful version coordination
4. **Build Simplicity:** TypeScript compilation only (no bundler) reduces complexity, follows comments package pattern
5. **CSS Side Effects:** Yoopta plugins include CSS that must be marked in `sideEffects` array

## Requirements

### Functional Requirements

- [x] Package directory structure matching comments pattern
- [x] package.json with correct exports mapping
- [x] TypeScript configuration extending workspace config
- [x] ESLint integration
- [x] Turborepo build task registration
- [x] README placeholder

### Non-Functional Requirements

- TypeScript strict mode enabled
- ESM module system
- Declaration maps for debugging
- Proper peer dependency declarations
- No circular dependencies

## Architecture

### Directory Structure

```
packages/beqeek-editor/
├── src/
│   ├── components/
│   │   ├── editor/           # Main editor wrapper
│   │   ├── renders/          # shadcn/ui plugin renders
│   │   └── index.ts
│   ├── plugins/
│   │   ├── typography.ts     # Headings, Paragraph, Blockquote
│   │   ├── lists.ts          # Numbered, Bulleted, Todo
│   │   ├── media.ts          # Image, Video, File, Embed
│   │   ├── structural.ts     # Table, Accordion, Divider, Callout
│   │   ├── code.ts           # Code blocks
│   │   └── index.ts
│   ├── tools/
│   │   ├── action-menu.ts
│   │   ├── toolbar.ts
│   │   ├── link-tool.ts
│   │   └── index.ts
│   ├── marks/
│   │   └── index.ts          # Bold, Italic, Code, Underline, Strike, Highlight
│   ├── hooks/
│   │   ├── useEditor.ts
│   │   ├── useMediaUpload.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── editor.ts
│   │   ├── plugins.ts
│   │   ├── media.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── editor-helpers.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── default-config.ts
│   │   ├── init-value.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
└── README.md
```

### package.json Configuration

```json
{
  "name": "@workspace/beqeek-editor",
  "version": "0.1.0",
  "description": "Notion-like large document editor powered by Yoopta Editor v4",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./components": {
      "import": "./dist/components/index.js",
      "types": "./dist/components/index.d.ts"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js",
      "types": "./dist/hooks/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "types": "./dist/utils/index.d.ts"
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
    "slate": "^0.103.0",
    "slate-react": "^0.110.0"
  },
  "dependencies": {
    "@yoopta/editor": "^4.0.0",
    "@yoopta/exports": "^4.0.0",
    "@yoopta/paragraph": "^4.0.0",
    "@yoopta/blockquote": "^4.0.0",
    "@yoopta/accordion": "^4.0.0",
    "@yoopta/divider": "^4.0.0",
    "@yoopta/table": "^4.0.0",
    "@yoopta/code": "^4.0.0",
    "@yoopta/embed": "^4.0.0",
    "@yoopta/image": "^4.0.0",
    "@yoopta/link": "^4.0.0",
    "@yoopta/file": "^4.0.0",
    "@yoopta/callout": "^4.0.0",
    "@yoopta/video": "^4.0.0",
    "@yoopta/lists": "^4.0.0",
    "@yoopta/headings": "^4.0.0",
    "@yoopta/action-menu-list": "^4.0.0",
    "@yoopta/toolbar": "^4.0.0",
    "@yoopta/link-tool": "^4.0.0",
    "@yoopta/marks": "^4.0.0",
    "@workspace/beqeek-shared": "workspace:*",
    "@workspace/ui": "workspace:*",
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

### tsconfig.json Configuration

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

## Related Code Files

**New Files (Create):**

- `/packages/beqeek-editor/package.json`
- `/packages/beqeek-editor/tsconfig.json`
- `/packages/beqeek-editor/.eslintrc.cjs`
- `/packages/beqeek-editor/README.md`
- `/packages/beqeek-editor/src/index.ts`
- All directory structure files

**Reference Files (Read Only):**

- `/packages/comments/package.json`
- `/packages/comments/tsconfig.json`
- `/turbo.json`

## Implementation Steps

### Step 1: Create Directory Structure

```bash
mkdir -p packages/beqeek-editor/src/{components/{editor,renders},plugins,tools,marks,hooks,types,utils,constants}
```

### Step 2: Initialize package.json

- Copy from comments package template
- Update name, description, version
- Add Yoopta v4 dependencies (18 packages)
- Configure exports mapping
- Add peer dependencies (React 19, slate ecosystem)

### Step 3: Configure TypeScript

- Create tsconfig.json extending react-library config
- Set outDir to ./dist, rootDir to ./src
- Enable declarationMap for debugging

### Step 4: Setup ESLint

**Implemented:** Using ESLint 9 flat config format (superior to legacy .eslintrc.cjs)

```javascript
// eslint.config.js
import { config } from '@workspace/eslint-config/react-internal';
export default config;
```

### Step 5: Create Barrel Files

```typescript
// src/index.ts
export * from './components/index.js';
export * from './hooks/index.js';
export * from './types/index.js';
export * from './utils/index.js';
export * from './constants/index.js';
```

Create empty index.ts in each subdirectory (populated in later phases).

### Step 6: Create README Template

```markdown
# @workspace/beqeek-editor

Notion-like large document editor powered by Yoopta Editor v4.

## Installation

[TBD in Phase 07]

## Usage

[TBD in Phase 07]
```

### Step 7: Register in Turborepo

No changes needed - turbo.json already configured to build packages with `^build` dependency.

### Step 8: Install Dependencies

```bash
cd packages/beqeek-editor
pnpm install
```

### Step 9: Validate Build

```bash
pnpm --filter @workspace/beqeek-editor build
pnpm --filter @workspace/beqeek-editor check-types
pnpm --filter @workspace/beqeek-editor lint
```

## Todo

- [x] Create packages/beqeek-editor directory structure
- [x] Write package.json with Yoopta v4 dependencies
- [x] Configure tsconfig.json
- [x] Setup eslint.config.js (implemented as flat config instead of .eslintrc.cjs)
- [x] Create barrel files (src/index.ts + subdirectory index.ts)
- [x] Write README.md template
- [x] Install dependencies via pnpm
- [x] Validate build passes
- [x] Validate type-check passes
- [x] Validate lint passes

**Note:** ESLint implemented using flat config (`eslint.config.js`) instead of legacy `.eslintrc.cjs` format. This is ESLint 9+ best practice.

## Success Criteria

- [x] Directory structure matches comments package pattern
- [x] package.json exports configured correctly
- [x] TypeScript compilation succeeds (empty files)
- [x] ESLint runs without errors
- [x] All 18+ Yoopta dependencies installed
- [x] Peer dependencies declared (React 19, slate)
- [x] Package builds in Turborepo pipeline

## Risk Assessment

**Low Risk:**

- Directory structure is straightforward
- Configuration mirrors proven comments package

**Medium Risk:**

- Yoopta v4 version compatibility with React 19
  - **Mitigation:** Pin exact versions in package.json, validate in Phase 02

**Negligible Risk:**

- TypeScript/ESLint config (extends workspace standards)

## Security Considerations

- All dependencies from official Yoopta npm packages (verify package integrity)
- No authentication or data handling in this phase
- Workspace dependencies use `workspace:*` protocol (PNPM security)

## Review Findings (2025-11-15)

**Code Quality Score:** 8.5/10
**Status:** ✅ APPROVED FOR PHASE 02

**Minor Recommendations:**

1. Update TypeScript to 5.9.2 (align with workspace)
2. Add ./constants export path to package.json
3. Consider tightening peer dependency ranges after Phase 02 testing

**Full Report:** See `reports/251115-code-review-phase-01-report.md`

## Next Steps

1. ✅ ~~Execute implementation steps 1-9~~ (COMPLETE)
2. ✅ ~~Commit package scaffolding~~ (COMPLETE)
3. **Proceed to Phase 02: Core Editor Integration**
   - Start with useEditor hook implementation
   - Create YooptaEditor wrapper component
   - Test React 19 + Yoopta v4 compatibility
   - Resolve slate version mismatch (0.103 vs 0.110)
