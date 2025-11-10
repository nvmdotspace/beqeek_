/**
 * RecordsLiveAnnouncer Component
 *
 * ARIA live region for announcing record loading states to screen readers
 * Provides real-time accessibility updates for infinite scroll
 *
 * Features:
 * - Polite announcements (non-intrusive)
 * - Auto-clear after announcement
 * - Loading, success, and error states
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { useEffect, useState } from 'react';

export interface RecordsLiveAnnouncerProps {
  /**
   * Whether currently loading records
   */
  isLoading?: boolean;

  /**
   * Whether fetching next page
   */
  isFetchingNextPage?: boolean;

  /**
   * Whether there are more records to load
   */
  hasNextPage?: boolean;

  /**
   * Current error state
   */
  error?: Error | null;

  /**
   * Total records loaded
   */
  recordCount?: number;
}

/**
 * Live announcer for record loading states
 *
 * @example
 * ```tsx
 * <RecordsLiveAnnouncer
 *   isLoading={isLoading}
 *   isFetchingNextPage={isFetchingNextPage}
 *   hasNextPage={hasNextPage}
 *   error={error}
 *   recordCount={records.length}
 * />
 * ```
 */
export function RecordsLiveAnnouncer({
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  error = null,
  recordCount = 0,
}: RecordsLiveAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');
  const [previousRecordCount, setPreviousRecordCount] = useState(0);

  useEffect(() => {
    // Initial loading
    if (isLoading && recordCount === 0) {
      setAnnouncement('Loading records...');
      return;
    }

    // Fetching next page
    if (isFetchingNextPage) {
      setAnnouncement('Loading more records...');
      return;
    }

    // Error occurred
    if (error) {
      setAnnouncement(`Error loading records: ${error.message}`);
      return;
    }

    // Records loaded successfully (count increased)
    if (recordCount > previousRecordCount && previousRecordCount > 0) {
      const newRecords = recordCount - previousRecordCount;
      setAnnouncement(`${newRecords} new ${newRecords === 1 ? 'record' : 'records'} loaded. Total: ${recordCount}`);
      setPreviousRecordCount(recordCount);

      // Clear announcement after 3 seconds
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Initial records loaded
    if (recordCount > 0 && previousRecordCount === 0) {
      setAnnouncement(`${recordCount} ${recordCount === 1 ? 'record' : 'records'} loaded`);
      setPreviousRecordCount(recordCount);

      // Clear announcement after 3 seconds
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Reached end of list
    if (!hasNextPage && !isFetchingNextPage && recordCount > 0) {
      setAnnouncement(`All ${recordCount} ${recordCount === 1 ? 'record' : 'records'} loaded. You've reached the end.`);

      // Clear announcement after 3 seconds
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetchingNextPage, hasNextPage, error, recordCount, previousRecordCount]);

  // Don't render if no announcement
  if (!announcement) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}

/**
 * Compact announcer with simpler messages
 */
export function RecordsLiveAnnouncerCompact({
  isLoading = false,
  isFetchingNextPage = false,
  error = null,
}: Omit<RecordsLiveAnnouncerProps, 'recordCount' | 'hasNextPage'>) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (isLoading) {
      setAnnouncement('Loading...');
      return;
    }

    if (isFetchingNextPage) {
      setAnnouncement('Loading more...');
      return;
    }

    if (error) {
      setAnnouncement('Loading failed');
      return;
    }

    // Clear announcement
    setAnnouncement('');
  }, [isLoading, isFetchingNextPage, error]);

  if (!announcement) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
