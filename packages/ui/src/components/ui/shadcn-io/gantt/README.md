# Gantt Chart Component

A fully-featured, interactive Gantt chart component for React 19, built with TypeScript and styled with Tailwind CSS.

## Features

- **Interactive Timeline**: Drag features horizontally to adjust start/end dates
- **Edge Resizing**: Drag left and right edges to extend task duration
- **Multiple Views**: Daily, monthly, and quarterly timeline views
- **Infinite Scroll**: Timeline automatically extends when scrolling near boundaries
- **Lane Support**: Features can share rows via the `lane` property
- **Overlap Handling**: Automatic sub-row positioning for overlapping items
- **Today Marker**: Visual indicator for the current date
- **Custom Markers**: Add milestone markers with context menu removal
- **Add Items**: Click on timeline to add new features at specific dates

## Installation

This component requires the following dependencies (already installed):

```bash
pnpm add @dnd-kit/core @dnd-kit/modifiers date-fns jotai lodash.throttle @uidotdev/usehooks lucide-react
```

## Basic Usage

```tsx
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureRow,
  GanttToday,
  type GanttFeature,
  type GanttStatus,
} from '@workspace/ui/components/ui/shadcn-io/gantt';

const features: GanttFeature[] = [
  {
    id: '1',
    name: 'Feature 1',
    startAt: new Date(2025, 0, 1),
    endAt: new Date(2025, 0, 15),
    status: { id: '1', name: 'In Progress', color: '#3b82f6' },
  },
];

function MyGantt() {
  return (
    <GanttProvider range="monthly" zoom={100}>
      <GanttSidebar>
        <GanttSidebarGroup name="Features">
          {features.map((feature) => (
            <GanttSidebarItem key={feature.id} feature={feature} />
          ))}
        </GanttSidebarGroup>
      </GanttSidebar>
      <GanttTimeline>
        <GanttHeader />
        <GanttFeatureList>
          <GanttFeatureRow features={features} />
        </GanttFeatureList>
        <GanttToday />
      </GanttTimeline>
    </GanttProvider>
  );
}
```

## API Reference

### GanttProvider

Main provider component that wraps the entire Gantt chart.

**Props:**

- `range?: 'daily' | 'monthly' | 'quarterly'` - Timeline view mode (default: 'monthly')
- `zoom?: number` - Zoom level percentage (default: 100)
- `onAddItem?: (date: Date) => void` - Callback when clicking to add a new item
- `children: ReactNode` - Child components

### GanttSidebar

Sidebar component displaying feature list.

**Props:**

- `children: ReactNode` - Sidebar content (typically GanttSidebarGroup)
- `className?: string` - Optional CSS classes

### GanttSidebarItem

Individual feature item in the sidebar.

**Props:**

- `feature: GanttFeature` - Feature data
- `onSelectItem?: (id: string) => void` - Callback when item is clicked
- `className?: string` - Optional CSS classes

### GanttFeatureRow

Timeline row displaying features with drag-and-drop support.

**Props:**

- `features: GanttFeature[]` - Array of features to display
- `onMove?: (id: string, startAt: Date, endAt: Date | null) => void` - Callback when feature is moved
- `children?: (feature: GanttFeature) => ReactNode` - Custom render function
- `className?: string` - Optional CSS classes

### GanttMarker

Custom milestone marker on the timeline.

**Props:**

- `id: string` - Unique marker ID
- `date: Date` - Marker date
- `label: string` - Marker label text
- `onRemove?: (id: string) => void` - Callback when marker is removed
- `className?: string` - Optional CSS classes

## Types

```typescript
type GanttStatus = {
  id: string;
  name: string;
  color: string;
};

type GanttFeature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: GanttStatus;
  lane?: string; // Optional: features with same lane share a row
};

type Range = 'daily' | 'monthly' | 'quarterly';
```

## Advanced Usage

### Custom Feature Rendering

```tsx
<GanttFeatureRow features={features} onMove={handleMove}>
  {(feature) => (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{feature.name}</span>
        <span className="text-xs text-muted-foreground">{feature.status.name}</span>
      </div>
    </>
  )}
</GanttFeatureRow>
```

### Adding Items on Click

```tsx
const handleAddItem = (date: Date) => {
  const newFeature: GanttFeature = {
    id: `${Date.now()}`,
    name: 'New Task',
    startAt: date,
    endAt: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
    status: defaultStatus,
  };
  setFeatures((prev) => [...prev, newFeature]);
};

<GanttProvider onAddItem={handleAddItem}>{/* ... */}</GanttProvider>;
```

### Custom Markers

```tsx
const markers: GanttMarkerProps[] = [
  { id: '1', date: new Date(2025, 0, 15), label: 'Launch' },
  { id: '2', date: new Date(2025, 1, 1), label: 'Milestone' },
];

<GanttTimeline>
  <GanttHeader />
  <GanttFeatureList>
    <GanttFeatureRow features={features} />
  </GanttFeatureList>
  {markers.map((marker) => (
    <GanttMarker key={marker.id} {...marker} onRemove={handleRemoveMarker} />
  ))}
  <GanttToday />
</GanttTimeline>;
```

## CSS Variables

The component uses CSS custom properties for styling:

- `--gantt-zoom`: Zoom level (percentage)
- `--gantt-column-width`: Column width in pixels
- `--gantt-header-height`: Header height (60px)
- `--gantt-row-height`: Row height (36px)
- `--gantt-sidebar-width`: Sidebar width (300px or 0)

## React 19 Compatibility

This component is fully compatible with React 19 and does not require any Next.js-specific features. It uses standard React hooks and patterns.

## Example

See [example.tsx](./example.tsx) for a complete working example.

## Credits

Based on the Gantt component from [shadcn.io/components/data/gantt](https://www.shadcn.io/components/data/gantt), adapted for React 19 and this project's architecture.
