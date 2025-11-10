/**
 * AsyncRecordSelect Component
 *
 * Week 2: Phase 2 Implementation
 *
 * Async select component for SELECT_ONE_RECORD and SELECT_LIST_RECORD field types
 * Features:
 * - Search with 300ms debounce
 * - Infinite scroll pagination
 * - Loading states
 * - Empty states
 * - Keyboard navigation
 * - Accessibility (ARIA labels)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';

export interface AsyncRecordSelectRecord {
  id: string;
  [key: string]: unknown;
}

export interface AsyncRecordSelectProps {
  /** Currently selected value (single or multiple) */
  value?: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Multiple selection mode */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Field name for label display */
  labelFieldName?: string;
  /** Function to fetch records */
  fetchRecords: (query: string, page: number) => Promise<{ records: AsyncRecordSelectRecord[]; hasMore: boolean }>;
  /** Referenced table name for display */
  tableName?: string;
  /** Custom error message */
  error?: string;
}

export function AsyncRecordSelect({
  value,
  onChange,
  multiple = false,
  placeholder = 'Select record...',
  disabled = false,
  labelFieldName = 'id',
  fetchRecords,
  tableName = 'records',
  error,
}: AsyncRecordSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [records, setRecords] = useState<AsyncRecordSelectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch records when popover opens or search query changes
  useEffect(() => {
    if (!open) return;

    const loadRecords = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const result = await fetchRecords(debouncedQuery, currentPage);

        if (currentPage === 1) {
          setRecords(result.records);
        } else {
          setRecords((prev) => [...prev, ...result.records]);
        }

        setHasMore(result.hasMore);
      } catch (err) {
        console.error('Failed to fetch records:', err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [open, debouncedQuery, currentPage, fetchRecords]);

  // Handle selection
  const handleSelect = useCallback(
    (recordId: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(recordId)
          ? currentValues.filter((id) => id !== recordId)
          : [...currentValues, recordId];
        onChange(newValues);
      } else {
        onChange(recordId);
        setOpen(false);
      }
    },
    [multiple, value, onChange],
  );

  // Check if record is selected
  const isSelected = useCallback(
    (recordId: string) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(recordId);
      }
      return value === recordId;
    },
    [multiple, value],
  );

  // Get display label for selected value(s)
  const displayLabel = useMemo(() => {
    if (!value) return placeholder;

    if (multiple) {
      const selectedIds = Array.isArray(value) ? value : [];
      if (selectedIds.length === 0) return placeholder;
      return `${selectedIds.length} selected`;
    }

    const selectedRecord = records.find((r) => r.id === value);
    return (selectedRecord?.[labelFieldName] as string) || (value as string);
  }, [value, records, labelFieldName, placeholder, multiple]);

  // Load more on scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

      // Load more when scrolled 80%
      if (scrollPercentage > 80 && hasMore && !isLoading) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    [hasMore, isLoading],
  );

  // Get record label
  const getRecordLabel = useCallback(
    (record: AsyncRecordSelectRecord) => {
      return String(record[labelFieldName] || record.id);
    },
    [labelFieldName],
  );

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="record-select-listbox"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`
          flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm
          border-input bg-background
          ring-offset-background placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-destructive' : ''}
        `}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />

          {/* Popover */}
          <div className="absolute z-50 mt-1 w-full min-w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
              <input
                type="text"
                role="searchbox"
                aria-label={`Search ${tableName}`}
                placeholder={`Search ${tableName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
              />
            </div>

            {/* Results List */}
            <div
              id="record-select-listbox"
              role="listbox"
              aria-multiselectable={multiple}
              className="max-h-[300px] overflow-y-auto p-1"
              onScroll={handleScroll}
            >
              {/* Loading State */}
              {isLoading && currentPage === 1 && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Loading records...</span>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="py-6 text-center text-sm text-destructive" role="alert">
                  Failed to load records. Please try again.
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && records.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {searchQuery ? `No records found for "${searchQuery}"` : 'No records available'}
                </div>
              )}

              {/* Records */}
              {!isError && records.length > 0 && (
                <>
                  {records.map((record) => {
                    const selected = isSelected(record.id);
                    return (
                      <div
                        key={record.id}
                        role="option"
                        aria-selected={selected}
                        onClick={() => handleSelect(record.id)}
                        className={`
                          relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none
                          hover:bg-accent hover:text-accent-foreground
                          ${selected ? 'bg-accent' : ''}
                        `}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${selected ? 'opacity-100' : 'opacity-0'}`}
                          aria-hidden="true"
                        />
                        <div className="flex-1 truncate">
                          <div className="font-medium">{getRecordLabel(record)}</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading More Indicator */}
                  {isLoading && currentPage > 1 && (
                    <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Loading more...</span>
                    </div>
                  )}

                  {/* End of List */}
                  {!hasMore && records.length > 10 && (
                    <div className="py-2 text-center text-xs text-muted-foreground">End of results</div>
                  )}
                </>
              )}
            </div>

            {/* Multi-select Hint */}
            {multiple && !isLoading && records.length > 0 && (
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">Click records to select multiple</div>
            )}
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
