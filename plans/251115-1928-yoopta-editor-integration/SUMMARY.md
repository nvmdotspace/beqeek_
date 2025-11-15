# Yoopta Editor v4 Integration - Plan Summary

**Created**: 2025-11-15
**Estimated Duration**: 12-16 hours
**Status**: Ready for Implementation

## Quick Links

- **Main Plan**: [plan.md](./plan.md)
- **Research Report**: [research/251115-yoopta-editor-v4-analysis.md](./research/251115-yoopta-editor-v4-analysis.md)
- **Phase 01**: [Peer Dependency Resolution](./phase-01-peer-dependency-resolution.md) ⚠️ **START HERE**

## Executive Summary

Comprehensive plan to integrate Yoopta Editor v4 into Beqeek monorepo as new `@workspace/beqeek-editor` package serving:

1. **Large documents mode** - Notion-like editor (14 plugins, full features)
2. **Chat/comment mode** - Lightweight editor (4 plugins, fast loading)

**Critical blocker**: React 19 compatibility must be verified in Phase 01 before proceeding.

## Key Decisions

### ✅ Hybrid Approach (Recommended)

- Create new `@workspace/beqeek-editor` for document/chat editing
- Keep existing `@workspace/comments` for reactions/replies/MDX preview
- Lower risk, gradual migration path

### ⚠️ Peer Dependency Strategy

- Use pnpm overrides: `slate@0.102.0`, `slate-react@0.102.0`
- Runtime test with React 19.1.1 in Phase 01
- Fallback: Keep Lexical if incompatible

## Implementation Phases

| #   | Phase                                                                  | Duration | Status     | Priority         |
| --- | ---------------------------------------------------------------------- | -------- | ---------- | ---------------- |
| 01  | [Peer Dependency Resolution](./phase-01-peer-dependency-resolution.md) | 2h       | ⏸️ Pending | **P0 (Blocker)** |
| 02  | [Package Scaffolding](./phase-02-package-scaffolding.md)               | 2h       | ⏸️ Pending | P1               |
| 03  | [Document Editor Core](./phase-03-document-editor-core.md)             | 3h       | ⏸️ Pending | P1               |
| 04  | [Chat Editor](./phase-04-chat-editor-implementation.md)                | 2h       | ⏸️ Pending | P1               |
| 05  | [Custom Plugins](./phase-05-custom-plugins.md)                         | 2h       | ⏸️ Pending | P2               |
| 06  | [shadcn Integration](./phase-06-shadcn-integration.md)                 | 2h       | ⏸️ Pending | P2               |
| 07  | [Testing & Validation](./phase-07-testing-validation.md)               | 2h       | ⏸️ Pending | P1               |
| 08  | [Documentation](./phase-08-documentation.md)                           | 1h       | ⏸️ Pending | P2               |

**Total**: 16 hours

## Research Highlights

From [comprehensive research](./research/251115-yoopta-editor-v4-analysis.md):

### ✅ Strengths

- 14 official plugins (Notion-like UX)
- Export to markdown/HTML/email/plain text
- TypeScript-first with full type safety
- Extensible plugin architecture (`.extend()` pattern)
- Active development (last update: Nov 2025)

### ⚠️ Concerns

- Requires `slate@^0.102.0` + `slate-react@^0.102.0`
- React 19 compatibility unknown (needs testing)
- Bundle size ~250-300KB (vs Lexical ~150KB)
- Peer dep lock prevents Slate security updates

### 📊 Comparison: Yoopta vs Lexical

| Aspect          | Yoopta           | Lexical (Current) |
| --------------- | ---------------- | ----------------- |
| React 19        | ⚠️ Unknown       | ✅ Compatible     |
| Notion features | ✅ Built-in      | ⚠️ Custom impl    |
| Bundle size     | ~250KB           | ~150KB            |
| Email builder   | ✅ Dedicated pkg | ❌ None           |
| Maintenance     | Active           | Active (Meta)     |

## Success Criteria

- ✅ React 19 compatibility verified (no runtime errors)
- ✅ DocumentEditor with all 14 plugins functional
- ✅ ChatEditor with minimal plugins functional
- ✅ Custom @mention + emoji plugins working
- ✅ shadcn/ui integration complete
- ✅ File upload working with Active Tables API
- ✅ Export/import (markdown, HTML) functional
- ✅ TypeScript strict mode passing
- ✅ Performance: <100ms render time

## Risk Mitigation

| Risk                     | Mitigation                            |
| ------------------------ | ------------------------------------- |
| React 19 incompatibility | Phase 01 testing, fallback to Lexical |
| Large bundle size        | Code splitting, lazy loading          |
| Performance issues       | Virtual scrolling, pagination         |
| Slate.js learning curve  | Copy reference implementations        |

## Next Steps

1. **Read research report**: [research/251115-yoopta-editor-v4-analysis.md](./research/251115-yoopta-editor-v4-analysis.md)
2. **Start Phase 01**: [Peer Dependency Resolution](./phase-01-peer-dependency-resolution.md)
3. **Decision point**: After Phase 01, decide go/no-go based on React 19 tests
4. **If tests pass**: Continue to Phase 02
5. **If tests fail**: Evaluate alternatives (Tiptap, keep Lexical, wait for Yoopta update)

## Alternatives (If Phase 01 Fails)

1. **Tiptap** - React 19 compatible, similar features, different API
2. **Keep Lexical** - Current solution works well, defer large documents
3. **Wait for Yoopta** - Contact maintainers about React 19 roadmap
4. **ProseMirror** - Direct usage, more work, full control

## Questions?

Contact: See unresolved questions in each phase file.
