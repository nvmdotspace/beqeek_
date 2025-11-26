# Phase 04: Integrate with RecordDetailPage

## Context Links

- Parent: [plan.md](./plan.md)
- Depends on: [phase-03](./phase-03-update-hook.md)
- Page: `apps/web/src/features/active-tables/pages/record-detail-page.tsx`

## Overview

| Field                 | Value                                              |
| --------------------- | -------------------------------------------------- |
| Date                  | 2025-11-25                                         |
| Description           | Wire up updated CommentSection to RecordDetailPage |
| Priority              | High                                               |
| Implementation Status | Pending                                            |
| Review Status         | Pending                                            |

## Key Insights

1. RecordDetailPage already uses CommentSection from @workspace/comments
2. Main change: pass updated props for multi-reply
3. Add scroll-to-comment handler for reference jumps
4. Verify E2EE still works with new structure

## Requirements

- [ ] Update CommentSection props in RecordDetailPage
- [ ] Add jump-to-comment handler
- [ ] Verify E2EE encryption works
- [ ] Test comment flow end-to-end
- [ ] Ensure mobile responsiveness

## Architecture

### Current Integration

```tsx
<CommentSection
  value={comments}
  currentUser={currentUser}
  onChange={handleCommentsChange}
  onAddComment={addComment} // (text, parentId?) => Promise
  onUpdateComment={updateComment}
  onDeleteComment={deleteComment}
  onFetchComment={fetchCommentForEdit}
  // ...
/>
```

### Updated Integration

```tsx
<CommentSection
  value={comments} // Now flat array with replyToIds
  currentUser={currentUser}
  onChange={handleCommentsChange}
  onAddComment={addComment} // (text, replyToIds?) => Promise
  onUpdateComment={updateComment}
  onDeleteComment={deleteComment}
  onFetchComment={fetchCommentForEdit}
  onJumpToComment={handleJumpToComment} // NEW - for reference navigation
  // ...
/>
```

## Related Code Files

| File                                                               | Changes                           |
| ------------------------------------------------------------------ | --------------------------------- |
| `apps/web/src/features/active-tables/pages/record-detail-page.tsx` | Add onJumpToComment, verify props |

## Implementation Steps

### Step 1: Add Jump-to-Comment Handler

```typescript
// Add to RecordDetailPage
const handleJumpToComment = useCallback((commentId: string) => {
  const element = document.getElementById(`comment-${commentId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Optional: highlight briefly
    element.classList.add('highlight-comment');
    setTimeout(() => element.classList.remove('highlight-comment'), 2000);
  }
}, []);
```

### Step 2: Update CommentSection Usage

```tsx
<CommentSection
  value={comments}
  currentUser={currentUser}
  onChange={handleCommentsChange}
  allowUpvote={false}
  showReactions={false}
  compactMode={true}
  mentionUsers={mentionUsers}
  onAddComment={addComment}
  onUpdateComment={updateComment}
  onDeleteComment={deleteComment}
  onFetchComment={fetchCommentForEdit}
  onJumpToComment={handleJumpToComment} // Add this
  onError={handleCommentError}
  hasNextPage={hasNextPage}
  isFetchingNextPage={isFetchingNextPage}
  onLoadMore={fetchNextPage}
/>
```

### Step 3: Add Highlight Styles (Optional)

```css
/* In globals.css or component */
.highlight-comment {
  animation: highlight-fade 2s ease-out;
}

@keyframes highlight-fade {
  0% {
    background-color: hsl(var(--primary) / 0.2);
  }
  100% {
    background-color: transparent;
  }
}
```

### Step 4: Verify E2EE Flow

```typescript
// Ensure encryption still works
// 1. Create comment with replyToIds
// 2. Verify content encrypted before send
// 3. Verify decryption on fetch
// 4. Check replyToIds preserved (not encrypted)
```

## Todo List

- [ ] Add handleJumpToComment callback
- [ ] Pass onJumpToComment to CommentSection
- [ ] Add CSS for highlight animation
- [ ] Test E2EE encryption/decryption
- [ ] Test multi-reply flow end-to-end
- [ ] Verify mobile layout
- [ ] Test with real API

## Success Criteria

- Click reply reference → scrolls to comment
- Create multi-reply comment → saves correctly
- Edit/delete still work
- E2EE encryption unchanged
- Mobile responsive maintained
- Loading states work properly

## Risk Assessment

| Risk                           | Impact | Mitigation                                 |
| ------------------------------ | ------ | ------------------------------------------ |
| E2EE breaking                  | High   | Test thoroughly, encryption keys unchanged |
| Scroll behavior issues         | Low    | Fallback to no-scroll if element not found |
| Performance with many comments | Low    | Already paginated                          |

## Security Considerations

- E2EE encryption key handling unchanged
- Comment IDs in replyToIds not encrypted (reference only)
- Server validates replyTo IDs exist

## Next Steps

After integration complete, proceed to Phase 05 for testing and polish.
