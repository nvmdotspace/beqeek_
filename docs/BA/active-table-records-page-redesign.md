# Active Table Records Page - UI/UX Redesign

## Document Information

- **Project**: BEQEEK - Active Tables Records Page
- **Version**: 1.0
- **Date**: November 10, 2025
- **Author**: UI/UX Design Team

---

## 1. EXECUTIVE SUMMARY

### 1.1. Current Issues Identified

Based on analysis of the current implementation and business requirements:

1. **Missing Quick Filters**: No UI implementation despite being in functional spec (Section 2.6)
2. **Single Kanban View**: Only displays first Kanban config; system supports multiple views per table
3. **Incorrect Drag-Drop**: Current Kanban allows in-column reordering (wrong) - should only allow cross-column moves
4. **No Multi-View Selector**: No UI to switch between multiple Kanban/Gantt configurations
5. **Mobile UX Issues**: Limited responsive design optimization for Quick Filters and view selectors

### 1.2. Design Goals

- **Implement Quick Filters** as prominent, accessible controls for choice-based fields
- **Add View Selectors** for switching between multiple Kanban/Gantt configurations
- **Fix Kanban Drag-Drop** to prevent in-column reordering, only allow cross-column moves
- **Mobile-First Responsive** design with progressive enhancement
- **WCAG 2.1 AA Compliance** for all interactive elements
- **Design Token Usage** for consistent theming and dark mode support

---

## 2. CURRENT IMPLEMENTATION ANALYSIS

### 2.1. File Structure

**Main Page Component**:

- `/apps/web/src/features/active-tables/pages/active-table-records-page.tsx`
  - 473 lines, handles all view modes (List, Kanban, Gantt)
  - Uses TanStack Router for navigation
  - Implements infinite scroll for List view
  - Single Kanban config accessed via `displayTable.config?.kanbanConfigs?.[0]`
  - Single Gantt config accessed via `displayTable.config?.ganttCharts?.[0]`

**Kanban Implementation**:

- `/packages/active-tables-core/src/components/kanban/kanban-board.tsx`
  - 425 lines, uses `@dnd-kit/core` and shadcn/ui Kanban components
  - Implements column collapse/expand
  - Handles drag-and-drop with optimistic updates
  - Currently allows in-column reordering (ISSUE)

**State Management**:

- Local state: `searchQuery`, `isCreateDialogOpen`, view mode from URL
- React Query: table config, infinite records with encryption
- No Quick Filter state currently implemented

### 2.2. Valid Quick Filter Field Types

Per `packages/beqeek-shared/src/constants/field-types.ts`:

```typescript
QUICK_FILTER_VALID_FIELD_TYPES = [
  'CHECKBOX_YES_NO',
  'SELECT_ONE',
  'SELECT_LIST',
  'SELECT_ONE_RECORD',
  'SELECT_ONE_WORKSPACE_USER',
  'SELECT_LIST_WORKSPACE_USER',
];
```

### 2.3. Design Tokens Available

From `packages/ui/src/styles/globals.css`:

- **Colors**: `--background`, `--foreground`, `--border`, `--input`, `--ring`, `--muted`, `--accent`, `--destructive`
- **Spacing**: Uses CSS variables with `--radius` system
- **Dark Mode**: Full support via `.dark` class
- **Responsive**: Mobile utilities with `hide-scrollbar-mobile`

---

## 3. INFORMATION ARCHITECTURE

### 3.1. Page Structure Hierarchy

```
Active Table Records Page
├── Header Section
│   ├── Back Button
│   ├── Table Name & Description
│   └── Metadata Badges (E2EE, Record Count)
│
├── View Mode Tabs (List | Kanban | Gantt)
│   ├── Tab Navigation
│   └── View Selector Dropdown (when multiple configs exist)
│
├── Quick Filter Bar (sticky)
│   ├── Filter Chips (for each quick filter field)
│   ├── Clear All Filters
│   └── Active Filter Count Badge
│
├── Actions Bar (contextual per view)
│   ├── Search Input (List view only)
│   ├── Advanced Filter Button (List view only)
│   └── New Record Button (all views)
│
└── Content Area (view-specific)
    ├── List View (RecordList + Infinite Scroll)
    ├── Kanban View (KanbanBoard with columns)
    └── Gantt View (GanttChartView with timeline)
```

### 3.2. Navigation Flow

```
Records Page
    ↓
View Mode Selection (Tabs)
    ↓
View Config Selection (Dropdown, if multiple)
    ↓
Quick Filters (Optional)
    ↓
Content Display
    ↓
Record Detail (on click)
```

---

## 4. QUICK FILTERS DESIGN

### 4.1. Requirements

From functional spec Section 2.6:

- Display filter controls for specific fields at top of records list
- Only valid for choice-based fields (6 types listed above)
- Should be "pinned" prominently without requiring advanced filter panel
- Multi-select support for `SELECT_LIST*` fields
- Single-select for `SELECT_ONE*` and `CHECKBOX_YES_NO`

### 4.2. Visual Design

**Desktop Layout** (>1024px):

```
┌─────────────────────────────────────────────────────────────────┐
│ Quick Filters                                     Clear All (3) │
├─────────────────────────────────────────────────────────────────┤
│ [Assignee ▼] [Status ▼] [Matrix Quadrant ▼] [Related Users ▼] │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile Layout** (<768px):

```
┌────────────────────────────────┐
│ Quick Filters     Clear All (3)│
├────────────────────────────────┤
│ [Assignee ▼]         [Status ▼]│
│ [Matrix Quadrant ▼]             │
│ [Related Users ▼]               │
└────────────────────────────────┘
```

### 4.3. Component Structure

```tsx
// New component: QuickFilterBar
<Card className="sticky top-0 z-10 border-x-0 rounded-none">
  <CardContent className="p-3 sm:p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-foreground">Quick Filters</h3>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear All ({activeFilterCount})
        </Button>
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      {quickFilterConfigs.map((filterConfig) => (
        <QuickFilterControl
          key={filterConfig.fieldName}
          field={field}
          value={filterState[filterConfig.fieldName]}
          onChange={(value) => handleFilterChange(filterConfig.fieldName, value)}
        />
      ))}
    </div>
  </CardContent>
</Card>
```

### 4.4. Filter Control Types

**For Single-Select Fields** (`SELECT_ONE`, `SELECT_ONE_RECORD`, `SELECT_ONE_WORKSPACE_USER`, `CHECKBOX_YES_NO`):

```tsx
// Use shadcn Select component
<Select value={value} onValueChange={onChange}>
  <SelectTrigger className="h-9 min-w-[140px] max-w-[200px]">
    <SelectValue placeholder={field.label} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="__all__">All {field.label}</SelectItem>
    {options.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.text}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**For Multi-Select Fields** (`SELECT_LIST`, `SELECT_LIST_WORKSPACE_USER`):

```tsx
// Use shadcn MultiSelect or Popover with Checkboxes
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className="h-9 min-w-[140px] justify-between">
      <span className="truncate">{selectedCount === 0 ? field.label : `${field.label} (${selectedCount})`}</span>
      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[200px] p-0">
    <Command>
      <CommandInput placeholder={`Search ${field.label}...`} />
      <CommandList>
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem key={option.value} onSelect={() => toggleOption(option.value)}>
              <Checkbox checked={selectedValues.includes(option.value)} className="mr-2" />
              {option.text}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### 4.5. Filter State Management

```tsx
// Add to active-table-records-page.tsx

interface QuickFilters {
  [fieldName: string]: string | string[] | null;
}

const [quickFilters, setQuickFilters] = useState<QuickFilters>({});

// Calculate active filter count
const activeFilterCount = useMemo(() => {
  return Object.values(quickFilters).filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== '__all__';
  }).length;
}, [quickFilters]);

// Apply filters to records
const filteredRecords = useMemo(() => {
  let filtered = displayRecords;

  // Apply search query
  if (searchQuery.trim()) {
    // ... existing search logic
  }

  // Apply quick filters
  Object.entries(quickFilters).forEach(([fieldName, value]) => {
    if (!value || value === '__all__') return;

    if (Array.isArray(value) && value.length > 0) {
      // Multi-select: record must have at least one matching value
      filtered = filtered.filter((record) => {
        const recordValue = record.record[fieldName];
        if (Array.isArray(recordValue)) {
          return recordValue.some((v) => value.includes(v));
        }
        return value.includes(recordValue);
      });
    } else {
      // Single-select: exact match
      filtered = filtered.filter((record) => {
        return record.record[fieldName] === value;
      });
    }
  });

  return filtered;
}, [displayRecords, searchQuery, quickFilters]);
```

### 4.6. Accessibility Features

- **ARIA Labels**: Each filter control has `aria-label` with field name
- **Keyboard Navigation**: Full keyboard support via shadcn Select/Command components
- **Screen Reader**: Announce active filter count with `aria-live="polite"`
- **Focus Management**: Clear All button receives focus after filter selection
- **High Contrast**: Design tokens ensure WCAG AA contrast ratios

---

## 5. MULTI-VIEW SELECTOR DESIGN

### 5.1. Requirements

From Kanban BA Document (Section 5.4):

- Active Table can have **multiple** Kanban configs (different statusField groupings)
- Active Table can have **multiple** Gantt configs (different timeline views)
- View selector needed to switch between configs
- Last selected view should persist in localStorage

### 5.2. Visual Design

**When Single Config Exists** (Current):

```
┌─────────────────────────────────────┐
│ [List] [Kanban] [Gantt]             │
└─────────────────────────────────────┘
```

**When Multiple Configs Exist** (NEW):

```
┌────────────────────────────────────────────────────────┐
│ [List] [Kanban ▼] [Gantt ▼]                           │
│                                                        │
│ Kanban Dropdown:                                      │
│   • Ma trận Eisenhower (current)                     │
│   • Trạng thái                                        │
│   • Tình trạng công việc                             │
│   • Kế hoạch triển khai                              │
└────────────────────────────────────────────────────────┘
```

### 5.3. Component Structure

```tsx
// New component: ViewModeSelector.tsx

interface ViewModeSelectorProps {
  currentView: ViewMode;
  kanbanConfigs: KanbanConfig[];
  ganttConfigs: GanttConfig[];
  currentKanbanId?: string;
  currentGanttId?: string;
  onViewChange: (view: ViewMode) => void;
  onKanbanViewChange: (configId: string) => void;
  onGanttViewChange: (configId: string) => void;
}

export function ViewModeSelector({
  currentView,
  kanbanConfigs,
  ganttConfigs,
  currentKanbanId,
  currentGanttId,
  onViewChange,
  onKanbanViewChange,
  onGanttViewChange,
}: ViewModeSelectorProps) {
  const hasMultipleKanbans = kanbanConfigs.length > 1;
  const hasMultipleGantts = ganttConfigs.length > 1;

  return (
    <div className="flex items-center gap-1">
      {/* List Tab */}
      <TabsTrigger value="list">
        <List className="h-4 w-4 mr-2" />
        List
      </TabsTrigger>

      {/* Kanban Tab with Dropdown */}
      {kanbanConfigs.length > 0 && (
        <div className="flex items-center">
          <TabsTrigger value="kanban">
            <KanbanSquare className="h-4 w-4 mr-2" />
            Kanban
          </TabsTrigger>

          {hasMultipleKanbans && currentView === 'kanban' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 ml-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Kanban Views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {kanbanConfigs.map(config => (
                  <DropdownMenuItem
                    key={config.kanbanScreenId}
                    onClick={() => onKanbanViewChange(config.kanbanScreenId)}
                    className={cn(
                      currentKanbanId === config.kanbanScreenId &&
                      "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentKanbanId === config.kanbanScreenId
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{config.screenName}</div>
                      {config.screenDescription && (
                        <div className="text-xs text-muted-foreground">
                          {config.screenDescription}
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Gantt Tab with Dropdown */}
      {ganttConfigs.length > 0 && (
        <div className="flex items-center">
          <TabsTrigger value="gantt">
            <GanttChart className="h-4 w-4 mr-2" />
            Gantt
          </TabsTrigger>

          {hasMultipleGantts && currentView === 'gantt' && (
            // Similar dropdown structure as Kanban
          )}
        </div>
      )}
    </div>
  );
}
```

### 5.4. URL State Management

```tsx
// Update searchParams structure in active-table-records-page.tsx

interface RecordsSearchParams {
  view?: 'list' | 'kanban' | 'gantt';
  kanbanView?: string; // kanbanScreenId
  ganttView?: string; // ganttScreenId
  // ... existing search, filters
}

// Navigation with view config
navigate({
  to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
  params: { locale, workspaceId, tableId },
  search: {
    ...searchParams,
    view: 'kanban',
    kanbanView: selectedKanbanId,
  },
});
```

### 5.5. LocalStorage Persistence

```tsx
// New hook: useViewPreferences.ts

interface ViewPreferences {
  [tableId: string]: {
    viewMode: ViewMode;
    kanbanViewId?: string;
    ganttViewId?: string;
    lastUpdated: number;
  };
}

export function useViewPreferences(tableId: string) {
  const storageKey = 'beqeek_table_view_preferences';

  const getPreferences = (): ViewPreferences => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return {};
    return JSON.parse(stored);
  };

  const saveViewMode = (viewMode: ViewMode, kanbanViewId?: string, ganttViewId?: string) => {
    const prefs = getPreferences();
    prefs[tableId] = {
      viewMode,
      kanbanViewId,
      ganttViewId,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(prefs));
  };

  const loadPreferences = () => {
    const prefs = getPreferences();
    return prefs[tableId] || null;
  };

  return { saveViewMode, loadPreferences };
}
```

---

## 6. KANBAN DRAG-DROP FIX

### 6.1. Current Issue

From analysis of `/packages/active-tables-core/src/components/kanban/kanban-board.tsx`:

- Uses `@dnd-kit/core` with `KanbanProvider` from shadcn/ui
- `handleDragEnd` correctly detects column changes
- **ISSUE**: `KanbanProvider` and `KanbanCards` allow in-column reordering by default

### 6.2. Requirements from BA Document

**BR-KB-037 to BR-KB-040**:

- Drag & drop should **ONLY** change statusField value
- Cards can only move **BETWEEN** columns
- Cards **always** insert at **bottom** of target column
- No in-column reordering allowed
- Animation smooth when moving card
- If update fails, card reverts to original position

### 6.3. Proposed Solution

**Option A: Disable In-Column Sorting** (Recommended)

```tsx
// Modify KanbanProvider usage in kanban-board.tsx

<KanbanProvider
  columns={columns}
  data={boardData}
  onDataChange={handleDataChange}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  strategy="cross-column-only" // NEW PROP (need to add to KanbanProvider)
  className="flex gap-3"
>
```

**Option B: Validate and Revert In-Column Moves**

```tsx
// Add validation in handleDragEnd

const handleDragEnd = useCallback(
  (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onRecordMove || readOnly) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Get snapshot
    const snapshotItem = dragStartSnapshotRef.current[activeId];
    if (!snapshotItem) return;

    // Determine target column
    const isDroppedOnColumn = columns.some((col) => col.id === overId);
    let targetColumn: string;

    if (isDroppedOnColumn) {
      targetColumn = overId;
    } else {
      const overItem = kanbanItems.find((item) => item.id === overId);
      if (overItem) {
        targetColumn = String(overItem.column);
      } else {
        return;
      }
    }

    const oldColumn = String(snapshotItem.column);

    // NEW: Check if same column
    if (oldColumn === targetColumn) {
      console.log('[Kanban] In-column move blocked - reverting');

      // Revert to original position
      setBoardData(kanbanItems.map((item) => ({ ...item })));

      // Show toast notification
      toast.info('Cards can only be moved between columns', {
        description: 'Reordering within a column is not supported',
      });

      return;
    }

    // Column changed - proceed with API call
    console.log(`[Kanban] Column change: ${activeId} from "${oldColumn}" to "${targetColumn}"`);
    onRecordMove(activeId, targetColumn);
  },
  [kanbanItems, columns, onRecordMove, readOnly],
);
```

**Option C: Custom DnD Implementation**

```tsx
// Replace shadcn KanbanProvider with custom @dnd-kit implementation
// Only allow droppable zones on column headers, not on cards

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {columns.map((column) => (
    <div key={column.id}>
      {/* Droppable zone on column */}
      <Droppable id={column.id} disabled={readOnly}>
        <ColumnHeader {...column} />
      </Droppable>

      {/* Cards are draggable but NOT droppable */}
      <div className="cards-container">
        {columnRecords.map((record) => (
          <Draggable key={record.id} id={record.id} disabled={readOnly}>
            <KanbanCard record={record} onClick={onRecordClick} />
          </Draggable>
        ))}
      </div>
    </div>
  ))}
</DndContext>
```

### 6.4. Visual Feedback

```tsx
// Add visual cues during drag

const [dragState, setDragState] = useState<{
  isDragging: boolean;
  activeId: string | null;
  validDropZones: string[];
}>({
  isDragging: false,
  activeId: null,
  validDropZones: [],
});

const handleDragStart = useCallback((event: DragStartEvent) => {
  const activeId = String(event.active.id);
  const activeItem = kanbanItems.find(item => item.id === activeId);

  if (!activeItem) return;

  // Calculate valid drop zones (all columns EXCEPT current)
  const validDropZones = columns
    .filter(col => col.id !== activeItem.column)
    .map(col => col.id);

  setDragState({
    isDragging: true,
    activeId,
    validDropZones,
  });

  // ... rest of snapshot logic
}, [kanbanItems, columns]);

// In column render
<ShadcnKanbanBoard
  className={cn(
    "w-[280px] min-w-[280px] flex-shrink-0",
    "bg-gray-50 dark:bg-gray-900 rounded-lg",
    dragState.isDragging &&
      dragState.validDropZones.includes(column.id) &&
      "ring-2 ring-primary ring-offset-2",
    dragState.isDragging &&
      !dragState.validDropZones.includes(column.id) &&
      "opacity-50 cursor-not-allowed"
  )}
>
```

### 6.5. Recommended Approach

**Recommendation**: Use **Option B** (Validate and Revert) because:

1. ✅ Minimal changes to existing codebase
2. ✅ Works with existing shadcn/ui Kanban components
3. ✅ Clear user feedback via toast notifications
4. ✅ Maintains smooth animations
5. ✅ Easy to test and maintain

**Implementation in `kanban-board.tsx`**:

- Add validation at start of `handleDragEnd`
- Revert `boardData` to `kanbanItems` if same column
- Show toast notification explaining restriction
- Proceed with API call only for cross-column moves

---

## 7. COMPONENT BREAKDOWN

### 7.1. New Components to Create

**1. QuickFilterBar Component** (`apps/web/src/features/active-tables/components/quick-filter-bar.tsx`)

```tsx
interface QuickFilterBarProps {
  table: Table;
  filters: QuickFilters;
  onFilterChange: (fieldName: string, value: string | string[] | null) => void;
  onClearAll: () => void;
}
```

**2. QuickFilterControl Component** (`quick-filter-control.tsx`)

```tsx
interface QuickFilterControlProps {
  field: FieldConfig;
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  workspaceId?: string;
}
```

**3. ViewModeSelector Component** (`view-mode-selector.tsx`)

```tsx
interface ViewModeSelectorProps {
  currentView: ViewMode;
  kanbanConfigs: KanbanConfig[];
  ganttConfigs: GanttConfig[];
  currentKanbanId?: string;
  currentGanttId?: string;
  onViewChange: (view: ViewMode) => void;
  onKanbanViewChange: (configId: string) => void;
  onGanttViewChange: (configId: string) => void;
}
```

**4. KanbanViewSelector Component** (`kanban-view-selector.tsx`)

```tsx
interface KanbanViewSelectorProps {
  configs: KanbanConfig[];
  currentConfigId: string;
  onChange: (configId: string) => void;
}
```

**5. GanttViewSelector Component** (`gantt-view-selector.tsx`)

```tsx
interface GanttViewSelectorProps {
  configs: GanttConfig[];
  currentConfigId: string;
  onChange: (configId: string) => void;
}
```

### 7.2. Modified Components

**1. `active-table-records-page.tsx`**

- Add Quick Filter state management
- Add View Config state management
- Integrate QuickFilterBar component
- Replace Tabs with ViewModeSelector component
- Update filteredRecords logic to apply quick filters

**2. `kanban-board.tsx` (in active-tables-core)**

- Add validation in `handleDragEnd` to block in-column moves
- Add visual feedback for valid drop zones
- Add toast notification on blocked moves

### 7.3. New Hooks to Create

**1. useQuickFilters Hook** (`hooks/use-quick-filters.ts`)

```tsx
interface UseQuickFiltersParams {
  table: Table;
  records: TableRecord[];
}

interface UseQuickFiltersReturn {
  filters: QuickFilters;
  setFilter: (fieldName: string, value: string | string[] | null) => void;
  clearFilter: (fieldName: string) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
  filteredRecords: TableRecord[];
}

export function useQuickFilters({ table, records }: UseQuickFiltersParams): UseQuickFiltersReturn;
```

**2. useViewPreferences Hook** (`hooks/use-view-preferences.ts`)

```tsx
interface UseViewPreferencesParams {
  tableId: string;
  defaultKanbanId?: string;
  defaultGanttId?: string;
}

interface UseViewPreferencesReturn {
  currentKanbanId: string | null;
  currentGanttId: string | null;
  setKanbanView: (id: string) => void;
  setGanttView: (id: string) => void;
}

export function useViewPreferences(params: UseViewPreferencesParams): UseViewPreferencesReturn;
```

---

## 8. RESPONSIVE DESIGN SPECIFICATIONS

### 8.1. Breakpoints (from TailwindCSS defaults)

- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (sm to lg)
- **Desktop**: `>= 1024px` (lg+)

### 8.2. Mobile Layout (<640px)

**Quick Filter Bar**:

```
┌────────────────────────────────┐
│ Quick Filters     Clear All (2)│
├────────────────────────────────┤
│ [Assignee ▼]      Full Width   │
│ [Status ▼]        Full Width   │
│ [Matrix Quadrant ▼] Full Width │
└────────────────────────────────┘
```

**View Mode Tabs**:

```
┌────────────────────────────────┐
│ [List] [Kanban] [Gantt]        │
└────────────────────────────────┘
```

**View Selector** (when active):

```
┌────────────────────────────────┐
│ [Kanban ▼] Full Width Button   │
│                                 │
│ Dropdown appears below:         │
│ • Ma trận Eisenhower           │
│ • Trạng thái                   │
│ • Tình trạng công việc         │
└────────────────────────────────┘
```

**Actions Bar**:

```
┌────────────────────────────────┐
│ [Search...] Full Width         │
│ [Filter] [New Record]          │
└────────────────────────────────┘
```

### 8.3. Tablet Layout (640px - 1024px)

**Quick Filter Bar**:

```
┌──────────────────────────────────────────┐
│ Quick Filters           Clear All (2)    │
├──────────────────────────────────────────┤
│ [Assignee ▼] [Status ▼]                  │
│ [Matrix Quadrant ▼] [Related Users ▼]    │
└──────────────────────────────────────────┘
```

**View Mode Tabs**:

```
┌──────────────────────────────────────────┐
│ [List] [Kanban ▼] [Gantt ▼]     Actions │
└──────────────────────────────────────────┘
```

### 8.4. Desktop Layout (>= 1024px)

**Quick Filter Bar**:

```
┌─────────────────────────────────────────────────────────┐
│ Quick Filters                         Clear All (2)     │
├─────────────────────────────────────────────────────────┤
│ [Assignee ▼] [Status ▼] [Matrix ▼] [Related Users ▼]  │
└─────────────────────────────────────────────────────────┘
```

**Full Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ [← Back] Table Name                   [E2EE] [247 recs] │
│ Description text...                                      │
├─────────────────────────────────────────────────────────┤
│ [List] [Kanban ▼] [Gantt ▼]                            │
├─────────────────────────────────────────────────────────┤
│ Quick Filters                         Clear All (2)     │
│ [Assignee ▼] [Status ▼] [Matrix ▼] [Related Users ▼]  │
├─────────────────────────────────────────────────────────┤
│ [Search...] [Filter] [New Record]                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    Content Area                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 8.5. Responsive Component Classes

```tsx
// Quick Filter Control
<Select className="
  w-full sm:w-[140px] md:w-[160px] lg:w-[180px]
  h-9 sm:h-10
">

// View Selector Dropdown Button
<Button className="
  w-full sm:w-auto
  h-9 sm:h-10
  text-xs sm:text-sm
  px-3 sm:px-4
">

// Actions Bar
<div className="
  flex flex-col sm:flex-row
  items-stretch sm:items-center
  gap-2 sm:gap-3
">
```

---

## 9. ACCESSIBILITY SPECIFICATIONS

### 9.1. WCAG 2.1 AA Compliance Checklist

**Perceivable**:

- ✅ All text has minimum 4.5:1 contrast ratio (design tokens ensure this)
- ✅ Interactive elements have minimum 3:1 contrast
- ✅ Focus indicators visible with 2px outline
- ✅ Icons have text labels or aria-label
- ✅ Color not used as only means of conveying information

**Operable**:

- ✅ All functionality available via keyboard
- ✅ Focus order follows logical sequence
- ✅ No keyboard traps
- ✅ Skip links provided for main content
- ✅ Minimum touch target size 44x44px on mobile

**Understandable**:

- ✅ Clear labels for all form controls
- ✅ Error messages in plain language
- ✅ Consistent navigation patterns
- ✅ Predictable behavior (no surprise context changes)

**Robust**:

- ✅ Valid HTML structure
- ✅ ARIA roles and properties used correctly
- ✅ Status messages announced to screen readers
- ✅ Dynamic content changes announced

### 9.2. ARIA Implementation

**Quick Filter Bar**:

```tsx
<Card role="region" aria-label="Quick filters">
  <CardContent>
    <div className="flex items-center justify-between mb-3">
      <h3 id="quick-filters-heading">Quick Filters</h3>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {activeFilterCount} filters active
      </div>
      {activeFilterCount > 0 && (
        <Button onClick={clearAllFilters} aria-label={`Clear all ${activeFilterCount} filters`}>
          Clear All ({activeFilterCount})
        </Button>
      )}
    </div>

    <div role="group" aria-labelledby="quick-filters-heading" className="flex flex-wrap gap-2">
      {/* Filter controls */}
    </div>
  </CardContent>
</Card>
```

**View Mode Selector**:

```tsx
<Tabs value={currentView} onValueChange={onViewChange} aria-label="Record view modes">
  <TabsList role="tablist">
    <TabsTrigger value="list" role="tab" aria-selected={currentView === 'list'} aria-controls="list-view-panel">
      <List className="h-4 w-4" aria-hidden="true" />
      <span>List</span>
    </TabsTrigger>
    {/* ... */}
  </TabsList>

  <TabsContent value="list" role="tabpanel" id="list-view-panel" aria-labelledby="list-tab">
    {/* Content */}
  </TabsContent>
</Tabs>
```

**Multi-Select Filter with Checkbox**:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-label={`Filter by ${field.label}`}>
      {selectedCount === 0 ? field.label : `${field.label} (${selectedCount})`}
    </Button>
  </PopoverTrigger>
  <PopoverContent role="dialog" aria-label={`${field.label} filter options`}>
    <Command>
      <CommandInput placeholder={`Search ${field.label}...`} aria-label={`Search ${field.label} options`} />
      <CommandList role="listbox">
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              role="option"
              aria-selected={selectedValues.includes(option.value)}
              onSelect={() => toggleOption(option.value)}
            >
              <Checkbox checked={selectedValues.includes(option.value)} aria-hidden="true" />
              {option.text}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### 9.3. Keyboard Navigation

**Quick Filters**:

- `Tab`: Navigate between filter controls
- `Space / Enter`: Open dropdown
- `Arrow Up/Down`: Navigate options
- `Space / Enter`: Select option
- `Escape`: Close dropdown
- `Shift + Tab`: Navigate backwards

**Kanban Drag-Drop**:

- `Tab`: Navigate between cards
- `Space`: Pick up card
- `Arrow Keys`: Move between columns
- `Space`: Drop card
- `Escape`: Cancel drag

**View Selector**:

- `Tab`: Navigate to selector
- `Arrow Left/Right`: Switch between view tabs
- `Enter`: Activate view
- `Arrow Down`: Open view config dropdown (when multiple)

### 9.4. Screen Reader Announcements

```tsx
// Add live regions for dynamic updates

// Quick Filter updates
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcementMessage}
</div>

// Example announcements:
// - "Filter by Status: Completed selected"
// - "2 filters active"
// - "All filters cleared"
// - "Showing 15 of 247 records"

// Kanban move blocked
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {dragBlockedMessage}
</div>

// Example announcements:
// - "Cards can only be moved between columns"
// - "Card moved to Completed column"
// - "Move failed, card returned to original column"
```

---

## 10. DESIGN TOKEN USAGE

### 10.1. Color Tokens

From `/packages/ui/src/styles/globals.css`:

**Quick Filter Bar**:

```css
background: hsl(var(--card));
border-color: hsl(var(--border));
color: hsl(var(--card-foreground));
```

**Filter Controls**:

```css
/* Inactive state */
background: hsl(var(--background));
border-color: hsl(var(--input));
color: hsl(var(--foreground));

/* Hover state */
background: hsl(var(--accent));
color: hsl(var(--accent-foreground));

/* Focus state */
outline: 2px solid hsl(var(--ring));
outline-offset: 2px;

/* Active/selected state */
background: hsl(var(--primary));
color: hsl(var(--primary-foreground));
```

**Active Filter Badge**:

```css
background: hsl(var(--primary));
color: hsl(var(--primary-foreground));
border-radius: calc(var(--radius) - 2px);
```

**Clear All Button**:

```css
/* Ghost variant */
color: hsl(var(--muted-foreground));

/* Hover */
background: hsl(var(--secondary));
color: hsl(var(--secondary-foreground));
```

### 10.2. Spacing Tokens

```css
/* Quick Filter Bar padding */
padding: 0.75rem; /* Mobile */
padding: 1rem; /* Desktop */

/* Gap between filters */
gap: 0.5rem; /* Mobile */
gap: 0.75rem; /* Desktop */

/* Filter control height */
height: 2.25rem; /* 36px - Mobile */
height: 2.5rem; /* 40px - Desktop */

/* Border radius (use design tokens) */
border-radius: calc(var(--radius) - 2px); /* Small elements */
border-radius: var(--radius); /* Standard */
border-radius: calc(var(--radius) + 4px); /* Large */
```

### 10.3. Typography Tokens

```css
/* Filter labels */
font-size: 0.875rem; /* 14px - text-sm */
font-weight: 500; /* font-medium */
color: hsl(var(--foreground));

/* Section headings */
font-size: 0.875rem; /* 14px */
font-weight: 600; /* font-semibold */
color: hsl(var(--foreground));

/* Helper text */
font-size: 0.75rem; /* 12px - text-xs */
color: hsl(var(--muted-foreground));

/* Active count badge */
font-size: 0.75rem; /* 12px */
font-weight: 600; /* font-semibold */
```

### 10.4. Shadow Tokens

```css
/* Card shadow */
box-shadow:
  0 1px 3px 0 rgb(0 0 0 / 0.1),
  0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Dropdown shadow */
box-shadow:
  0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Focus ring */
box-shadow: 0 0 0 2px hsl(var(--ring));
```

### 10.5. Dark Mode Considerations

All design tokens automatically adapt via CSS variables:

```tsx
// No hardcoded colors - use design tokens
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click Me
  </Button>
</div>

// ❌ BAD - Hardcoded colors don't adapt to dark mode
<div className="bg-white text-black border-gray-300">
  <Button className="bg-blue-500 text-white">
    Click Me
  </Button>
</div>
```

---

## 11. INTERACTION PATTERNS

### 11.1. Quick Filter Interactions

**Single-Select Filter**:

1. User clicks filter dropdown
2. Dropdown opens with "All {FieldName}" option at top
3. User selects option
4. Dropdown closes immediately
5. Filter applies instantly (no "Apply" button needed)
6. Badge appears showing active filter count
7. Records list updates with fade transition (200ms)

**Multi-Select Filter**:

1. User clicks filter button
2. Popover opens with search input and checkbox list
3. User can search to narrow options
4. User checks/unchecks multiple options
5. Selection count updates in trigger button
6. Filter applies on each selection (live filtering)
7. User clicks outside or presses Escape to close
8. Records list updates progressively

**Clear Single Filter**:

1. User selects "All {FieldName}" option
2. Filter immediately clears
3. Records list updates

**Clear All Filters**:

1. User clicks "Clear All (N)" button
2. All filters reset to "All" state
3. Active filter count returns to 0
4. Records list updates with all records visible

### 11.2. View Mode Switching

**Switch View Mode (No Config Selection)**:

1. User clicks tab (List, Kanban, Gantt)
2. Tab activates with border/background change (100ms transition)
3. Previous view content fades out (200ms)
4. New view content fades in (300ms)
5. URL updates with `?view=kanban` param
6. Scroll position resets to top

**Switch View Mode (With Config Selection)**:

1. User clicks tab with multiple configs
2. Tab activates
3. View selector dropdown appears beside tab
4. Previously selected config loads (from localStorage or first)
5. Content renders

**Select Different Config**:

1. User clicks view selector dropdown
2. Dropdown opens showing config list with:
   - Checkmark on current config
   - Config name (bold)
   - Config description (muted, smaller)
3. User clicks different config
4. Dropdown closes
5. Content transitions to new config (300ms fade)
6. Selection saved to localStorage
7. URL updates with `?kanbanView={id}` param

### 11.3. Kanban Drag-Drop (Fixed)

**Valid Cross-Column Move**:

1. User hovers over card
2. Cursor changes to grab pointer
3. User clicks and holds (mousedown/touchstart)
4. Card elevates with shadow (scale 1.05, shadow-lg)
5. Other columns highlight as valid drop zones (ring-2 ring-primary)
6. User drags card over target column
7. Column header pulses to indicate drop zone
8. User releases (mouseup/touchend)
9. Card animates to bottom of target column (500ms ease-out)
10. API call triggered
11. On success: Card stays in new position
12. On error: Card reverts with shake animation, toast error shown

**Invalid In-Column Move (Blocked)**:

1. User hovers over card in same column
2. Cursor changes to grab pointer
3. User clicks and holds
4. Card elevates slightly
5. Current column remains normal (no highlight)
6. User attempts to drag within same column
7. On release, card immediately reverts to original position (200ms)
8. Toast notification appears: "Cards can only be moved between columns"
9. No API call made

**Visual States**:

- Idle: `shadow-sm hover:shadow-md transition-shadow`
- Dragging: `scale-105 shadow-2xl opacity-80`
- Valid Drop Zone: `ring-2 ring-primary ring-offset-2 bg-primary/5`
- Invalid Drop Zone: `opacity-50 cursor-not-allowed`
- Reverting: `animate-shake` (custom animation)

### 11.4. State Transitions & Animations

**Filter Application**:

```css
/* Records list fade transition */
.records-list {
  transition: opacity 200ms ease-in-out;
}

.records-list.updating {
  opacity: 0.6;
}
```

**View Mode Transition**:

```css
/* Tab content crossfade */
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tab-content-exit {
  animation: fadeOut 200ms ease-out;
}

.tab-content-enter {
  animation: fadeIn 300ms ease-in 200ms; /* Delay for crossfade */
}
```

**Kanban Card Move**:

```css
/* Card drag elevation */
.kanban-card {
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
}

.kanban-card.dragging {
  transform: scale(1.05) rotate(2deg);
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Card drop animation */
@keyframes cardDrop {
  0% {
    transform: translateY(-10px);
    opacity: 0.5;
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.kanban-card.dropping {
  animation: cardDrop 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Revert animation for blocked moves */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.kanban-card.reverting {
  animation: shake 400ms ease-in-out;
}
```

---

## 12. IMPLEMENTATION ROADMAP

### Phase 1: Quick Filters (Week 1)

**Goal**: Implement Quick Filter UI and state management

**Tasks**:

1. Create `useQuickFilters` hook
   - State management for filters
   - Apply filters to records list
   - Calculate active filter count
2. Create `QuickFilterControl` component
   - Handle single-select (Select)
   - Handle multi-select (Popover with Checkboxes)
   - Handle workspace user fields
3. Create `QuickFilterBar` component
   - Layout filter controls
   - Clear All button
   - Active filter badge
4. Integrate into `active-table-records-page.tsx`
   - Add Quick Filter state
   - Render QuickFilterBar
   - Update filteredRecords logic
5. Add unit tests for filter logic
6. Add accessibility features (ARIA, keyboard nav)

**Deliverables**:

- ✅ Working Quick Filter UI for all valid field types
- ✅ Filter state persists in URL params
- ✅ Mobile responsive design
- ✅ WCAG 2.1 AA compliant

### Phase 2: Multi-View Selectors (Week 2)

**Goal**: Enable switching between multiple Kanban/Gantt configs

**Tasks**:

1. Create `useViewPreferences` hook
   - LocalStorage persistence
   - Default view selection logic
2. Create `ViewModeSelector` component
   - Tab navigation
   - Conditional dropdown rendering
3. Create `KanbanViewSelector` component
   - Dropdown with config list
   - Show name and description
   - Checkmark on current
4. Create `GanttViewSelector` component
   - Similar to Kanban selector
5. Update URL state management
   - Add `kanbanView` and `ganttView` params
   - Handle navigation with params
6. Integrate into `active-table-records-page.tsx`
   - Replace Tabs with ViewModeSelector
   - Add view config state
   - Load correct config based on state
7. Add tests for view switching logic

**Deliverables**:

- ✅ Multi-view selector UI for Kanban and Gantt
- ✅ View preference persistence in localStorage
- ✅ URL state includes view config IDs
- ✅ Smooth transitions between configs

### Phase 3: Kanban Drag-Drop Fix (Week 3)

**Goal**: Block in-column reordering, allow only cross-column moves

**Tasks**:

1. Update `handleDragEnd` in `kanban-board.tsx`
   - Add same-column detection
   - Revert boardData on blocked move
   - Add toast notification
2. Add visual feedback during drag
   - Highlight valid drop zones
   - Dim invalid zones (same column)
   - Show cursor states
3. Add animations for:
   - Valid card drop (smooth to bottom)
   - Blocked move revert (shake animation)
   - Drag elevation and shadow
4. Test drag-drop scenarios:
   - Cross-column move (success)
   - In-column move (blocked)
   - API failure (revert)
5. Add accessibility for drag-drop
   - Keyboard alternative (Space to pick/drop)
   - Screen reader announcements
6. Update Kanban BA document with correct behavior

**Deliverables**:

- ✅ In-column drag blocked with visual feedback
- ✅ Cross-column drag works correctly
- ✅ Cards always insert at bottom of target column
- ✅ Smooth animations and error handling

### Phase 4: Polish & Testing (Week 4)

**Goal**: Refine UX, ensure accessibility, comprehensive testing

**Tasks**:

1. Responsive design testing
   - Mobile (< 640px)
   - Tablet (640px - 1024px)
   - Desktop (>= 1024px)
2. Accessibility audit
   - Screen reader testing (NVDA, VoiceOver)
   - Keyboard navigation testing
   - WCAG 2.1 AA compliance check
   - Color contrast verification
3. Performance optimization
   - Memoize filter computations
   - Optimize re-renders
   - Lazy load view selectors
4. Cross-browser testing
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Android)
5. User acceptance testing
   - Gather feedback from stakeholders
   - Iterate based on feedback
6. Documentation
   - Update component README files
   - Add Storybook stories
   - Update design system docs

**Deliverables**:

- ✅ Fully responsive on all devices
- ✅ WCAG 2.1 AA compliant
- ✅ Cross-browser compatible
- ✅ Performance benchmarks met
- ✅ Comprehensive documentation

---

## 13. SHADCN/UI COMPONENTS TO USE

### 13.1. Quick Filters

**Single-Select Filter**:

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
```

**Multi-Select Filter**:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@workspace/ui/components/command';
import { Checkbox } from '@workspace/ui/components/checkbox';
```

**Layout**:

```tsx
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
```

### 13.2. View Selectors

**Tabs**:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs';
```

**Dropdown Menu**:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
```

**Icons**:

```tsx
import { List, KanbanSquare, GanttChart, ChevronDown, Check, Filter, Search, Plus, X } from 'lucide-react';
```

### 13.3. Feedback Components

**Toast Notifications**:

```tsx
import { toast } from '@workspace/ui/components/sonner';

// Usage
toast.info('Cards can only be moved between columns', {
  description: 'Reordering within a column is not supported',
});

toast.success('Filter applied', {
  description: 'Showing 15 of 247 records',
});

toast.error('Failed to move card', {
  description: 'Please try again',
  action: {
    label: 'Retry',
    onClick: () => retryMove(),
  },
});
```

**Loading States**:

```tsx
import { Skeleton } from '@workspace/ui/components/skeleton';

// Quick filter skeleton
<Skeleton className="h-9 w-[140px] rounded-md" />;
```

---

## 14. TESTING STRATEGY

### 14.1. Unit Tests

**Quick Filters Hook**:

```typescript
describe('useQuickFilters', () => {
  it('should initialize with empty filters', () => {
    // ...
  });

  it('should apply single-select filter correctly', () => {
    // ...
  });

  it('should apply multi-select filter with AND logic', () => {
    // ...
  });

  it('should calculate active filter count', () => {
    // ...
  });

  it('should clear individual filter', () => {
    // ...
  });

  it('should clear all filters', () => {
    // ...
  });
});
```

**View Preferences Hook**:

```typescript
describe('useViewPreferences', () => {
  it('should load preferences from localStorage', () => {
    // ...
  });

  it('should save view selection to localStorage', () => {
    // ...
  });

  it('should use default config when none saved', () => {
    // ...
  });
});
```

### 14.2. Integration Tests

**Quick Filter Integration**:

```typescript
describe('QuickFilterBar Integration', () => {
  it('should render all quick filter controls', () => {
    // ...
  });

  it('should filter records when selection changes', () => {
    // ...
  });

  it('should show active filter count badge', () => {
    // ...
  });

  it('should clear all filters on button click', () => {
    // ...
  });

  it('should persist filters in URL params', () => {
    // ...
  });
});
```

**Multi-View Selector Integration**:

```typescript
describe('ViewModeSelector Integration', () => {
  it('should show dropdown when multiple configs exist', () => {
    // ...
  });

  it('should hide dropdown when single config', () => {
    // ...
  });

  it('should switch configs on selection', () => {
    // ...
  });

  it('should save preference to localStorage', () => {
    // ...
  });
});
```

**Kanban Drag-Drop Integration**:

```typescript
describe('Kanban Drag-Drop Fix', () => {
  it('should allow cross-column move', () => {
    // ...
  });

  it('should block in-column move', () => {
    // ...
  });

  it('should show toast on blocked move', () => {
    // ...
  });

  it('should revert card position on blocked move', () => {
    // ...
  });

  it('should call API only for valid moves', () => {
    // ...
  });
});
```

### 14.3. E2E Tests (Playwright)

```typescript
test.describe('Active Table Records Page', () => {
  test('should apply quick filters and update records list', async ({ page }) => {
    // Navigate to records page
    await page.goto('/vi/workspaces/123/tables/456/records');

    // Apply Status filter
    await page.click('[aria-label="Filter by Status"]');
    await page.click('text=Completed');

    // Verify badge shows active filter
    await expect(page.locator('text=Clear All (1)')).toBeVisible();

    // Verify filtered records
    const records = page.locator('[data-testid="record-row"]');
    await expect(records).toHaveCount(15);
  });

  test('should switch between Kanban views', async ({ page }) => {
    await page.goto('/vi/workspaces/123/tables/456/records?view=kanban');

    // Open view selector
    await page.click('[aria-label="Select Kanban view"]');

    // Select different view
    await page.click('text=Trạng thái');

    // Verify URL updated
    await expect(page).toHaveURL(/kanbanView=.+/);

    // Verify columns changed
    await expect(page.locator('text=Chưa bắt đầu')).toBeVisible();
  });

  test('should block in-column Kanban drag', async ({ page }) => {
    await page.goto('/vi/workspaces/123/tables/456/records?view=kanban');

    // Try to drag card within same column
    const card = page.locator('[data-card-id="record-1"]');
    await card.dragTo(page.locator('[data-card-id="record-2"]'));

    // Verify toast notification
    await expect(page.locator('text=Cards can only be moved between columns')).toBeVisible();

    // Verify card stayed in place
    // ... position check
  });
});
```

### 14.4. Accessibility Tests (axe-core)

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('Quick Filter Bar should be accessible', async ({ page }) => {
    await page.goto('/vi/workspaces/123/tables/456/records');
    await injectAxe(page);

    await checkA11y(page, '[role="region"][aria-label="Quick filters"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('View Selector should be keyboard navigable', async ({ page }) => {
    await page.goto('/vi/workspaces/123/tables/456/records');

    // Tab to view selector
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Assuming 2 tabs to reach selector

    // Arrow keys to switch tabs
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveText('Kanban');

    // Enter to activate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/view=kanban/);
  });
});
```

---

## 15. PERFORMANCE CONSIDERATIONS

### 15.1. Optimization Techniques

**Quick Filter Performance**:

```tsx
// Memoize filter computations
const filteredRecords = useMemo(() => {
  // ... filter logic
}, [displayRecords, quickFilters, searchQuery]);

// Debounce search input
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

// Use virtualization for large option lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

**View Switching Performance**:

```tsx
// Lazy load Kanban/Gantt components
const KanbanBoard = lazy(() =>
  import('@workspace/active-tables-core').then((m) => ({
    default: m.KanbanBoard,
  })),
);

const GanttChartView = lazy(() =>
  import('@workspace/active-tables-core').then((m) => ({
    default: m.GanttChartView,
  })),
);

// Use Suspense for loading states
<Suspense fallback={<ViewLoadingSkeleton />}>
  <KanbanBoard {...props} />
</Suspense>;
```

**Kanban Drag-Drop Performance**:

```tsx
// Already optimized in current implementation:
// 1. Memoized columns and kanbanItems
// 2. useCallback for event handlers
// 3. Snapshot reference for drag start
// 4. Efficient column/card lookups

// Additional: Use React.memo for cards
export const KanbanCard = React.memo(
  function KanbanCard({
    record,
    onCardClick,
    // ...
  }: KanbanCardProps) {
    // ...
  },
  (prevProps, nextProps) => {
    // Custom comparison for deep equality
    return prevProps.record.id === nextProps.record.id && prevProps.record.updatedAt === nextProps.record.updatedAt;
  },
);
```

### 15.2. Bundle Size Optimization

**Code Splitting**:

- Quick Filter components loaded on-demand
- View Selectors only render when multiple configs exist
- Heavy dependencies (dnd-kit, Command component) already lazy-loaded

**Tree Shaking**:

- Import only needed shadcn components
- Use named exports from @workspace packages
- Avoid barrel imports that include unused code

### 15.3. Render Optimization

**Prevent Unnecessary Re-renders**:

```tsx
// Use React.memo for pure components
const QuickFilterControl = React.memo(function QuickFilterControl(props) {
  // ...
});

// Use useCallback for stable references
const handleFilterChange = useCallback((fieldName: string, value: any) => {
  setQuickFilters((prev) => ({
    ...prev,
    [fieldName]: value,
  }));
}, []);

// Use useMemo for expensive computations
const sortedOptions = useMemo(() => {
  return [...field.options].sort((a, b) => a.text.localeCompare(b.text));
}, [field.options]);
```

### 15.4. Performance Metrics & Targets

**Page Load (Initial)**:

- Target: < 1.5s (First Contentful Paint)
- Target: < 2.5s (Largest Contentful Paint)
- Target: < 100ms (First Input Delay)

**Filter Application**:

- Target: < 100ms (for up to 1000 records)
- Use Web Workers for > 1000 records

**View Switching**:

- Target: < 300ms (transition + render)
- Use `will-change` CSS property for animations

**Kanban Drag**:

- Target: 60fps during drag (16.67ms per frame)
- Use `transform` instead of `left/top` for positioning
- GPU acceleration via `translate3d()`

---

## 16. ERROR STATES & EDGE CASES

### 16.1. Quick Filters Error States

**No Valid Quick Filter Fields**:

```tsx
{
  quickFilterConfigs.length === 0 && (
    <Card className="border-muted">
      <CardContent className="p-4 text-center text-sm text-muted-foreground">
        No quick filters configured for this table.
        <br />
        <Button variant="link" asChild className="mt-2">
          <Link to={ROUTES.ACTIVE_TABLES.TABLE_SETTINGS}>Configure Quick Filters</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Field Options Not Loaded**:

```tsx
{
  field.type === 'SELECT_ONE_WORKSPACE_USER' && !workspaceUsers && (
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder="Loading users..." />
      </SelectTrigger>
    </Select>
  );
}
```

**Filter Results in Zero Records**:

```tsx
{
  filteredRecords.length === 0 && activeFilterCount > 0 && (
    <Card className="mt-4 border-muted">
      <CardContent className="p-8 text-center">
        <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No records found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters to see more results.</p>
        <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 16.2. View Selector Edge Cases

**No Kanban Configs**:

```tsx
// Don't show Kanban tab at all
{
  kanbanConfigs.length > 0 && <TabsTrigger value="kanban">{/* ... */}</TabsTrigger>;
}
```

**Invalid Config ID in URL**:

```tsx
// Fallback to first config or show error
useEffect(() => {
  const requestedKanbanId = searchParams.kanbanView;

  if (requestedKanbanId) {
    const configExists = kanbanConfigs.some((c) => c.kanbanScreenId === requestedKanbanId);

    if (!configExists) {
      // Redirect to first config
      navigate({
        search: {
          ...searchParams,
          kanbanView: kanbanConfigs[0]?.kanbanScreenId,
        },
        replace: true,
      });

      toast.warning('Requested view not found', {
        description: 'Showing default view instead',
      });
    }
  }
}, [searchParams.kanbanView, kanbanConfigs]);
```

**Config Deleted While Viewing**:

```tsx
// Handle real-time config updates
useEffect(() => {
  if (!currentKanbanConfig) {
    // Config was deleted, switch to list view
    navigate({
      search: { ...searchParams, view: 'list' },
      replace: true,
    });

    toast.error('View configuration no longer available', {
      description: 'Switched to List view',
    });
  }
}, [currentKanbanConfig]);
```

### 16.3. Kanban Drag-Drop Edge Cases

**API Call Fails During Move**:

```tsx
// In handleRecordMove callback
onRecordMove(recordId, newColumn);

// ... mutation with onError
onError: (error) => {
  // Revert optimistic update
  queryClient.invalidateQueries(['activeTableRecords', tableId]);

  toast.error('Failed to move card', {
    description: error.message,
    action: {
      label: 'Retry',
      onClick: () => onRecordMove(recordId, newColumn),
    },
  });
};
```

**Network Disconnect During Drag**:

```tsx
// Add online/offline detection
const isOnline = useOnlineStatus();

// Disable drag when offline
<KanbanBoard readOnly={!isOnline} onRecordMove={isOnline ? handleRecordMove : undefined} />;

{
  !isOnline && (
    <Alert variant="warning" className="mb-4">
      <AlertTitle>No internet connection</AlertTitle>
      <AlertDescription>Changes cannot be saved while offline. Reconnect to continue.</AlertDescription>
    </Alert>
  );
}
```

**Permission Denied After Drag**:

```tsx
// API returns 403
onError: (error) => {
  if (error.response?.status === 403) {
    toast.error('Permission denied', {
      description: 'You do not have permission to move this card',
    });

    // Revert
    queryClient.invalidateQueries(['activeTableRecords', tableId]);
  }
};
```

**Encrypted Table Without Key**:

```tsx
// Disable drag for encrypted tables without valid key
const isDragDisabled = table.config.e2eeEncryption && encryption.keyValidationStatus !== 'valid';

<KanbanBoard readOnly={isDragDisabled} onRecordMove={isDragDisabled ? undefined : handleRecordMove} />;
```

---

## 17. FUTURE ENHANCEMENTS

### 17.1. Quick Filter Enhancements (P1)

**Save Filter Presets**:

- Allow users to save frequently-used filter combinations
- Quick access to saved presets via dropdown
- Share presets with team members

**Advanced Filter Builder**:

- Visual query builder for complex filter logic
- Support OR conditions (currently only AND)
- Date range filters
- Numeric range filters (greater than, less than)

**Filter Templates**:

- Pre-configured filters based on common use cases
- "My Tasks", "Overdue Items", "This Week", etc.

### 17.2. View Selector Enhancements (P2)

**View Management UI**:

- Create/edit/delete views directly from records page
- Drag-to-reorder views in selector
- Set default view per user

**View Sharing**:

- Share view configurations via URL
- Export/import view configs (JSON)
- Team-wide default views

**View Analytics**:

- Track most-used views
- Suggest optimizations based on usage patterns

### 17.3. Kanban Enhancements (P1)

**Swimlanes**:

- Group cards into swimlanes (e.g., by assignee)
- Horizontal scrolling for swimlanes
- Collapsible swimlanes

**Card Customization**:

- Choose which fields to display on cards
- Card size options (compact, standard, detailed)
- Color-code cards by field value

**WIP Limits**:

- Set max cards per column
- Visual warning when limit exceeded
- Enforce limits (block moves to full columns)

**Card Cover Images**:

- Upload/attach cover image to cards
- Display thumbnail on card
- Full-size preview on hover/click

### 17.4. Gantt Enhancements (P2)

**Multiple View Modes**:

- Day / Week / Month / Quarter / Year views
- Zoom controls
- Mini-map navigation

**Dependencies Visualization**:

- Draw arrows between dependent tasks
- Highlight critical path
- Show slack time

**Timeline Interactions**:

- Drag task bars to adjust dates
- Drag edges to adjust duration
- Inline progress updates

### 17.5. Performance Enhancements (P1)

**Virtual Scrolling**:

- Render only visible cards in Kanban
- Maintain 60fps with 1000+ cards

**Progressive Loading**:

- Load cards in batches as user scrolls
- Show loading skeleton during fetch

**Caching Strategy**:

- Cache filter results in memory
- Persist to IndexedDB for offline access
- Background sync when online

---

## 18. SIGN-OFF

### 18.1. Stakeholder Approval

| Role                     | Name | Signature | Date |
| ------------------------ | ---- | --------- | ---- |
| Product Owner            |      |           |      |
| UI/UX Lead               |      |           |      |
| Technical Lead           |      |           |      |
| QA Lead                  |      |           |      |
| Accessibility Specialist |      |           |      |

### 18.2. Success Criteria

**Quick Filters**:

- ✅ All 6 valid field types supported
- ✅ Single and multi-select working correctly
- ✅ Active filter count badge accurate
- ✅ Clear All functionality works
- ✅ Filters persist in URL
- ✅ Mobile responsive
- ✅ WCAG 2.1 AA compliant

**Multi-View Selectors**:

- ✅ Dropdown appears when 2+ configs exist
- ✅ View switches correctly on selection
- ✅ Preferences saved to localStorage
- ✅ URL includes view config IDs
- ✅ Smooth transitions between views

**Kanban Drag-Drop Fix**:

- ✅ In-column drag blocked with feedback
- ✅ Cross-column drag works correctly
- ✅ Cards insert at bottom of target column
- ✅ Toast notification on blocked move
- ✅ No API call for blocked moves
- ✅ Error handling and revert working

**Performance**:

- ✅ Page load < 1.5s (FCP)
- ✅ Filter application < 100ms
- ✅ View switch < 300ms
- ✅ Kanban drag at 60fps

**Accessibility**:

- ✅ Screen reader compatible
- ✅ Full keyboard navigation
- ✅ ARIA labels complete
- ✅ Focus management correct
- ✅ Color contrast WCAG AA

---

## APPENDIX A: COMPONENT INTERFACE SPECIFICATIONS

### A.1. QuickFilterBar Props

```typescript
interface QuickFilterBarProps {
  /** Active table configuration */
  table: Table;

  /** Current filter state */
  filters: QuickFilters;

  /** Callback when filter changes */
  onFilterChange: (fieldName: string, value: string | string[] | null) => void;

  /** Callback when Clear All clicked */
  onClearAll: () => void;

  /** Workspace ID for fetching user options */
  workspaceId: string;

  /** Optional CSS class */
  className?: string;
}
```

### A.2. QuickFilterControl Props

```typescript
interface QuickFilterControlProps {
  /** Field configuration */
  field: FieldConfig;

  /** Current filter value */
  value: string | string[] | null;

  /** Callback when value changes */
  onChange: (value: string | string[] | null) => void;

  /** Workspace ID for user field types */
  workspaceId?: string;

  /** Optional CSS class */
  className?: string;
}
```

### A.3. ViewModeSelector Props

```typescript
interface ViewModeSelectorProps {
  /** Current view mode */
  currentView: 'list' | 'kanban' | 'gantt';

  /** Available Kanban configurations */
  kanbanConfigs: KanbanConfig[];

  /** Available Gantt configurations */
  ganttConfigs: GanttConfig[];

  /** Currently selected Kanban config ID */
  currentKanbanId?: string;

  /** Currently selected Gantt config ID */
  currentGanttId?: string;

  /** Callback when view mode changes */
  onViewChange: (view: 'list' | 'kanban' | 'gantt') => void;

  /** Callback when Kanban view changes */
  onKanbanViewChange: (configId: string) => void;

  /** Callback when Gantt view changes */
  onGanttViewChange: (configId: string) => void;

  /** Optional CSS class */
  className?: string;
}
```

---

## APPENDIX B: STATE MANAGEMENT DIAGRAMS

### B.1. Quick Filter State Flow

```
User selects filter option
        ↓
onChange handler called
        ↓
setQuickFilters (update state)
        ↓
useMemo recalculates filteredRecords
        ↓
Component re-renders with filtered data
        ↓
URL params updated (optional)
```

### B.2. View Config State Flow

```
User clicks view selector
        ↓
Dropdown opens
        ↓
User selects config
        ↓
onViewChange callback
        ↓
setCurrentConfigId (state update)
        ↓
saveToLocalStorage (persistence)
        ↓
navigate with new URL params
        ↓
Component re-renders with new config
```

### B.3. Kanban Drag State Flow

```
User starts drag
        ↓
handleDragStart
        ↓
Save snapshot of current state
        ↓
User drops card
        ↓
handleDragEnd
        ↓
Compare snapshot vs current column
        ↓
        ├─ Same column
        │       ↓
        │  Revert boardData
        │       ↓
        │  Show toast notification
        │       ↓
        │  No API call
        │
        └─ Different column
                ↓
           Call onRecordMove
                ↓
           API mutation
                ↓
           ├─ Success: Keep new position
           └─ Error: Revert + show toast
```

---

## APPENDIX C: ACCESSIBILITY CHECKLIST

### C.1. Quick Filters

- [ ] All filter controls have visible labels
- [ ] Filter dropdowns have `aria-label` or `aria-labelledby`
- [ ] Active filter count announced via `aria-live="polite"`
- [ ] Clear All button has descriptive `aria-label`
- [ ] Keyboard navigation works (Tab, Space, Enter, Escape)
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces filter selection
- [ ] Color not used as only indicator of state

### C.2. View Selectors

- [ ] Tab navigation follows logical order
- [ ] Arrow keys switch between view tabs
- [ ] Dropdown menu keyboard accessible
- [ ] Current view indicated via `aria-selected`
- [ ] Screen reader announces view changes
- [ ] Focus returns to trigger after dropdown closes

### C.3. Kanban

- [ ] Keyboard alternative for drag-drop (Space to pick/drop)
- [ ] Arrow keys move card between columns
- [ ] Screen reader announces card moves
- [ ] Screen reader announces blocked moves
- [ ] Cards have descriptive `aria-label`
- [ ] Column headers have heading semantics

### C.4. General

- [ ] All images have alt text
- [ ] All icons have `aria-label` or text label
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] No keyboard traps
- [ ] Skip links for main content
- [ ] Error messages clear and actionable
- [ ] Form fields have associated labels
- [ ] Status messages announced to screen readers

---

**END OF DOCUMENT**

Total Pages: ~40
Total Words: ~12,000
