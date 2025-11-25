# Phase 05: Testing & Polish

## Context Links

- Parent: [plan.md](./plan.md)
- Depends on: [phase-04](./phase-04-integrate-record-detail.md)

## Overview

| Field                 | Value                               |
| --------------------- | ----------------------------------- |
| Date                  | 2025-11-25                          |
| Description           | Comprehensive testing and UI polish |
| Priority              | High                                |
| Implementation Status | Pending                             |
| Review Status         | Pending                             |

## Key Insights

1. Test both single-reply (backward compat) and multi-reply flows
2. Verify E2EE with encrypted tables
3. Test edge cases: deleted references, many replies
4. Polish animations and transitions
5. Ensure accessibility (keyboard nav, screen readers)

## Requirements

- [ ] Unit tests for new components
- [ ] Integration tests for comment flow
- [ ] E2EE encryption tests
- [ ] Edge case handling
- [ ] Accessibility audit
- [ ] Performance check
- [ ] Mobile testing

## Test Cases

### Functional Tests

| Test Case                 | Expected Result                          |
| ------------------------- | ---------------------------------------- |
| Single reply              | Works like before, no UX change          |
| Multi-reply (2 comments)  | Both shown in indicator, saved correctly |
| Multi-reply (5+ comments) | Shows "N messages" with expand option    |
| Toggle reply selection    | Click again removes from list            |
| Clear all replies         | X button clears all, returns to normal   |
| Submit multi-reply        | New comment has replyToIds array         |
| Click reference badge     | Scrolls to referenced comment            |
| Multi-reference popover   | Shows all references, clickable          |
| Edit comment with replies | replyToIds preserved                     |
| Delete referenced comment | Badge handles gracefully                 |

### E2EE Tests

| Test Case                | Expected Result                    |
| ------------------------ | ---------------------------------- |
| Create encrypted comment | Content encrypted, replyToIds not  |
| Read encrypted comment   | Content decrypted, references work |
| Multi-reply encrypted    | All content encrypted properly     |
| Invalid encryption key   | Shows appropriate error            |

### Edge Cases

| Test Case                | Expected Result                    |
| ------------------------ | ---------------------------------- |
| Reply to deleted comment | Show "[Deleted]" or hide reference |
| Reply to 10+ comments    | Performance OK, UI scrollable      |
| Empty comment list       | Shows placeholder                  |
| Network error on submit  | Error toast, content preserved     |
| Concurrent edits         | Last write wins, no data loss      |

### Accessibility Tests

| Test Case           | Expected Result                         |
| ------------------- | --------------------------------------- |
| Keyboard navigation | Tab through replies, Enter to select    |
| Screen reader       | Announces "Replying to N messages"      |
| Focus management    | Focus returns to editor after selection |
| Color contrast      | Passes WCAG AA                          |

## Related Code Files

| File                    | Tests Needed                          |
| ----------------------- | ------------------------------------- |
| ReplyIndicator.tsx      | Unit: render, remove, expand/collapse |
| ReplyReferenceBadge.tsx | Unit: single, multi, click handling   |
| CommentSection.tsx      | Integration: full flow                |
| use-record-comments.ts  | Unit: data transformation             |

## Implementation Steps

### Step 1: Write Unit Tests

```typescript
// ReplyIndicator.test.tsx
describe('ReplyIndicator', () => {
  it('shows single reply preview');
  it('shows "N messages" when > maxVisible');
  it('expands to show all');
  it('removes individual reply on X click');
  it('clears all on cancel');
});
```

### Step 2: Write Integration Tests

```typescript
// CommentSection.test.tsx
describe('Multi-Reply Flow', () => {
  it('selects multiple comments');
  it('submits with replyToIds array');
  it('clears selection after submit');
  it('shows reference badge on new comment');
});
```

### Step 3: UI Polish

- Smooth transitions on indicator show/hide
- Highlight animation on jump-to-comment
- Loading states for async operations
- Error states with retry option

### Step 4: Accessibility Fixes

- Add aria-labels to reply buttons
- Announce state changes
- Ensure focus trap in popover
- Test with VoiceOver/NVDA

### Step 5: Performance Optimization

- Memoize comment list rendering
- Lazy load ReplyReferenceBadge content
- Virtualize if 100+ comments

## Todo List

- [ ] Write ReplyIndicator unit tests
- [ ] Write ReplyReferenceBadge unit tests
- [ ] Write CommentSection integration tests
- [ ] Test E2EE flow manually
- [ ] Test edge cases manually
- [ ] Run accessibility audit
- [ ] Performance profiling
- [ ] Fix any issues found
- [ ] Code review
- [ ] Deploy to staging
- [ ] QA sign-off

## Success Criteria

- All tests pass
- No console errors
- Smooth animations
- WCAG AA compliant
- Performance acceptable (<100ms render)
- Works on mobile
- QA approved

## Risk Assessment

| Risk                   | Impact | Mitigation                           |
| ---------------------- | ------ | ------------------------------------ |
| Test coverage gaps     | Medium | Focus on critical paths first        |
| Accessibility issues   | Medium | Use automated tools + manual testing |
| Performance regression | Low    | Profile before/after                 |

## Security Considerations

- E2EE key never logged in tests
- Test data doesn't include real user data
- Error messages don't leak sensitive info

## Cleanup Tasks

- [ ] Remove prototype page (or keep as reference)
- [ ] Remove console.logs
- [ ] Update documentation
- [ ] Create migration notes if needed

## Next Steps

After testing complete:

1. Merge to main branch
2. Deploy to production
3. Monitor for issues
4. Gather user feedback
