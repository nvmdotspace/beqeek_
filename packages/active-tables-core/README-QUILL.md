# Quill.js Integration in RichTextField

## Overview

The `RichTextField` component now uses **Quill.js** (via `react-quill`) for rich text editing, providing a professional WYSIWYG experience.

## Features

- **Full-featured toolbar**: Headers, bold, italic, underline, strike, lists, colors, alignment, links, images
- **Display & Edit modes**: Seamless transition between viewing and editing
- **Vietnamese support**: Full Unicode support for Vietnamese characters
- **Validation**: Integrated field validation on content change
- **Accessibility**: ARIA attributes and keyboard navigation
- **Disabled state**: Proper read-only mode styling
- **Empty state handling**: Quill's empty content detection

## Usage in Parent Apps

### 1. Import the Component

```tsx
import { RichTextField } from '@workspace/active-tables-core';
```

### 2. Import Quill CSS

The parent app needs to import Quill's CSS for proper styling:

```tsx
// In your main app file (e.g., main.tsx or App.tsx)
import 'quill/dist/quill.snow.css';
```

**Note**: The CSS is already imported in the RichTextField component, but for proper bundling in your app, it's recommended to import it at the app level.

### 3. Use the Component

```tsx
<RichTextField
  field={{
    type: 'RICH_TEXT',
    name: 'description',
    label: 'Description',
    required: true,
    placeholder: 'Enter description...',
  }}
  value={content}
  onChange={(newContent) => setContent(newContent)}
  mode="edit"
  table={tableMetadata}
/>
```

## Configuration

### Default Toolbar

The default toolbar includes:
- **Headers**: H1, H2, H3
- **Text formatting**: Bold, italic, underline, strike
- **Lists**: Ordered and bullet lists
- **Colors**: Text and background colors
- **Alignment**: Left, center, right, justify
- **Media**: Links and images
- **Clear formatting**: Remove all formatting

### Customizing Toolbar

To customize the toolbar, you can extend the `RichTextField` component:

```tsx
const customModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    ['link'],
  ],
};

// Pass as prop in your custom wrapper
```

## Data Format

### Stored Format
- Content is stored as **HTML string**
- Example: `<p><strong>Bold text</strong> and <em>italic</em></p>`

### Empty Content
- Empty content is stored as empty string `""`
- Quill's empty state `<p><br></p>` is automatically converted to `""`

## Display Mode

In display mode, the content is rendered using Quill's `.ql-editor` class to maintain consistent styling:

```tsx
<div className="ql-editor" style={{ padding: 0 }}>
  <div dangerouslySetInnerHTML={{ __html: content }} />
</div>
```

## Edit Mode

In edit mode, the full Quill editor is rendered with:
- Interactive toolbar
- Content editing area
- Validation on change
- Proper focus management

## Styling

### Customizing Editor Appearance

You can customize the editor's appearance by:

1. **Overriding Quill CSS classes** in your app's global CSS:

```css
.ql-toolbar {
  border-radius: 8px 8px 0 0;
  background: #f9fafb;
}

.ql-container {
  border-radius: 0 0 8px 8px;
  font-family: inherit;
}
```

2. **Using className prop**:

```tsx
<RichTextField
  {...props}
  className="custom-rich-editor"
/>
```

## Vietnamese Typography

Quill fully supports Vietnamese characters (ă, â, ê, ô, ơ, ư, đ) and diacritics. No special configuration needed.

## Security

The component uses React's `dangerouslySetInnerHTML` for rendering HTML content. In production:

1. **Sanitize HTML** before storing to database
2. Consider using **DOMPurify** in your API layer
3. Validate content length and structure

## Performance

- **Memoization**: Toolbar modules and formats are memoized to prevent re-renders
- **Lazy loading**: Consider lazy-loading the Quill editor for better initial load time
- **Bundle size**: Quill adds ~200KB to your bundle (gzipped: ~60KB)

## Dependencies

- `quill@^2.0.3` - Core Quill library
- `react-quill@^2.0.0` - React wrapper for Quill

## Browser Support

Quill supports all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Styles not appearing
**Solution**: Ensure `quill/dist/quill.snow.css` is imported in your app.

### Content not saving
**Check**: Verify `onChange` callback is properly handling the HTML string.

### Editor not responsive
**Fix**: Wrap in a container with proper width constraints.

### React 19 peer dependency warning
**Ignore**: react-quill works fine with React 19 despite the peer dependency warning.

## Migration from Simple Textarea

If you're migrating from the old textarea implementation:

1. Existing plain text content will render as-is
2. HTML content will render with proper formatting
3. No data migration needed - Quill handles both gracefully

## Future Enhancements

Potential improvements for future versions:

- [ ] Custom toolbar configuration via props
- [ ] Image upload handler
- [ ] Mention support (@username)
- [ ] Table support
- [ ] Code syntax highlighting
- [ ] Collaborative editing (with Y.js)

## References

- [Quill.js Documentation](https://quilljs.com/)
- [React-Quill GitHub](https://github.com/zenoamaro/react-quill)
- [Quill Modules](https://quilljs.com/docs/modules/)
- [Quill Formats](https://quilljs.com/docs/formats/)
