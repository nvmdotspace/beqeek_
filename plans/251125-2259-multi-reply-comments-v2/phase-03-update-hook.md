# Phase 03: Update use-record-comments Hook

## Context Links

- Parent: [plan.md](./plan.md)
- Depends on: [phase-02](./phase-02-modify-comment-components.md)
- API Docs: Server already supports `replyTo: string[]`

## Overview

| Field                 | Value                                                   |
| --------------------- | ------------------------------------------------------- |
| Date                  | 2025-11-25                                              |
| Description           | Update hook to return flat comments, handle multi-reply |
| Priority              | High                                                    |
| Implementation Status | Pending                                                 |
| Review Status         | Pending                                                 |

## Key Insights

1. `buildCommentTree()` function should be removed - keep flat
2. Server returns `replyTo: string[]` - map to `replyToIds`
3. `addComment` signature changes to accept `replyToIds?: string[]`
4. No nested tree building needed

## Requirements

- [ ] Remove `buildCommentTree()` function
- [ ] Map server `replyTo` to Comment `replyToIds`
- [ ] Update `addComment` to accept replyToIds array
- [ ] Remove `parentId` mapping (deprecated)
- [ ] Ensure flat list returned in correct order (by createdAt)

## Architecture

### Before (Tree Structure)

```typescript
// Server returns flat list
const serverComments = [c1, c2, c3, reply1, reply2];

// Hook builds tree
const treeComments = buildCommentTree(serverComments);
// Result: [{...c1, replies: [reply1]}, {c2, replies: []}, ...]

// Component renders nested
{comments.map(c => <CommentCard>{c.replies.map(...)}</CommentCard>)}
```

### After (Flat Structure)

```typescript
// Server returns flat list
const serverComments = [c1, c2, c3, reply1, reply2];

// Hook keeps flat, adds replyToIds
const flatComments = serverComments.map(c => ({
  ...c,
  replyToIds: c.replyTo || [],
}));
// Result: [{...c1, replyToIds: []}, ..., {...reply1, replyToIds: ['c1']}]

// Component renders flat with references
{comments.map(c => <CommentCard replyToIds={c.replyToIds} />)}
```

## Related Code Files

| File                                                               | Changes                                 |
| ------------------------------------------------------------------ | --------------------------------------- |
| `apps/web/src/features/active-tables/hooks/use-record-comments.ts` | Remove tree building, update addComment |

## Implementation Steps

### Step 1: Update serverToPackageComment Function

```typescript
function serverToPackageComment(
  serverComment: ServerComment,
  encryptionKey?: string,
  userLookup?: UserLookupMap,
): PackageComment {
  // ...existing decryption...

  return {
    id: serverComment.id,
    user: { id: userId, fullName, avatarUrl },
    // Map server replyTo array to replyToIds
    replyToIds: serverComment.replyTo || [],
    // Keep parentId for backward compat (first element)
    parentId: serverComment.replyTo?.[0],
    text: decryptedContent || '',
    createdAt: new Date(serverComment.createdAt),
    // Remove: replies: [],
    actions: {},
    selectedActions: [],
  };
}
```

### Step 2: Remove buildCommentTree Function

```typescript
// DELETE this entire function
function buildCommentTree(flatComments: PackageComment[]): PackageComment[] {
  // ... tree building logic
}
```

### Step 3: Update useMemo for Comments

```typescript
const comments = useMemo((): PackageComment[] => {
  if (!data?.pages) return [];

  const allServerComments = data.pages.flatMap((page) => page.data);
  // Simply convert, no tree building
  return allServerComments.map((c) => serverToPackageComment(c, encryptionKey, userLookup));
}, [data?.pages, encryptionKey, userLookup]);
```

### Step 4: Update addComment Mutation

```typescript
const addCommentMutation = useMutation({
  mutationFn: async ({ text, replyToIds }: { text: string; replyToIds?: string[] }) => {
    const taggedUserIds = extractMentionedUserIds(text);
    const encryptedContent = encryptContent(text, encryptionKey);
    const hashedKeywords = generateHashedKeywords(text, encryptionKey);

    return commentsApi.createComment(workspaceId, tableId, recordId, {
      commentContent: encryptedContent,
      // Send full array, not just first element
      replyTo: replyToIds?.length ? replyToIds : undefined,
      taggedUserIds: taggedUserIds.length > 0 ? taggedUserIds : undefined,
      hashed_keywords: hashedKeywords,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey });
  },
});
```

### Step 5: Update addComment Callback

```typescript
const addComment = useCallback(
  async (text: string, replyToIds?: string[]) => {
    await addCommentMutation.mutateAsync({ text, replyToIds });
  },
  [addCommentMutation],
);
```

### Step 6: Update CommentsState Interface

```typescript
export interface CommentsState {
  comments: PackageComment[];
  // ... other fields
  addComment: (text: string, replyToIds?: string[]) => Promise<void>;
  // Note: Changed from parentId?: string to replyToIds?: string[]
}
```

## Todo List

- [ ] Update serverToPackageComment to map replyToIds
- [ ] Remove buildCommentTree function
- [ ] Update comments useMemo to return flat list
- [ ] Update addCommentMutation for replyToIds array
- [ ] Update addComment callback signature
- [ ] Update CommentsState interface
- [ ] Test with existing comments data

## Success Criteria

- Comments returned as flat array (no nested replies)
- Each comment has `replyToIds: string[]`
- Creating comment with multi-reply works
- Backward compat: single reply still works
- E2EE encryption/decryption unaffected

## Risk Assessment

| Risk                      | Impact | Mitigation                                 |
| ------------------------- | ------ | ------------------------------------------ |
| Data migration            | None   | Server data unchanged, only client display |
| Existing comments display | Low    | replyToIds handles both old and new        |
| API contract              | None   | Server already supports replyTo[]          |

## Security Considerations

- E2EE encryption unchanged
- replyTo IDs validated by server
- No new attack vectors introduced

## Next Steps

After hook updated, proceed to Phase 04 to integrate with RecordDetailPage.
