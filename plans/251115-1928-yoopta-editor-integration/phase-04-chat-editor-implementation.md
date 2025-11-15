# Phase 04: Chat Editor Implementation

**Phase**: 04/08 | **Duration**: 2h | **Status**: ⏸️ Pending | **Depends on**: Phase 02

## Overview

Implement lightweight ChatEditor for comments/messages with minimal plugin set optimized for fast loading and chat UX.

## Key Differences from DocumentEditor

- **Plugins**: Only Paragraph, Lists, Link, Code (4 vs 14)
- **Marks**: Bold, Italic, CodeMark, Strike (4 vs 6)
- **Tools**: Toolbar, LinkTool only (no ActionMenu)
- **UX**: Enter to submit, Shift+Enter for newline
- **Styling**: Compact, chat-like appearance

## Implementation

### Files to Create

1. `/packages/beqeek-editor/src/chat-editor/plugins.ts` - Minimal plugin set
2. `/packages/beqeek-editor/src/chat-editor/marks.ts` - Basic marks
3. `/packages/beqeek-editor/src/chat-editor/tools.ts` - Toolbar only
4. `/packages/beqeek-editor/src/chat-editor/ChatEditor.tsx` - Main component
5. `/packages/beqeek-editor/src/hooks/useChatEditor.ts` - Chat hook with submit handling

### ChatEditor Props

```typescript
interface ChatEditorProps {
  value?: YooptaContentValue;
  onChange?: (value: YooptaContentValue) => void;
  onSubmit?: (value: YooptaContentValue) => void;
  placeholder?: string;
  submitOnEnter?: boolean; // default: true
  className?: string;
}
```

### Key Features

- Enter key submits (Shift+Enter for newline)
- Minimal toolbar (inline, not floating)
- No slash commands
- Compact height (auto-resize)
- Clear button after submit

## Testing

- [ ] Renders without errors
- [ ] Type text works
- [ ] Enter submits message
- [ ] Shift+Enter adds newline
- [ ] Bold/Italic formatting works
- [ ] Lists work (-, 1.)
- [ ] Editor clears after submit
- [ ] No console errors

## Success Criteria

✅ ChatEditor functional, faster load than DocumentEditor, submit on Enter works

→ Next: [Phase 05: Custom Plugins](./phase-05-custom-plugins.md)
