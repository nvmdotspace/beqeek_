# Phase 01: Update @workspace/comments Package Types

## Context Links

- Parent: [plan.md](./plan.md)
- Prototype: `apps/web/src/features/active-tables/pages/comment-prototype/`

## Overview

| Field                 | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| Date                  | 2025-11-25                                                 |
| Description           | Update Comment type to support multi-reply with replyToIds |
| Priority              | High                                                       |
| Implementation Status | Pending                                                    |
| Review Status         | Pending                                                    |

## Key Insights

1. Current `Comment` type uses `parentId?: string` for single parent
2. Server API already supports `replyTo: string[]` array
3. Need to add `replyToIds: string[]` to Comment type
4. Keep `parentId` for backward compat, mark deprecated
5. `replies?: Comment[]` will be removed (no nesting)

## Requirements

- [ ] Add `replyToIds: string[]` to Comment type
- [ ] Deprecate `parentId` with JSDoc comment
- [ ] Remove or deprecate `replies` field
- [ ] Update CommentSectionProps for multi-reply callbacks
- [ ] Export new types from package index

## Architecture

```typescript
// Before
type Comment = {
  id: string;
  user: CommentUser;
  parentId?: string; // Single parent
  text: string;
  replies?: Comment[]; // Nested structure
  createdAt: Date;
  // ...
};

// After
type Comment = {
  id: string;
  user: CommentUser;
  /** @deprecated Use replyToIds instead */
  parentId?: string;
  replyToIds: string[]; // Multi-reply support
  text: string;
  // replies removed - flat structure
  createdAt: Date;
  // ...
};
```

## Related Code Files

| File                                     | Changes                                            |
| ---------------------------------------- | -------------------------------------------------- |
| `packages/comments/src/types/comment.ts` | Add replyToIds, deprecate parentId, remove replies |
| `packages/comments/src/types/index.ts`   | Re-export updated types                            |
| `packages/comments/src/index.ts`         | Ensure exports                                     |

## Implementation Steps

1. Edit `packages/comments/src/types/comment.ts`:
   - Add `replyToIds: string[]` field
   - Add `@deprecated` JSDoc to `parentId`
   - Remove `replies?: Comment[]` field

2. Update type exports if needed

3. Run `pnpm build` in packages/comments to verify

## Todo List

- [ ] Modify Comment type in comment.ts
- [ ] Add deprecation notice to parentId
- [ ] Remove replies field
- [ ] Rebuild package
- [ ] Verify no type errors

## Success Criteria

- Comment type has `replyToIds: string[]`
- Package builds without errors
- TypeScript reports deprecation on `parentId` usage

## Risk Assessment

| Risk                   | Impact | Mitigation                               |
| ---------------------- | ------ | ---------------------------------------- |
| Breaking existing code | Medium | Keep parentId as deprecated, not removed |
| Type conflicts         | Low    | Ensure all consumers updated together    |

## Security Considerations

- No security impact - type changes only
- Data validation handled by API layer

## Next Steps

After this phase, proceed to Phase 02 to update component implementations.
