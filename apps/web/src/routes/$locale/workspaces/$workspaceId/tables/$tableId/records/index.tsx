import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ActiveTableRecordsPageLazy = lazy(() =>
  import('@/features/active-tables/pages/active-table-records-page').then((m) => ({
    default: m.ActiveTableRecordsPage,
  })),
);

/**
 * Search params for records list page
 */
export interface RecordsSearchParams {
  /** View mode: list | kanban | gantt */
  view?: 'list' | 'kanban' | 'gantt';
  /** Screen ID for kanban/gantt view (when multiple configs exist) */
  screen?: string;
  /** Active filters (serialized): "field1:value1|value2,field2:value3" */
  filters?: string;
  /** Sort field and direction: "fieldName:asc" or "fieldName:desc" */
  sort?: string;
  /** Search query */
  search?: string;
  /** Page number for pagination */
  page?: number;
}

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/records/')({
  component: RecordsComponent,
  validateSearch: (search: Record<string, unknown>): RecordsSearchParams => {
    return {
      view: (['list', 'kanban', 'gantt'].includes(search.view as string) ? search.view : 'list') as
        | 'list'
        | 'kanban'
        | 'gantt',
      screen: typeof search.screen === 'string' ? search.screen : undefined,
      filters: typeof search.filters === 'string' ? search.filters : undefined,
      sort: typeof search.sort === 'string' ? search.sort : undefined,
      search: typeof search.search === 'string' ? search.search : undefined,
      page: typeof search.page === 'number' && search.page > 0 ? search.page : 1,
    };
  },
});

function RecordsComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ActiveTableRecordsPageLazy />
    </Suspense>
  );
}
