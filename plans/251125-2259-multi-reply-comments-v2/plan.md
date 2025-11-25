# Multi-Reply Comments V2 Implementation Plan

**Date:** 2025-11-25
**Status:** Planning
**Priority:** High

## Overview

Implement flat conversation design with multi-reply support for comments system. Key changes:

- Replace nested tree structure with flat list
- Allow replying to multiple comments at once
- Display reply references inline (not nested)
- Maintain backward compatibility with single-reply UX

## Phases

| Phase | Name                                           | Status  | Progress | File                                                    |
| ----- | ---------------------------------------------- | ------- | -------- | ------------------------------------------------------- |
| 01    | Update @workspace/comments Package Types       | Pending | 0%       | [phase-01](./phase-01-update-comments-package-types.md) |
| 02    | Modify CommentSection & CommentCard Components | Pending | 0%       | [phase-02](./phase-02-modify-comment-components.md)     |
| 03    | Update use-record-comments Hook                | Pending | 0%       | [phase-03](./phase-03-update-hook.md)                   |
| 04    | Integrate with RecordDetailPage                | Pending | 0%       | [phase-04](./phase-04-integrate-record-detail.md)       |
| 05    | Testing & Polish                               | Pending | 0%       | [phase-05](./phase-05-testing-polish.md)                |

## Key Files to Modify

```
packages/comments/
├── src/types/comment.ts           # Add replyToIds type
├── src/components/CommentSection.tsx   # Multi-reply state
├── src/components/CommentCard.tsx      # Flat display, reply reference
└── src/index.ts                   # Export new types

apps/web/src/features/active-tables/
├── hooks/use-record-comments.ts   # Remove buildCommentTree, send replyTo[]
└── pages/record-detail-page.tsx   # Integration
```

## API Compatibility

- Server already supports `replyTo: string[]` in create/update
- No backend changes required
- Focus on frontend transformation

## Prototype Reference

Working prototype at: `apps/web/src/features/active-tables/pages/comment-prototype/`
Route: `/{locale}/prototype/comments`

## Success Criteria

1. Single-reply UX unchanged (backward compatible)
2. Multi-reply works: select multiple → single response
3. Reply references display inline (not nested)
4. Jump-to-comment works for references
5. All existing comment features preserved (edit, delete, E2EE)

## Dependencies

- @workspace/comments package
- @workspace/ui components
- @tanstack/react-query for data fetching
