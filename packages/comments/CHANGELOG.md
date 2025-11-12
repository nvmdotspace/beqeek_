# Changelog - @workspace/comments

## [0.2.0] - 2025-11-12

### ✨ Design Improvements

- Redesigned CommentEditor with cleaner, more modern interface
- Removed video upload button (per user request)
- Improved toolbar styling with better spacing and visual hierarchy
- Enhanced placeholder text and input area styling
- Updated avatar sizing and positioning
- Improved button styling with better focus states

### 🎨 UI Changes

- Changed border-radius from `rounded-md` to `rounded-lg` for softer edges
- Increased padding and improved spacing throughout
- Removed background color from toolbar for cleaner look
- Made editor text smaller (text-sm) for better readability
- Improved Comment button styling with primary colors
- Better visual separation between toolbar and content area

### 🔧 Technical Changes

- Removed `onVideoUpload` prop from all components
- Removed Video button from CommentToolbar
- Updated all component interfaces to remove video-related props
- Simplified toolbar to show only: Undo/Redo, Bold/Italic/Underline/Code, Paperclip, @Mention, Emoji, AI Assistant
- Improved CSS styling for better responsiveness

### 📦 Components Updated

- `CommentEditor.tsx` - Redesigned layout and styling
- `CommentToolbar.tsx` - Removed video button, improved button styles
- `CommentSection.tsx` - Updated props interface
- `CommentCard.tsx` - Updated props interface
- `styles.css` - Improved editor styling

### 🚀 Features Retained

- ✅ Rich text editing with Lexical
- ✅ Image upload with drag-and-drop
- ✅ @Mentions with typeahead
- ✅ Emoji picker (30 emojis)
- ✅ AI Assistant integration
- ✅ Emoji reactions (8 types)
- ✅ Nested replies
- ✅ Edit & Delete comments
- ✅ Upvote system
- ✅ Copy link functionality

## [0.1.0] - 2025-11-12

### 🎉 Initial Release

- Full Lexical-based rich text editor
- Image and video upload support
- @Mentions with typeahead
- Emoji picker and reactions
- AI Assistant button
- Complete comment system with replies
