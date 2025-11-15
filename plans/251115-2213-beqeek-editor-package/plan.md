# Implementation Plan: @workspace/beqeek-editor Package

**Plan ID:** 251115-2213
**Created:** 2025-11-15 22:13
**Status:** Ready for Implementation

## Overview

Extract Yoopta Editor v4 integration into standalone package `@workspace/beqeek-editor` for Notion-like large document editing capabilities across Beqeek platform.

## Objectives

1. Create modular, reusable editor package following monorepo patterns
2. Full Yoopta Editor v4 feature integration (14 plugins, 3 tools, 6 marks)
3. shadcn/ui component integration for consistent design system
4. Abstract media upload layer (not hardcoded to Cloudinary)
5. TypeScript strict mode compliance with comprehensive types
6. i18n readiness for Vietnamese/English support

## Architecture Strategy

**Package Structure** (mirrors @workspace/comments):

```
packages/beqeek-editor/
├── src/
│   ├── components/       # Editor wrapper, plugin renders
│   ├── plugins/          # Yoopta plugin configurations
│   ├── tools/            # ActionMenu, Toolbar, LinkTool
│   ├── marks/            # Text formatting marks
│   ├── hooks/            # useEditor, useMediaUpload
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helpers, validators
│   ├── constants/        # Default configs
│   └── index.ts          # Main exports
├── package.json          # Exports: root, /types, /components, /hooks, /utils
├── tsconfig.json         # Extends @workspace/typescript-config/react-library
└── README.md
```

**Key Dependencies:**

- Yoopta ecosystem: @yoopta/editor, @yoopta/exports, 14 plugins, 3 tools
- Peer deps: React 19, slate, slate-react
- Workspace: @workspace/ui (shadcn components), @workspace/beqeek-shared

**Export Pattern:**

```typescript
// Root exports
export { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';

// Specialized exports
import { EditorConfig } from '@workspace/beqeek-editor/types';
import { useEditor } from '@workspace/beqeek-editor/hooks';
import { TypographyRenders } from '@workspace/beqeek-editor/components';
```

## Implementation Phases

### Phase 01: Package Scaffolding [phase-01-package-scaffolding.md]

- Directory structure, package.json, tsconfig.json
- Build configuration, TypeScript setup
- ESLint integration, exports mapping
- **Duration:** 2-3 hours

### Phase 02: Core Editor Integration [phase-02-core-editor-integration.md]

- Yoopta Editor initialization wrapper
- Editor configuration types
- Base component structure
- **Duration:** 3-4 hours

### Phase 03: Plugin Configuration [phase-03-plugin-configuration.md]

- 14 plugin integrations with shadcn/ui renders
- Typography components (H1, H2, H3, P, Blockquote, Link)
- Lists, Accordion, Table, Code, Divider, Callout
- **Duration:** 6-8 hours

### Phase 04: Tools & Marks Setup [phase-04-tools-marks-setup.md]

- ActionMenu, Toolbar, LinkTool configuration
- 6 text marks (Bold, Italic, Code, Underline, Strike, Highlight)
- Tool render customization
- **Duration:** 3-4 hours

### Phase 05: Media Upload Abstraction [phase-05-media-upload-abstraction.md]

- Image, Video, File plugin adapters
- Upload provider interface (not Cloudinary-locked)
- Embed plugin configuration
- **Duration:** 4-5 hours

### Phase 06: TypeScript Types & Exports [phase-06-typescript-exports.md]

- Comprehensive type definitions
- Export barrel files
- Documentation comments
- **Duration:** 3-4 hours

### Phase 07: Documentation & Examples [phase-07-documentation-examples.md]

- README with usage examples
- API reference
- Integration guide
- **Duration:** 3-4 hours

## Success Metrics

- ✅ TypeScript strict mode with 100% type coverage
- ✅ All 14 Yoopta plugins functional with shadcn/ui renders
- ✅ Media upload provider abstraction tested
- ✅ Exports pattern validated (root + specialized)
- ✅ Build passes in Turborepo pipeline
- ✅ Documentation complete with code examples
- ✅ Zero peer dependency conflicts with React 19

## Risk Mitigation

**Risk:** Yoopta v4 + React 19 compatibility issues
**Mitigation:** Peer dependency testing, version pinning in phase 02

**Risk:** shadcn/ui component prop mismatches with Yoopta renders
**Mitigation:** Type-safe render wrappers in phase 03, runtime validation

**Risk:** Media upload abstraction too rigid/complex
**Mitigation:** Interface-first design in phase 05, example implementations

**Risk:** Package size bloat from full plugin suite
**Mitigation:** Tree-shakeable exports, optional plugin registration

## Dependencies

- **Upstream:** @workspace/ui (typography components), @workspace/beqeek-shared
- **External:** Yoopta Editor v4, slate ecosystem
- **Tooling:** TypeScript 5.9, Turborepo, PNPM workspaces

## Next Steps

1. Review this plan with team/stakeholders
2. Begin Phase 01: Package scaffolding
3. Validate Yoopta v4 + React 19 compatibility in isolated test
4. Proceed sequentially through phases 02-07
