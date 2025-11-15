# Phase 03: Plugin Configuration with shadcn/ui Renders

**Parent Plan:** [plan.md](./plan.md)
**Phase:** 03/07
**Dependencies:** Phase 02 (Core editor integration complete)

## Context

Configure all 14 Yoopta plugins with custom shadcn/ui component renders for consistent design system integration. This phase delivers the complete large document editing feature set.

**Reference Files:**

- `/docs/yoopta-editor/large_document_code.md` (lines 46-156) - Full plugin configuration
- `/packages/ui/src/components/typography/*.tsx` - shadcn typography components
- `/packages/ui/src/components/accordion.tsx` - Accordion component
- `/packages/ui/src/components/table.tsx` - Table components

## Overview

**Date:** 2025-11-15
**Description:** Integrate 14 Yoopta plugins with shadcn/ui custom renders
**Priority:** P0 - Core features
**Implementation Status:** Not Started
**Review Status:** Pending

## Key Insights

1. **Plugin Extension Pattern:** Use `Plugin.extend({ renders: {...} })` to replace default renders with shadcn components
2. **Element Props Customization:** Some plugins support `elementProps` for theme integration (e.g., Divider color)
3. **Typography Mapping:** H1, H2, H3, P, Blockquote, Link require shadcn/ui Typography components
4. **Structural Components:** Table, Accordion need full shadcn/ui component mapping (row, cell, item, content)
5. **Media Plugins:** Image, Video, File, Embed require upload handlers (abstracted in Phase 05)
6. **Plugin Grouping:** Organize by category (typography, lists, structural, media, code) for maintainability

## Requirements

### Functional Requirements

- [x] 14 plugin integrations: Paragraph, Headings (3), Blockquote, Link, Lists (3), Accordion, Table, Divider, Callout, Code, Embed, Image, Video, File
- [x] shadcn/ui renders for Typography components
- [x] shadcn/ui renders for Accordion and Table
- [x] Plugin configuration factory functions (getTypographyPlugins, getListPlugins, etc.)
- [x] Placeholder upload handlers for media plugins (replaced in Phase 05)
- [x] Default plugin configuration export

### Non-Functional Requirements

- Design system compliance (TailwindCSS v4 variables)
- Accessibility (ARIA attributes from shadcn components)
- Type-safe plugin configurations
- Tree-shakeable plugin imports
- Vietnamese typography optimization

## Architecture

### Plugin Categories

```typescript
// plugins/index.ts
export { getTypographyPlugins } from './typography.js';
export { getListPlugins } from './lists.js';
export { getStructuralPlugins } from './structural.js';
export { getMediaPlugins } from './media.js';
export { getCodePlugin } from './code.js';
export { getDefaultPlugins } from './default.js';
```

### shadcn/ui Component Mapping

**Typography Plugins → shadcn Components:**

- Paragraph → `<TypographyP>` (from @workspace/ui)
- HeadingOne → `<TypographyH1>`
- HeadingTwo → `<TypographyH2>`
- HeadingThree → `<TypographyH3>`
- Blockquote → `<TypographyBlockquote>`
- Link → `<TypographyLink>`

**Structural Plugins → shadcn Components:**

- Accordion → `<Accordion>`, `<AccordionItem>`, `<AccordionTrigger>`, `<AccordionContent>`
- Table → `<Table>`, `<TableRow>`, `<TableCell>`

**Check @workspace/ui availability:**
If components missing, create in `components/renders/` directory.

### Plugin Configuration Structure

```typescript
// plugins/typography.ts
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import Link from '@yoopta/link';

// Import shadcn components or create custom renders
import { TypographyP } from '../components/renders/typography-p.js';
import { TypographyH1 } from '../components/renders/typography-h1.js';
import { TypographyH2 } from '../components/renders/typography-h2.js';
import { TypographyH3 } from '../components/renders/typography-h3.js';
import { TypographyBlockquote } from '../components/renders/typography-blockquote.js';
import { TypographyLink } from '../components/renders/typography-link.js';

export function getTypographyPlugins() {
  return [
    Paragraph.extend({
      renders: {
        paragraph: TypographyP,
      },
    }),
    HeadingOne.extend({
      renders: {
        'heading-one': TypographyH1,
      },
    }),
    HeadingTwo.extend({
      renders: {
        'heading-two': TypographyH2,
      },
    }),
    HeadingThree.extend({
      renders: {
        'heading-three': TypographyH3,
      },
    }),
    Blockquote.extend({
      renders: {
        blockquote: TypographyBlockquote,
      },
    }),
    Link.extend({
      renders: {
        link: TypographyLink,
      },
    }),
  ];
}
```

### Custom Render Components Pattern

```typescript
// components/renders/typography-p.tsx
import { cn } from '@workspace/ui/lib/utils';
import type { PluginElementRenderProps } from '@yoopta/editor';

export function TypographyP({
  attributes,
  children,
  element,
  HTMLAttributes = {},
}: PluginElementRenderProps) {
  return (
    <p
      {...attributes}
      {...HTMLAttributes}
      className={cn(
        'leading-7 [&:not(:first-child)]:mt-6',
        HTMLAttributes.className
      )}
    >
      {children}
    </p>
  );
}
```

**IMPORTANT:** Check if @workspace/ui already exports Typography components. If yes, use directly:

```typescript
import {
  TypographyP,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyBlockquote,
  TypographyLink,
} from '@workspace/ui/components/typography';
```

If not, create in beqeek-editor package under `components/renders/`.

## Related Code Files

**New Files (Create):**

- `/packages/beqeek-editor/src/plugins/typography.ts`
- `/packages/beqeek-editor/src/plugins/lists.ts`
- `/packages/beqeek-editor/src/plugins/structural.ts`
- `/packages/beqeek-editor/src/plugins/media.ts` (placeholder uploads)
- `/packages/beqeek-editor/src/plugins/code.ts`
- `/packages/beqeek-editor/src/plugins/default.ts` (combines all)
- `/packages/beqeek-editor/src/plugins/index.ts`
- `/packages/beqeek-editor/src/components/renders/typography-*.tsx` (if not in @workspace/ui)
- `/packages/beqeek-editor/src/components/renders/accordion-*.tsx`
- `/packages/beqeek-editor/src/components/renders/table-*.tsx`

**Reference Files:**

- `/docs/yoopta-editor/large_document_code.md`
- `/packages/ui/src/components/typography/` (check availability)
- `/packages/ui/src/components/accordion.tsx`
- `/packages/ui/src/components/table.tsx`

**Update Files:**

- `/packages/beqeek-editor/src/components/index.ts` - Export render components
- `/packages/beqeek-editor/src/plugins/index.ts` - Export plugin factories

## Implementation Steps

### Step 1: Audit @workspace/ui Components

Check which shadcn/ui components are available:

```bash
ls packages/ui/src/components/typography/
ls packages/ui/src/components/ | grep -E 'accordion|table'
```

Determine if Typography components exist. If not, create in beqeek-editor.

### Step 2: Create Typography Render Components

If missing from @workspace/ui, create:

- `components/renders/typography-p.tsx`
- `components/renders/typography-h1.tsx`
- `components/renders/typography-h2.tsx`
- `components/renders/typography-h3.tsx`
- `components/renders/typography-blockquote.tsx`
- `components/renders/typography-link.tsx`

Follow shadcn/ui design tokens:

```tsx
// typography-h1.tsx
export function TypographyH1({ attributes, children, HTMLAttributes = {} }) {
  return (
    <h1
      {...attributes}
      {...HTMLAttributes}
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', HTMLAttributes.className)}
    >
      {children}
    </h1>
  );
}
```

### Step 3: Create Structural Component Renders

**Accordion:**

```tsx
// components/renders/accordion.tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@workspace/ui/components/accordion';

export function AccordionList({ attributes, children, HTMLAttributes }) {
  return (
    <Accordion type="multiple" {...attributes} {...HTMLAttributes}>
      {children}
    </Accordion>
  );
}

export function AccordionListItem({ attributes, children, element, HTMLAttributes }) {
  return (
    <AccordionItem value={element.id} {...attributes} {...HTMLAttributes}>
      {children}
    </AccordionItem>
  );
}

// Similar for AccordionListItemHeading (Trigger), AccordionListItemContent
```

**Table:**

```tsx
// components/renders/table.tsx
import { Table, TableRow, TableCell } from '@workspace/ui/components/table';

export function TableShadcn({ attributes, children, HTMLAttributes }) {
  return (
    <Table {...attributes} {...HTMLAttributes}>
      <tbody>{children}</tbody>
    </Table>
  );
}

export { TableRow, TableCell as TableDataCell };
```

### Step 4: Implement Typography Plugins

```typescript
// plugins/typography.ts
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import Link from '@yoopta/link';
import {
  TypographyP,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyBlockquote,
  TypographyLink,
} from '../components/renders/typography.js';

export function getTypographyPlugins() {
  return [
    Paragraph.extend({ renders: { paragraph: TypographyP } }),
    HeadingOne.extend({ renders: { 'heading-one': TypographyH1 } }),
    HeadingTwo.extend({ renders: { 'heading-two': TypographyH2 } }),
    HeadingThree.extend({ renders: { 'heading-three': TypographyH3 } }),
    Blockquote.extend({ renders: { blockquote: TypographyBlockquote } }),
    Link.extend({ renders: { link: TypographyLink } }),
  ];
}
```

### Step 5: Implement List Plugins

```typescript
// plugins/lists.ts
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';

export function getListPlugins() {
  return [NumberedList, BulletedList, TodoList];
}
```

### Step 6: Implement Structural Plugins

```typescript
// plugins/structural.ts
import Accordion from '@yoopta/accordion';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';
import Callout from '@yoopta/callout';
import {
  AccordionList,
  AccordionListItem,
  AccordionListItemContent,
  AccordionListItemHeading,
} from '../components/renders/accordion.js';
import { TableShadcn, TableRow, TableDataCell } from '../components/renders/table.js';

export function getStructuralPlugins() {
  return [
    Accordion.extend({
      renders: {
        'accordion-list': AccordionList,
        'accordion-list-item': AccordionListItem,
        'accordion-list-item-content': AccordionListItemContent,
        'accordion-list-item-heading': AccordionListItemHeading,
      },
    }),
    Table.extend({
      renders: {
        table: TableShadcn,
        'table-row': TableRow,
        'table-data-cell': TableDataCell,
      },
    }),
    Divider.extend({
      elementProps: {
        divider: (props) => ({
          ...props,
          color: 'hsl(var(--border))', // Design system token
        }),
      },
    }),
    Callout,
  ];
}
```

### Step 7: Implement Code Plugin

```typescript
// plugins/code.ts
import Code from '@yoopta/code';

export function getCodePlugin() {
  return Code;
}
```

### Step 8: Implement Media Plugins (Placeholder)

```typescript
// plugins/media.ts
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';

// Placeholder upload handler (Phase 05 will abstract this)
const placeholderUpload = async (file: File) => {
  console.warn('Media upload not configured. Implement in Phase 05.');
  return {
    src: URL.createObjectURL(file),
    alt: file.name,
  };
};

export function getMediaPlugins() {
  return [
    Embed,
    Image.extend({
      options: {
        onUpload: placeholderUpload,
      },
    }),
    Video.extend({
      options: {
        onUpload: placeholderUpload,
        onUploadPoster: placeholderUpload,
      },
    }),
    File.extend({
      options: {
        onUpload: async (file: File) => {
          const src = URL.createObjectURL(file);
          return {
            src,
            format: file.type.split('/')[1] || 'file',
            name: file.name,
            size: file.size,
          };
        },
      },
    }),
  ];
}
```

### Step 9: Create Default Plugin Configuration

```typescript
// plugins/default.ts
import { getTypographyPlugins } from './typography.js';
import { getListPlugins } from './lists.js';
import { getStructuralPlugins } from './structural.js';
import { getMediaPlugins } from './media.js';
import { getCodePlugin } from './code.js';

export function getDefaultPlugins() {
  return [
    ...getTypographyPlugins(),
    ...getListPlugins(),
    ...getStructuralPlugins(),
    getCodePlugin(),
    ...getMediaPlugins(),
  ];
}
```

### Step 10: Update Component Exports

```typescript
// components/index.ts
export { BeqeekEditor } from './editor/beqeek-editor.js';
export * from './renders/typography.js';
export * from './renders/accordion.js';
export * from './renders/table.js';
```

### Step 11: Update Plugin Exports

```typescript
// plugins/index.ts
export { getTypographyPlugins } from './typography.js';
export { getListPlugins } from './lists.js';
export { getStructuralPlugins } from './structural.js';
export { getMediaPlugins } from './media.js';
export { getCodePlugin } from './code.js';
export { getDefaultPlugins } from './default.js';
```

### Step 12: Update README Usage Example

```markdown
## Usage with Default Plugins

import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import { getDefaultPlugins } from '@workspace/beqeek-editor/plugins';
import { useMemo } from 'react';

function MyDocument() {
const editor = useMemo(() => createBeqeekEditor(), []);
const plugins = useMemo(() => getDefaultPlugins(), []);

return (
<BeqeekEditor
      editor={editor}
      plugins={plugins}
      autoFocus
    />
);
}
```

### Step 13: Validate Build and Functionality

```bash
pnpm --filter @workspace/beqeek-editor build
pnpm --filter @workspace/beqeek-editor check-types
```

Test in apps/web with all plugins:

```tsx
import { BeqeekEditor, createBeqeekEditor } from '@workspace/beqeek-editor';
import { getDefaultPlugins } from '@workspace/beqeek-editor/plugins';
import { useMemo } from 'react';

export function TestAllPlugins() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const plugins = useMemo(() => getDefaultPlugins(), []);

  return (
    <div className="p-8">
      <BeqeekEditor editor={editor} plugins={plugins} />
    </div>
  );
}
```

Verify each plugin type:

- Typography: Type headings, paragraphs, blockquotes
- Lists: Create numbered, bulleted, todo lists
- Structural: Add tables, accordions, dividers
- Code: Insert code blocks
- Media: Test image/video/file upload (placeholder)

## Todo

- [ ] Audit @workspace/ui for existing Typography components
- [ ] Create Typography render components (if missing)
- [ ] Create Accordion render components
- [ ] Create Table render components
- [ ] Implement getTypographyPlugins()
- [ ] Implement getListPlugins()
- [ ] Implement getStructuralPlugins()
- [ ] Implement getCodePlugin()
- [ ] Implement getMediaPlugins() with placeholder uploads
- [ ] Implement getDefaultPlugins()
- [ ] Update component and plugin barrel exports
- [ ] Add usage example to README
- [ ] Build and validate types
- [ ] Test all 14 plugins in apps/web
- [ ] Verify design system compliance (colors, spacing, typography)

## Success Criteria

- [x] All 14 Yoopta plugins integrated and functional
- [x] shadcn/ui components used for Typography, Accordion, Table
- [x] Design system tokens (CSS variables) used throughout
- [x] Plugin factory functions exported and documented
- [x] getDefaultPlugins() returns all plugins configured
- [x] TypeScript strict mode with zero errors
- [x] Test page renders all plugin types without errors
- [x] Vietnamese typography optimized (font-family, line-height)
- [x] Accessibility maintained (ARIA from shadcn components)

## Risk Assessment

**Medium Risk: shadcn/ui Component Availability**

- Typography components may not exist in @workspace/ui
- **Mitigation:** Create in beqeek-editor package if missing, propose upstream to @workspace/ui later

**Low Risk: Plugin Render Prop Mismatches**

- Yoopta plugin renders have specific prop interfaces
- **Mitigation:** Use `PluginElementRenderProps` type, spread attributes carefully

**Low Risk: Design Token Mapping**

- Divider color needs HSL variable format
- **Mitigation:** Use `hsl(var(--border))` pattern from design system

**Negligible Risk: Plugin Import Order**

- Plugin order matters for UX (Paragraph first, etc.)
- **Mitigation:** Follow reference implementation order

## Security Considerations

- **XSS Protection:** Yoopta sanitizes user input internally
- **Link Validation:** Link plugin should validate URLs (default behavior)
- **File Upload:** Placeholder in this phase, proper validation in Phase 05
- **Code Block:** Code plugin escapes content by default

## Unresolved Questions

1. Does @workspace/ui export TypographyP, TypographyH1, etc.? (Check in Step 1)
2. Should Typography components be added to @workspace/ui for shared use? (Consider post-implementation)
3. Do we need HeadingFour, HeadingFive, HeadingSix? (Not in reference implementation, defer)

## Next Steps

1. Complete all implementation steps
2. Validate all 14 plugins functional
3. Commit with message: `feat(beqeek-editor): integrate 14 Yoopta plugins with shadcn/ui renders`
4. Proceed to **Phase 04: Tools & Marks Setup** for editing toolbar/menu
