# Yoopta Editor v4 Integration Plan

**Plan ID**: 251115-1928-yoopta-editor-integration
**Created**: 2025-11-15
**Status**: Planning
**Priority**: Medium
**Estimated Duration**: 12-16 hours

## Overview

Integrate Yoopta Editor v4 into Beqeek monorepo as new `@workspace/beqeek-editor` package serving two modes:

1. **Large documents mode** - Notion-like editor for rich content creation
2. **Chat/comment mode** - Lightweight editor replacing current Lexical in `@workspace/comments`

**Key decision**: Hybrid approach - new package for document/chat editing, keep existing `@workspace/comments` for reactions/replies/MDX preview.

## Research

- [Yoopta Editor v4 Analysis](./research/251115-yoopta-editor-v4-analysis.md) - Comprehensive research report (150 lines)

## Critical Compatibility Issue

**Yoopta requires**: `slate@^0.102.0` + `slate-react@^0.102.0` (peer deps: `react>=17.0.2`)
**Beqeek uses**: `react@19.1.1` + `react-dom@19.1.1`

**Resolution**: Use pnpm overrides + runtime testing to verify React 19 compatibility.

## Implementation Phases

| Phase                                          | Description                           | Status     | Duration | Dependencies |
| ---------------------------------------------- | ------------------------------------- | ---------- | -------- | ------------ |
| [01](./phase-01-peer-dependency-resolution.md) | Peer dependency resolution & testing  | ⏸️ Pending | 2h       | -            |
| [02](./phase-02-package-scaffolding.md)        | Package structure & configuration     | ⏸️ Pending | 2h       | Phase 01     |
| [03](./phase-03-document-editor-core.md)       | Document editor implementation        | ⏸️ Pending | 3h       | Phase 02     |
| [04](./phase-04-chat-editor-implementation.md) | Chat/comment editor implementation    | ⏸️ Pending | 2h       | Phase 02     |
| [05](./phase-05-custom-plugins.md)             | Custom plugins (@mention, emoji)      | ⏸️ Pending | 2h       | Phase 03, 04 |
| [06](./phase-06-shadcn-integration.md)         | shadcn/ui styling & theme integration | ⏸️ Pending | 2h       | Phase 03     |
| [07](./phase-07-testing-validation.md)         | Testing & validation                  | ⏸️ Pending | 2h       | Phase 03-06  |
| [08](./phase-08-documentation.md)              | Documentation & examples              | ⏸️ Pending | 1h       | Phase 07     |

**Total estimated**: 16 hours

## Success Criteria

- ✅ React 19 compatibility verified (no runtime errors)
- ✅ Document editor with all 14 plugins functional
- ✅ Chat editor with minimal plugin set functional
- ✅ Custom @mention plugin working
- ✅ Custom emoji picker integrated
- ✅ shadcn/ui components integrated (typography, tables)
- ✅ File upload (images/videos) working with Active Tables API
- ✅ Export/import (markdown, HTML) functional
- ✅ TypeScript strict mode passing
- ✅ Package builds successfully in monorepo
- ✅ No performance degradation vs Lexical (benchmark: <100ms render time)

## Risk Assessment

| Risk                              | Likelihood | Impact | Mitigation                           |
| --------------------------------- | ---------- | ------ | ------------------------------------ |
| React 19 incompatibility          | Medium     | High   | Runtime testing, fallback to Lexical |
| Large bundle size (>300KB)        | Medium     | Medium | Code splitting, lazy loading plugins |
| Performance issues (1000+ blocks) | Low        | Medium | Virtual scrolling, pagination        |
| Slate.js learning curve           | Medium     | Low    | Copy reference implementations       |
| Migration complexity              | Low        | Low    | Hybrid approach, gradual migration   |

## Architecture Decision

**Hybrid approach** (recommended):

```
@workspace/beqeek-editor     # New package
├── DocumentEditor            # Large documents mode
└── ChatEditor                # Chat/comment mode

@workspace/comments           # Keep existing
├── EmojiReactions            # 8 reaction types
├── CommentCard               # Nested replies
└── CommentPreview            # MDX rendering
```

**Alternative** (not recommended): Full replacement of `@workspace/comments` - higher risk, more work.

## Next Steps

1. Proceed to Phase 01 - Peer dependency resolution & testing
2. Validate React 19 compatibility before continuing
3. If incompatible, consider alternative: Tiptap, ProseMirror, or keep Lexical

## Notes

- Research completed: 2025-11-15
- Decision: Proceed with Yoopta if React 19 tests pass
- Fallback: Keep Lexical, defer large documents feature
- Package will be private (not published to npm)
