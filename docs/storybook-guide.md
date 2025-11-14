# Storybook Guide

## Overview

Storybook đã được setup cho project để document và test các UI components một cách interactive.

## Running Storybook

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook for production
pnpm build-storybook
```

Storybook sẽ chạy tại: **http://localhost:6006/**

## Current Stories

### Fields Components

#### MultiSelectField

Location: `packages/active-tables-core/src/components/fields/__stories__/MultiSelectField.stories.tsx`

**Stories:**

- **Basic**: Multi-select field cơ bản với các options đơn giản
- **WithColors**: Multi-select với color swatches (đỏ, vàng, xanh lá, xanh dương, tím)
- **DisplayMode**: Hiển thị selected items dưới dạng badges
- **Empty**: Empty state với placeholder
- **Disabled**: Trạng thái disabled
- **WithError**: Validation error state
- **ManyOptions**: Danh sách dài (scrollable)

**Features highlighted:**

- ✅ Checkboxes for multi-selection (no radio buttons)
- ✅ Selected items as removable badges
- ✅ Color swatches for color options
- ✅ Keyboard navigation
- ✅ Accessible with ARIA labels

#### CheckboxListField

Location: `packages/active-tables-core/src/components/fields/__stories__/CheckboxListField.stories.tsx`

**Stories:**

- **Basic**: Checkbox list cơ bản (checklist đơn giản)
- **WithColors**: Checkboxes với color indicators
- **DisplayMode**: Display selected items as badges
- **Empty**: No selection state
- **Disabled**: Disabled state
- **WithError**: Validation error
- **LongList**: Danh sách dài permissions
- **TaskChecklist**: Deployment checklist example

**Features highlighted:**

- ✅ All options visible (no dropdown)
- ✅ Clear visual state
- ✅ Color indicators for colored options
- ✅ Best for 3-10 options
- ✅ Accessible labels

## Creating New Stories

### Story File Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '../your-component';

const meta = {
  title: 'Category/ComponentName',
  component: YourComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Component description here',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for props
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    // Default props
  },
};
```

### Best Practices

1. **Use TypeScript**: All stories should use `.stories.tsx` extension
2. **Document variants**: Create stories for different states (empty, error, disabled, etc.)
3. **Interactive examples**: Use state management wrapper for interactive components
4. **Accessibility**: Test keyboard navigation and screen reader support
5. **Responsive**: Test different viewport sizes using Storybook viewport addon

### Story Naming Convention

- File: `ComponentName.stories.tsx`
- Location: `packages/{package}/src/components/**/__stories__/`
- Title format: `Category/ComponentName`

## Adding Stories for More Components

To add stories for remaining field components:

### Text Fields

- `TextField.stories.tsx` - SHORT_TEXT, EMAIL, URL
- `TextareaField.stories.tsx` - TEXT
- `RichTextField.stories.tsx` - RICH_TEXT with Lexical editor

### Number Fields

- `NumberField.stories.tsx` - INTEGER, NUMERIC with Vietnamese formatting
- `TimeComponentField.stories.tsx` - YEAR, MONTH, DAY, HOUR, MINUTE, SECOND

### Date/Time Fields

- `DateField.stories.tsx` - DATE with dd/MM/yyyy format
- `DateTimeField.stories.tsx` - DATETIME
- `TimeField.stories.tsx` - TIME

### Selection Fields

- `SelectField.stories.tsx` - SELECT_ONE, CHECKBOX_ONE
- `CheckboxField.stories.tsx` - CHECKBOX_YES_NO

### Reference Fields

- `ReferenceField.stories.tsx` - SELECT_ONE/LIST_RECORD
- `UserField.stories.tsx` - SELECT_ONE/LIST_WORKSPACE_USER

## Configuration

### Storybook Config

- Main config: `.storybook/main.ts`
- Preview config: `.storybook/preview.ts`

### Aliases

Configured in `.storybook/main.ts`:

- `@workspace/ui` → `packages/ui/src`
- `@workspace/active-tables-core` → `packages/active-tables-core/src`
- `@workspace/beqeek-shared` → `packages/beqeek-shared/src`
- `@workspace/encryption-core` → `packages/encryption-core/src`

## Troubleshooting

### Duplicate Stories Warning

If you see warnings about duplicate stories, make sure:

1. Stories are only in `src/**` folders (not in `dist/`)
2. Build artifacts are in `.gitignore`
3. Storybook pattern excludes `dist/` folders

### Import Errors

If components fail to import:

1. Check alias configuration in `.storybook/main.ts`
2. Verify package build: `pnpm --filter @workspace/package-name build`
3. Check tsconfig paths

### Styling Issues

If styles don't load:

1. Verify CSS import in `.storybook/preview.ts`
2. Check TailwindCSS v4 configuration
3. Ensure design tokens are available

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [React Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Args & ArgTypes](https://storybook.js.org/docs/react/api/argtypes)
- [Addon Essentials](https://storybook.js.org/docs/react/essentials/introduction)

## Next Steps

1. Add stories for remaining field components
2. Add interaction tests using `@storybook/test`
3. Setup visual regression testing
4. Deploy Storybook to static hosting (Chromatic, Netlify, etc.)
5. Add accessibility testing addon
