# Phase 07: Testing & Validation

**Phase**: 07/08 | **Duration**: 2h | **Status**: ⏸️ Pending | **Depends on**: Phases 03-06

## Overview

Comprehensive testing of both DocumentEditor and ChatEditor with focus on React 19 compatibility, performance, and integration.

## Test Categories

### 1. Unit Tests (Optional - Phase 07a)

Skip for MVP, focus on manual/integration testing.

### 2. Integration Testing

**Document Editor**:

- [ ] All 14 plugins render
- [ ] Slash commands functional
- [ ] Keyboard shortcuts work (Cmd+B, Cmd+I, etc.)
- [ ] File uploads (mock API)
- [ ] Export to markdown/HTML
- [ ] Import from markdown
- [ ] Undo/redo operations
- [ ] Copy/paste preserves formatting

**Chat Editor**:

- [ ] Minimal plugins render
- [ ] Submit on Enter works
- [ ] Shift+Enter adds newline
- [ ] Clear after submit
- [ ] @mentions functional
- [ ] Emoji picker functional

### 3. React 19 Compatibility

- [ ] No console errors (React warnings)
- [ ] DevTools show React 19.1.1
- [ ] No deprecated API usage warnings
- [ ] Event handlers work correctly
- [ ] Suspense boundaries work (if used)

### 4. Performance Benchmarks

Test with large document (500 blocks):

- [ ] Initial render < 500ms
- [ ] Typing latency < 50ms
- [ ] Scroll performance smooth (60fps)
- [ ] Memory usage reasonable (< 100MB)

Compare vs Lexical (current @workspace/comments):

- [ ] Bundle size difference acceptable
- [ ] Load time comparable
- [ ] Runtime performance similar

### 5. Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 6. Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible (aria labels)
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA
- [ ] Tab order logical

## Manual Test Script

Create `/plans/251115-1928-yoopta-editor-integration/test-script.md`:

```markdown
# Yoopta Editor Test Script

## Pre-requisites

- Beqeek dev server running
- Test user logged in
- Browser DevTools open

## Document Editor Tests

1. Navigate to /test-document-editor
2. Type paragraph text → PASS/FAIL
3. Type `/h1` → H1 created → PASS/FAIL
   ...

## Chat Editor Tests

1. Navigate to /test-chat-editor
2. Type message → PASS/FAIL
3. Press Enter → Submits → PASS/FAIL
   ...

## Results Summary

- Total tests: X
- Passed: Y
- Failed: Z
```

## Success Criteria

✅ **Phase complete when**:

- All integration tests pass
- No React 19 errors
- Performance benchmarks meet targets
- Browser compatibility verified
- Manual test script 95%+ pass rate

→ Next: [Phase 08: Documentation](./phase-08-documentation.md)
