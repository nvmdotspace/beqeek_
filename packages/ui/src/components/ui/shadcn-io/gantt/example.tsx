import { useState } from 'react';
import type { GanttFeature, GanttStatus } from './index.js';
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
} from './index.js';

const statuses: GanttStatus[] = [
  { id: '1', name: 'In Progress', color: '#3b82f6' },
  { id: '2', name: 'Done', color: '#22c55e' },
  { id: '3', name: 'Blocked', color: '#ef4444' },
];

const initialFeatures: GanttFeature[] = [
  {
    id: '1',
    name: 'Feature 1',
    startAt: new Date(2025, 0, 1),
    endAt: new Date(2025, 0, 15),
    status: statuses[0],
  },
  {
    id: '2',
    name: 'Feature 2',
    startAt: new Date(2025, 0, 10),
    endAt: new Date(2025, 1, 5),
    status: statuses[1],
  },
  {
    id: '3',
    name: 'Feature 3',
    startAt: new Date(2025, 1, 1),
    endAt: new Date(2025, 2, 1),
    status: statuses[2],
  },
];

export function GanttExample() {
  const [features, setFeatures] = useState<GanttFeature[]>(initialFeatures);

  const handleMove = (id: string, startAt: Date, endAt: Date | null) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, startAt, endAt: endAt ?? f.endAt } : f)));
  };

  const handleAddItem = (date: Date) => {
    const newFeature: GanttFeature = {
      id: `${Date.now()}`,
      name: 'New Feature',
      startAt: date,
      endAt: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      status: statuses[0],
    };
    setFeatures((prev) => [...prev, newFeature]);
  };

  return (
    <div className="h-screen w-full">
      <GanttProvider range="monthly" zoom={100} onAddItem={handleAddItem}>
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
            <GanttFeatureRow features={features} onMove={handleMove} />
          </GanttFeatureList>
          <GanttToday />
        </GanttTimeline>
      </GanttProvider>
    </div>
  );
}
