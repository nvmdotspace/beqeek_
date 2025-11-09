/**
 * List Context Preservation Hook
 *
 * Preserves list view state (filters, sort, view mode, record IDs) in session storage
 * to restore context when navigating back from record detail view.
 *
 * @example
 * ```tsx
 * // In records list page
 * const listContext = useListContext();
 *
 * // Save context before navigating to detail
 * listContext.save({
 *   recordIds: filteredRecords.map(r => r.id),
 *   search: { view: 'kanban', filters: 'status:active' },
 *   timestamp: Date.now(),
 * });
 *
 * // In record detail page
 * const context = listContext.load();
 * // Use context.recordIds for prev/next navigation
 * // Use context.search to restore view state on back
 * ```
 */

import { useParams } from '@tanstack/react-router';
import type { RecordsSearchParams } from '@/routes/$locale/workspaces/$workspaceId/tables/$tableId/records';

export interface ListContext {
  /** Ordered list of record IDs in current view (for navigation) */
  recordIds: string[];

  /** Search params to restore view state */
  search: RecordsSearchParams;

  /** Timestamp when context was saved (for cache invalidation) */
  timestamp: number;
}

const CONTEXT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Hook to manage list context in session storage
 */
export function useListContext() {
  const { tableId } = useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId/records' });
  const storageKey = `list-context-${tableId}`;

  return {
    /**
     * Save list context to session storage
     */
    save: (context: ListContext): void => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(context));
      } catch (error) {
        console.warn('Failed to save list context:', error);
      }
    },

    /**
     * Load list context from session storage
     * Returns null if not found or expired
     */
    load: (): ListContext | null => {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (!stored) return null;

        const context = JSON.parse(stored) as ListContext;

        // Check expiry
        if (Date.now() - context.timestamp > CONTEXT_EXPIRY_MS) {
          sessionStorage.removeItem(storageKey);
          return null;
        }

        return context;
      } catch (error) {
        console.warn('Failed to load list context:', error);
        return null;
      }
    },

    /**
     * Clear list context from session storage
     */
    clear: (): void => {
      try {
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to clear list context:', error);
      }
    },

    /**
     * Check if context exists and is valid
     */
    exists: (): boolean => {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (!stored) return false;

        const context = JSON.parse(stored) as ListContext;
        return Date.now() - context.timestamp <= CONTEXT_EXPIRY_MS;
      } catch {
        return false;
      }
    },
  };
}

/**
 * Helper to parse filters from URL string format
 * Format: "field1:value1|value2,field2:value3"
 *
 * @example
 * parseFiltersFromURL("status:active|pending,priority:high")
 * // Returns: { status: ['active', 'pending'], priority: ['high'] }
 */
export function parseFiltersFromURL(filtersStr?: string): Record<string, string[]> {
  if (!filtersStr) return {};

  try {
    return Object.fromEntries(
      filtersStr.split(',').map((part) => {
        const [key, valuesStr] = part.split(':');
        return [key, valuesStr?.split('|') ?? []];
      }),
    );
  } catch (error) {
    console.warn('Failed to parse filters from URL:', error);
    return {};
  }
}

/**
 * Helper to serialize filters to URL string format
 * Format: "field1:value1|value2,field2:value3"
 *
 * @example
 * serializeFiltersToURL({ status: ['active', 'pending'], priority: ['high'] })
 * // Returns: "status:active|pending,priority:high"
 */
export function serializeFiltersToURL(filters: Record<string, string[]>): string {
  try {
    return Object.entries(filters)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) => `${key}:${values.join('|')}`)
      .join(',');
  } catch (error) {
    console.warn('Failed to serialize filters to URL:', error);
    return '';
  }
}
