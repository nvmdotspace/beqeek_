# Active Tables - UI Draft & Component Specifications

## 📋 Tổng quan
Tài liệu này mô tả chi tiết UI design và component specifications cho feature Active Tables đã được triển khai.

## 🎨 Design System Foundation

### Color Palette
```css
/* Primary Colors */
--primary: 220 14% 96%;
--primary-foreground: 220 9% 46%;

/* Secondary Colors */
--secondary: 220 14% 96%;
--secondary-foreground: 220 9% 46%;

/* Accent Colors */
--accent: 220 14% 96%;
--accent-foreground: 220 9% 46%;

/* Status Colors */
--destructive: 0 84% 60%;
--destructive-foreground: 210 20% 98%;
--success: 142 76% 36%;
--warning: 38 92% 50%;

/* Neutral Colors */
--background: 0 0% 100%;
--foreground: 220 9% 9%;
--muted: 220 14% 96%;
--muted-foreground: 220 9% 46%;
--border: 220 13% 91%;
```

### Typography Scale
```css
/* Headings */
.text-3xl { font-size: 1.875rem; font-weight: 700; } /* Page titles */
.text-xl { font-size: 1.25rem; font-weight: 600; }   /* Section titles */
.text-lg { font-size: 1.125rem; font-weight: 500; }  /* Card titles */

/* Body Text */
.text-sm { font-size: 0.875rem; font-weight: 400; }  /* Body text */
.text-xs { font-size: 0.75rem; font-weight: 400; }   /* Metadata */
```

### Spacing System
```css
/* Base unit: 8px */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
```

## 📱 Page Layouts

### 1. Active Tables List Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header Section                                              │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Page Title      │ │ Search Input    │ │ Create Button   │ │
│ │ + Subtitle      │ │ + Workspace     │ │ + Refresh       │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Filters Section                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Total Tables    │ │ Work Groups     │ │ Filter Buttons  │ │
│ │ Badge           │ │ Badge           │ │ (All, Group1..) │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Content Grid (Responsive)                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ Table Card  │ │ Table Card  │ │ Table Card  │             │
│ │ - Name      │ │ - Name      │ │ - Name      │             │
│ │ - Fields    │ │ - Fields    │ │ - Fields    │             │
│ │ - Encryption│ │ - Encryption│ │ - Encryption│             │
│ │ - Actions   │ │ - Actions   │ │ - Actions   │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

#### Component Specifications

**ActiveTableCard**
```typescript
interface ActiveTableCardProps {
  table: ActiveTable;
  onOpen?: (table: ActiveTable) => void;
  onEdit?: (table: ActiveTable) => void;
  onDelete?: (table: ActiveTable) => void;
}
```

**Visual Design:**
- Card elevation: `shadow-sm`
- Border radius: `rounded-xl`
- Padding: `p-6`
- Hover effect: `hover:shadow-md transition-shadow`

**Content Layout:**
```
┌─────────────────────────────────────────┐
│ Header                                  │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Table Name      │ │ Status Badge    │ │
│ │ (text-xl)       │ │ (E2EE/Server)   │ │
│ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────┤
│ Description                             │
│ (text-sm text-muted-foreground)         │
├─────────────────────────────────────────┤
│ Metadata                                │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Field Count     │ │ Field Types     │ │
│ │ Badge           │ │ Badges (3 max)  │ │
│ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────┤
│ Footer                                  │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Updated Time    │ │ Actions Menu    │ │
│ │ (text-xs)       │ │ + View Button   │ │
│ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Table Management Dialog

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Dialog Header                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Title: "Create New Table" / "Edit Table"                │ │
│ │ Description: Setup instructions                         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Form Content (Scrollable)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Basic Information Card                                  │ │
│ │ ├─ Table Name (required)                               │ │
│ │ ├─ Description (optional)                              │ │
│ │ ├─ Work Group (dropdown)                               │ │
│ │ └─ Table Type (dropdown)                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Security Settings Card                                  │ │
│ │ ├─ E2EE Toggle Switch                                  │ │
│ │ └─ Encryption Key (password input)                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Fields Configuration Card                               │ │
│ │ ├─ Add Field Button                                    │ │
│ │ └─ Field List                                          │ │
│ │    ├─ Field Editor (collapsed)                         │ │
│ │    ├─ Field Editor (expanded)                          │ │
│ │    └─ ...                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Dialog Footer                                               │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Cancel Button   │ │ Save Button (loading state)        │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Field Editor Component
```
Collapsed State:
┌─────────────────────────────────────────────────────────────┐
│ ┌─┐ Field Name (Type) [Required Badge] ┌─────────────────┐   │
│ │≡│                                    │ ↑ ↓ ⚙ 🗑        │   │
│ └─┘                                    └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Expanded State:
┌─────────────────────────────────────────────────────────────┐
│ Field Configuration                                         │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Field Label *   │ │ Field Name *                        │ │
│ │ [Text Input]    │ │ [Text Input] (auto-generated)       │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Field Type      │ │ Placeholder                         │ │
│ │ [Dropdown]      │ │ [Text Input]                        │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☐ Required field                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Cancel          │ │ Save Field                          │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Table Detail Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header Section                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Breadcrumb: Back to list + Work Group Badge            │ │
│ │ Table Name (text-3xl)                                  │ │
│ │ Description (text-sm muted)                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Metadata Badges                                         │ │
│ │ [E2EE] [Type: Standard] [5 fields] [View Records]      │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Content Sections                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Encryption & Security Card                              │ │
│ │ ├─ Description                                          │ │
│ │ └─ Security features list                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Field Definitions Section                               │ │
│ │ ├─ Section Title + Field Count Badge                   │ │
│ │ └─ Fields Grid (2 columns on desktop)                  │ │
│ │    ├─ Field Summary Card                               │ │
│ │    ├─ Field Summary Card                               │ │
│ │    └─ ...                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Field Summary Card
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │ Field Label (text-sm font-bold) │ │ Type Badge          │ │
│ │ field_name (text-xs muted)      │ │ (uppercase)         │ │
│ └─────────────────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Properties                                                  │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Required Badge  │ │ Options Badge (if applicable)       │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Placeholder Text (if exists)                               │
│ (text-sm muted)                                             │
├─────────────────────────────────────────────────────────────┤
│ Options Preview (if SELECT type)                           │
│ [Option 1] [Option 2] [Option 3] [+3 more]                 │
└─────────────────────────────────────────────────────────────┘
```

### 4. Records Management Page

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header Section                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Breadcrumb: Back to detail + Records Badge             │ │
│ │ Table Name (text-3xl)                                  │ │
│ │ Field Count + Encryption Status                        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Records Card                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Card Header                                             │ │
│ │ ├─ Title: "Record viewer"                              │ │
│ │ ├─ Description                                          │ │
│ │ └─ Actions: [Search] [Refresh] [Create Record]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Records Table (Responsive)                              │ │
│ │ ┌─────┬─────────┬─────────┬─────────┬─────────┬───────┐ │ │
│ │ │ ID  │ Field 1 │ Field 2 │ Field 3 │ Updated │ ⋮     │ │ │
│ │ ├─────┼─────────┼─────────┼─────────┼─────────┼───────┤ │ │
│ │ │ 001 │ Value 1 │ Value 2 │ Value 3 │ 2h ago  │ Menu  │ │ │
│ │ │ 002 │ Value 1 │ Value 2 │ Value 3 │ 3h ago  │ Menu  │ │ │
│ │ └─────┴─────────┴─────────┴─────────┴─────────┴───────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Pagination                                              │ │
│ │ Page 1 · 25 rows        [Previous] [Next]              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5. Record Management Dialog

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Dialog Header                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Title: "Create New Record" / "Edit Record"              │ │
│ │ Description: Table context                              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Form Content (Scrollable)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Record Data Card                                        │ │
│ │ ├─ Dynamic Field Inputs (based on table schema)        │ │
│ │ │  ├─ Text Input (SHORT_TEXT, EMAIL, etc.)             │ │
│ │ │  ├─ Textarea (RICH_TEXT)                              │ │
│ │ │  ├─ Number Input (INTEGER, NUMERIC)                   │ │
│ │ │  ├─ Date/DateTime Picker                              │ │
│ │ │  ├─ Switch (BOOLEAN)                                  │ │
│ │ │  └─ Select Dropdown (SELECT_ONE)                      │ │
│ │ └─ Field Validation Messages                            │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Dialog Footer                                               │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Cancel Button   │ │ Save Button (loading state)        │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Interactive Elements

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

/* Secondary Button */
.btn-secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
}

/* Destructive Button */
.btn-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}
```

### Form Elements
```css
/* Input Fields */
.input {
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--background);
}

/* Select Dropdowns */
.select-trigger {
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Switch Component */
.switch {
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.2s;
}
```

### Cards & Containers
```css
/* Card Component */
.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Dialog Overlay */
.dialog-overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 50;
}

/* Dialog Content */
.dialog-content {
  background: var(--background);
  border-radius: 0.75rem;
  max-width: 42rem;
  max-height: 90vh;
  overflow-y: auto;
}
```

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stacked form fields
- Bottom sheet dialogs
- Touch-friendly buttons (min 44px)
- Simplified navigation

### Tablet (768px - 1024px)
- Two column grid
- Overlay dialogs
- Condensed spacing
- Touch optimizations

### Desktop (> 1024px)
- Three column grid
- Full feature set
- Hover interactions
- Keyboard shortcuts

## 🔧 Component States

### Loading States
- Skeleton loaders for cards
- Button loading spinners
- Progressive content loading
- Shimmer effects

### Error States
- Inline field validation
- Toast notifications
- Error boundaries
- Retry mechanisms

### Empty States
- Illustration + message
- Call-to-action buttons
- Helpful guidance
- Progressive disclosure

## 🎨 Animation & Transitions

### Micro-interactions
```css
/* Hover Effects */
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

/* Button Press */
.button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Dialog Animations */
.dialog-enter {
  opacity: 0;
  transform: scale(0.95);
}

.dialog-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 0.2s ease;
}
```

## 📊 Performance Considerations

### Optimization Strategies
- Lazy loading for large lists
- Virtual scrolling for tables
- Image optimization
- Code splitting
- Bundle size monitoring

### Accessibility Features
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels

---

## 🎯 Implementation Status

### ✅ Completed Components
- ActiveTablesPage
- ActiveTableCard
- TableManagementDialog
- ActiveTableDetailPage
- ActiveTableRecordsPage
- RecordManagementDialog
- FieldEditor
- RecordsTable

### 🔄 In Progress
- Comments system UI
- Custom actions UI
- Advanced filtering

### ⏳ Planned
- Kanban view
- Gantt chart view
- Dashboard widgets
- Mobile app optimization

---

Tài liệu này sẽ được cập nhật liên tục khi có thêm features và improvements được triển khai.
