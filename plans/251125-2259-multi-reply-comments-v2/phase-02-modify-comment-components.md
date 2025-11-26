# Phase 02: Modify CommentSection & CommentCard Components

## Context Links

- Parent: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-update-comments-package-types.md)
- Prototype: `apps/web/src/features/active-tables/pages/comment-prototype/`

## Overview

| Field                 | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| Date                  | 2025-11-25                                             |
| Description           | Update UI components for flat display with multi-reply |
| Priority              | High                                                   |
| Implementation Status | Pending                                                |
| Review Status         | Pending                                                |

## Key Insights

1. CommentSection needs `replyingToIds: string[]` state (not single parentId)
2. CommentCard removes nested rendering, adds reply reference indicator
3. Toggle behavior: click Reply again = remove from list
4. ReplyIndicator shows selected comments above editor
5. ReplyReferenceBadge shows what comment is replying to inline

## Requirements

- [ ] Add multi-select reply state to CommentSection
- [ ] Create ReplyIndicator component (above editor)
- [ ] Create ReplyReferenceBadge component (inline with comment)
- [ ] Remove nested reply rendering from CommentCard
- [ ] Update onReply callback to pass array
- [ ] Add onJumpToComment for reference navigation

## Architecture

### State Flow

```
User clicks "Reply" on Comment A
  → replyingToIds = ['A']
  → ReplyIndicator shows "Replying to A"

User clicks "Reply" on Comment B
  → replyingToIds = ['A', 'B']
  → ReplyIndicator shows "Replying to 2 messages"

User submits
  → onAddComment(text, ['A', 'B'])
  → New comment created with replyToIds: ['A', 'B']
  → replyingToIds = []
```

### Component Structure

```
CommentSection
├── ReplyIndicator (when replyingToIds.length > 0)
│   └── List of selected comments with X to remove
├── CommentEditor
│   └── Placeholder changes based on reply count
└── Comments List (FLAT - no nesting)
    └── CommentCard
        ├── ReplyReferenceBadge (if replyToIds.length > 0)
        ├── Content
        └── Reply button (toggles selection)
```

## Related Code Files

| File                                                       | Changes                             |
| ---------------------------------------------------------- | ----------------------------------- |
| `packages/comments/src/components/CommentSection.tsx`      | Multi-reply state, ReplyIndicator   |
| `packages/comments/src/components/CommentCard.tsx`         | Remove nesting, add reference badge |
| `packages/comments/src/components/ReplyIndicator.tsx`      | NEW - shows selected replies        |
| `packages/comments/src/components/ReplyReferenceBadge.tsx` | NEW - shows inline reference        |

## Implementation Steps

### Step 1: Create ReplyIndicator Component

```typescript
interface ReplyIndicatorProps {
  replyingToIds: string[];
  comments: Comment[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  maxVisible?: number; // Default 2, then "N messages"
}
```

### Step 2: Create ReplyReferenceBadge Component

```typescript
interface ReplyReferenceBadgeProps {
  replyToIds: string[];
  comments: Comment[];
  onJumpToComment?: (id: string) => void;
}
```

### Step 3: Update CommentSection

- Change state from single parentId to `replyingToIds: string[]`
- Add toggle logic for reply selection
- Update onAddComment signature: `(text, replyToIds?) => Promise<void>`
- Render ReplyIndicator above editor

### Step 4: Update CommentCard

- Remove nested `comment.replies` rendering
- Remove "Hide N replies" toggle
- Add ReplyReferenceBadge below header
- Reply button toggles instead of opening inline editor

### Step 5: Update Props Interface

```typescript
interface CommentSectionProps {
  // ... existing props
  onAddComment?: (text: string, replyToIds?: string[]) => Promise<void>;
  // Note: replyToIds is array now, not parentId
}
```

## Todo List

- [ ] Create ReplyIndicator.tsx component
- [ ] Create ReplyReferenceBadge.tsx component
- [ ] Update CommentSection state to use array
- [ ] Update CommentSection reply handling
- [ ] Remove nested rendering from CommentCard
- [ ] Add ReplyReferenceBadge to CommentCard
- [ ] Update CommentCard reply button behavior
- [ ] Export new components from index
- [ ] Test with prototype data

## Success Criteria

- Comments display flat (no nesting)
- Can select multiple comments to reply
- ReplyIndicator shows above editor
- ReplyReferenceBadge shows inline with comments
- Toggle works (click again to deselect)
- Single-reply UX feels identical to before

## Risk Assessment

| Risk                           | Impact | Mitigation                             |
| ------------------------------ | ------ | -------------------------------------- |
| UX confusion                   | Medium | Keep single-reply identical to current |
| Performance with many comments | Low    | Virtualize if needed later             |
| Breaking existing integrations | Medium | Keep callback signature compatible     |

## Security Considerations

- No security impact - UI changes only
- XSS prevention maintained in CommentPreview

## Next Steps

After components updated, proceed to Phase 03 to update the data hook.
