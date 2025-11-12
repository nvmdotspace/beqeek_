# @workspace/comments

React comment system component library for Beqeek Active Tables. Built with React 19, Lexical editor, and MDX preview support.

## Features

- ✅ **Rich Text Editing** - Lexical-based editor with formatting toolbar
- ✅ **MDX Preview** - Render comments with markdown formatting
- ✅ **Image Upload** - Drag-and-drop or click to upload images with file validation
- ✅ **Table Support** - Insert and edit tables in comments (3x3 default)
- ✅ **Emoji Picker** - Popover with 30 common emojis for quick insertion
- ✅ **Emoji Reactions** - 8 reaction types (👍 👎 😄 🎉 😕 ❤️ 🚀 👀)
- ✅ **Upvote System** - Optional upvoting with counts
- ✅ **Nested Replies** - Thread conversations with reply support
- ✅ **Edit & Delete** - Permission-based comment management
- ✅ **Copy Link** - Share direct links to comments
- ✅ **React 19 Compatible** - Built for latest React
- ✅ **TypeScript** - Full type safety
- ✅ **Accessible** - Using Radix UI primitives from @workspace/ui

## Installation

This package is part of the Beqeek monorepo workspace:

```bash
# From monorepo root
pnpm install

# Build the package
pnpm --filter @workspace/comments build
```

## Dependencies

- **React 19** - Latest React features
- **Lexical** - Rich text editing framework from Meta
- **@mdx-js/mdx** - MDX content rendering
- **@workspace/ui** - Shared UI components (Radix UI + Tailwind)
- **@workspace/beqeek-shared** - Shared types and constants
- **date-fns** - Date formatting
- **zustand** - State management (for future comment stores)

## Usage

### Basic CommentSection

```tsx
import { CommentSection } from '@workspace/comments';
import { useState } from 'react';

function MyComponent() {
  const [comments, setComments] = useState([]);
  const currentUser = {
    id: '1',
    fullName: 'John Doe',
    avatarUrl: 'https://avatar.url',
  };

  // Image upload handler
  const handleImageUpload = async (file: File): Promise<string> => {
    // Upload to your server/S3/CDN
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await response.json();
    return url;
  };

  return (
    <CommentSection
      value={comments}
      currentUser={currentUser}
      onChange={setComments}
      allowUpvote={true}
      onImageUpload={handleImageUpload}
      onVoteChange={(commentId, upvoted) => {
        console.log(`Comment ${commentId} upvoted: ${upvoted}`);
      }}
    />
  );
}
```

### Individual CommentCard

```tsx
import { CommentCard } from '@workspace/comments';

function MyCommentCard({ comment, currentUser }) {
  return (
    <CommentCard
      comment={comment}
      currentUser={currentUser}
      allowUpvote={true}
      onReply={(replyText) => console.log('Reply:', replyText)}
      onChange={(change) => console.log('Changed:', change)}
      onDelete={() => console.log('Deleted')}
      onVoteChange={(upvoted) => console.log('Upvoted:', upvoted)}
    />
  );
}
```

### Standalone CommentEditor

```tsx
import { CommentEditor } from '@workspace/comments';
import { useState } from 'react';

function MyEditor({ currentUser }) {
  const [content, setContent] = useState('');

  const handleImageUpload = async (file: File): Promise<string> => {
    // Your upload logic
    return 'https://example.com/uploaded-image.jpg';
  };

  return (
    <CommentEditor
      value={content}
      onChange={setContent}
      currentUser={currentUser}
      placeholder="Write your comment..."
      submitText="Post Comment"
      onSubmit={() => {
        console.log('Submit:', content);
        setContent('');
      }}
      onImageUpload={handleImageUpload}
      showCancel={false}
    />
  );
}
```

### MDX Preview Only

```tsx
import { CommentPreview } from '@workspace/comments';

function MyPreview({ mdxContent }) {
  return <CommentPreview source={mdxContent} className="prose prose-sm max-w-none" />;
}
```

### Emoji Reactions

```tsx
import { EmojiReactions } from '@workspace/comments';
import { useState } from 'react';

function MyReactions() {
  const [selected, setSelected] = useState([]);

  return (
    <EmojiReactions
      value={selected}
      onSelect={(newSelected, changed) => {
        console.log('Added:', changed);
        setSelected(newSelected);
      }}
      onUnSelect={(newSelected, changed) => {
        console.log('Removed:', changed);
        setSelected(newSelected);
      }}
    />
  );
}
```

## Type Definitions

### Comment

```typescript
type Comment = {
  id: string;
  user: CommentUser;
  parentId?: string;
  text: string; // HTML or MDX content
  replies?: Comment[];
  createdAt: Date;
  actions?: { [key in ACTIONS_TYPE]?: number };
  selectedActions?: ACTIONS_TYPE[];
  allowUpvote?: boolean;
};
```

### CommentUser

```typescript
type CommentUser = {
  id: string;
  fullName: string;
  userProfile?: string;
  avatarUrl?: string;
};
```

### ACTIONS_TYPE (Emoji Reactions)

```typescript
enum ACTIONS_TYPE {
  THUMB_UP = 'THUMB_UP', // 👍
  THUMB_DOWN = 'THUMB_DOWN', // 👎
  LAUGH = 'LAUGH', // 😄
  HOORAY = 'HOORAY', // 🎉
  CONFUSED = 'CONFUSED', // 😕
  HEART = 'HEART', // ❤️
  ROCKET = 'ROCKET', // 🚀
  EYE = 'EYE', // 👀
  UPVOTE = 'UPVOTE', // Special upvote action
}
```

### EMOJI_PICKER_LIST (Content Emojis)

```typescript
// 30 common emojis for inserting into comment content via toolbar picker
const EMOJI_PICKER_LIST = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🥳',
  '🤩',
] as const;
```

**Key Difference:**

- `ACTIONS_TYPE` emojis (8 types) → React to comments (like Facebook reactions)
- `EMOJI_PICKER_LIST` emojis (30 types) → Insert into comment content while writing

## API Reference

### CommentSection Props

| Prop            | Type                                            | Description                              |
| --------------- | ----------------------------------------------- | ---------------------------------------- |
| `value`         | `Comment[]`                                     | Array of comments                        |
| `currentUser`   | `CommentUser`                                   | Current user object                      |
| `onChange`      | `(comments: Comment[]) => void`                 | Callback when comments change            |
| `allowUpvote`   | `boolean`                                       | Enable upvote feature (default: false)   |
| `onVoteChange`  | `(commentId: string, upvoted: boolean) => void` | Vote change callback                     |
| `onImageUpload` | `(file: File) => Promise<string>`               | Image upload handler (returns image URL) |
| `className`     | `string`                                        | Additional CSS class                     |

### CommentCard Props

| Prop           | Type                              | Description           |
| -------------- | --------------------------------- | --------------------- |
| `comment`      | `Comment`                         | Comment data          |
| `currentUser`  | `CommentUser`                     | Current user object   |
| `allowUpvote`  | `boolean`                         | Enable upvote feature |
| `onReply`      | `(replyText: string) => void`     | Reply callback        |
| `onChange`     | `(change: CommentChange) => void` | Change callback       |
| `onDelete`     | `() => void`                      | Delete callback       |
| `onVoteChange` | `(upvoted: boolean) => void`      | Vote change callback  |

### CommentEditor Props

| Prop            | Type                              | Description                              |
| --------------- | --------------------------------- | ---------------------------------------- |
| `value`         | `string`                          | HTML content                             |
| `onChange`      | `(html: string) => void`          | Content change callback                  |
| `placeholder`   | `string`                          | Placeholder text                         |
| `currentUser`   | `CommentUser`                     | Current user for avatar                  |
| `submitText`    | `string`                          | Submit button text (default: "Comment")  |
| `onSubmit`      | `() => void`                      | Submit callback                          |
| `onCancel`      | `() => void`                      | Cancel callback                          |
| `showCancel`    | `boolean`                         | Show cancel button (default: false)      |
| `onImageUpload` | `(file: File) => Promise<string>` | Image upload handler (returns image URL) |
| `className`     | `string`                          | Additional CSS class                     |

## Migration from shadcn-comments

This package replaces `@mdxeditor/editor` with Lexical for React 19 compatibility:

### Key Changes

1. **Editor**: MDXEditor → Lexical Editor
2. **Components**: Uses @workspace/ui components (Radix UI primitives)
3. **React Version**: React 18 → React 19
4. **TypeScript**: Full strict mode type safety
5. **Architecture**: Modular package structure aligned with active-tables-core

### Migration Guide

```tsx
// Before (shadcn-comments)
import { CommentSection } from 'shadcn-comments';

// After (@workspace/comments)
import { CommentSection } from '@workspace/comments';

// API remains similar, but with Lexical editor instead of MDXEditor
```

## Package Structure

```
src/
├── types/              # TypeScript types
│   ├── comment.ts      # Comment, ACTIONS_TYPE, ACTIONS
│   ├── user.ts         # CommentUser
│   ├── permissions.ts  # Permission types
│   └── index.ts
├── components/         # React components
│   ├── editor/         # Lexical editor components
│   │   ├── CommentEditor.tsx
│   │   ├── CommentToolbar.tsx
│   │   ├── editor-config.ts
│   │   └── theme.ts
│   ├── CommentSection.tsx
│   ├── CommentCard.tsx
│   ├── CommentPreview.tsx
│   ├── EmojiReactions.tsx
│   └── index.ts
├── hooks/              # React hooks
│   ├── useCommentActions.ts
│   ├── useCommentPermissions.ts
│   ├── useCommentState.ts
│   └── index.ts
├── utils/              # Utility functions
│   ├── comment-helpers.ts
│   ├── date-formatter.ts
│   └── index.ts
└── index.ts            # Main export
```

## Editor Features

### Rich Text Toolbar

The CommentEditor includes a comprehensive toolbar with the following features:

- **Undo/Redo** - Navigate editing history
- **Bold/Italic** - Text formatting
- **Heading** - H2 headings for structure
- **Lists** - Bullet and numbered lists
- **Image Upload** - Click to upload or drag-and-drop images (supports PNG, JPEG, GIF, WebP up to 5MB)
- **Table Insertion** - Insert 3x3 tables with header row
- **Emoji Picker** - Popover with 30 common emojis

### Image Upload

Images can be added via:

- Click the Image button in toolbar → Select file
- Drag and drop image files directly into editor

File validation:

- Supported types: PNG, JPEG, GIF, WebP
- Max size: 5MB (configurable)
- Images display with max-width: 800px
- Alt text from filename

### Table Support

Tables are inserted as 3x3 grids with:

- Header row enabled by default
- Editable cells
- Borders using design tokens (border-border, bg-muted)
- Responsive styling

### Emoji Picker

Click the Smile icon in toolbar to open emoji picker for **inserting emojis into comment content**:

- 30 common emojis in 8-column grid (defined in `EMOJI_PICKER_LIST`)
- Click any emoji to insert at cursor position
- Positioned near toolbar for easy access

**Note:** This is different from **Emoji Reactions** which are used to react to existing comments (8 reaction types: 👍 👎 😄 🎉 😕 ❤️ 🚀 👀)

## Development

```bash
# Watch mode
pnpm --filter @workspace/comments dev

# Type check
pnpm --filter @workspace/comments check-types

# Lint
pnpm --filter @workspace/comments lint

# Build
pnpm --filter @workspace/comments build
```

## Related Packages

- **@workspace/ui** - Shared UI component library
- **@workspace/beqeek-shared** - Shared types and constants
- **@workspace/active-tables-core** - Active Tables core components

## License

Private - Part of Beqeek monorepo
