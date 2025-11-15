# Phase 05: Custom Plugins (@mention, Emoji)

**Phase**: 05/08 | **Duration**: 2h | **Status**: ⏸️ Pending | **Depends on**: Phase 03, 04

## Overview

Create custom Yoopta plugins for @mentions and emoji picker matching existing `@workspace/comments` functionality.

## Plugins to Create

### 1. Mention Plugin (@mentions)

**Pattern**: Type `@` triggers dropdown with user search

**Implementation**:

- `/packages/beqeek-editor/src/plugins/mention-plugin.ts`
- Custom Slate node type: `mention`
- Renders: `<span className="mention">@{user.name}</span>`
- Props: `users: MentionUser[]`, `onSearch?: (query: string) => Promise<MentionUser[]>`

**Reference**: `/packages/comments/src/components/editor/plugins/MentionsPlugin.tsx` (Lexical version)

### 2. Emoji Picker Plugin

**Pattern**: Button in toolbar opens emoji picker popover

**Implementation**:

- `/packages/beqeek-editor/src/plugins/emoji-plugin.ts`
- Custom tool (not plugin)
- Popover with 30 emojis (from `@workspace/comments` EMOJI_PICKER_LIST)
- Inserts emoji at cursor position

**Reference**: `/packages/comments/src/constants/emojis.ts`

## Integration

Update both DocumentEditor and ChatEditor to support custom plugins:

```typescript
import { createMentionPlugin } from '../plugins/mention-plugin.js';
import { EmojiTool } from '../plugins/emoji-plugin.js';

const plugins = [...basePlugins, createMentionPlugin({ users, onSearch })];

const tools = {
  ...CHAT_TOOLS,
  EmojiPicker: { render: EmojiPickerRender, tool: EmojiTool },
};
```

## Testing

- [ ] Type `@` shows user dropdown
- [ ] Select user inserts mention
- [ ] Mention renders with highlight
- [ ] Emoji button opens picker
- [ ] Click emoji inserts at cursor
- [ ] Mentions persist in JSON
- [ ] No TypeScript errors

## Success Criteria

✅ @mentions functional, emoji picker working, integrated in both editors

→ Next: [Phase 06: shadcn Integration](./phase-06-shadcn-integration.md)
