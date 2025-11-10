/**
 * InfiniteScrollTrigger Component
 *
 * Invisible trigger element that uses Intersection Observer API
 * to detect when user scrolls near the bottom and trigger loading.
 *
 * Features:
 * - Intersection Observer for performance
 * - Configurable trigger threshold
 * - Debounced loading to prevent rapid fires
 * - Accessibility support with ARIA live regions
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { useEffect, useRef, useState } from 'react';

const SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'PageDown',
  'PageUp',
  'End',
  'Home',
  ' ',
  'Spacebar',
]);

export interface InfiniteScrollTriggerProps {
  /**
   * Callback when trigger intersects viewport
   * Should load next page of data
   */
  onLoadMore: () => void;

  /**
   * Whether more data is available to load
   * @default true
   */
  hasMore?: boolean;

  /**
   * Whether currently loading data
   * @default false
   */
  isLoading?: boolean;

  /**
   * Root margin for Intersection Observer
   * Controls how far before element enters viewport to trigger
   * @default '400px' (trigger 400px before bottom)
   */
  rootMargin?: string;

  /**
   * Intersection threshold (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Debounce delay in ms
   * Prevents rapid successive loads
   * @default 200
   */
  debounceMs?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Invisible trigger component for infinite scroll
 *
 * Place this component at the end of your scrollable list.
 * It will automatically call `onLoadMore` when scrolled into view.
 *
 * @example
 * ```tsx
 * <div className="records-list">
 *   {records.map(record => <RecordCard key={record.id} {...record} />)}
 *
 *   <InfiniteScrollTrigger
 *     onLoadMore={fetchNextPage}
 *     hasMore={hasNextPage}
 *     isLoading={isFetchingNextPage}
 *   />
 * </div>
 * ```
 */
export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore = true,
  isLoading = false,
  rootMargin = '400px',
  threshold = 0.1,
  debounceMs = 200,
  className = '',
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState('');
  // Delay observer until user scrolls or provides a scroll-style input so we don't immediately fetch page 2 on mount.
  const [isScrollActivated, setIsScrollActivated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.scrollY > 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || isScrollActivated) {
      return undefined;
    }

    const activate = () => {
      setIsScrollActivated(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) {
        activate();
      }
    };

    window.addEventListener('wheel', activate, { passive: true });
    window.addEventListener('scroll', activate, { passive: true });
    window.addEventListener('touchmove', activate, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', activate);
      window.removeEventListener('scroll', activate);
      window.removeEventListener('touchmove', activate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScrollActivated]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasMore || isLoading || !isScrollActivated) return;

    // Debounce timer
    let debounceTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && hasMore && !isLoading) {
          // Clear any pending timer
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }

          // Debounce the load call
          debounceTimer = setTimeout(() => {
            console.log('[InfiniteScrollTrigger] Loading more records...');
            setLoadingAnnouncement('Loading more records');
            onLoadMore();

            // Clear announcement after 1 second
            setTimeout(() => setLoadingAnnouncement(''), 1000);
          }, debounceMs);
        }
      },
      {
        root: null, // viewport
        rootMargin,
        threshold,
      },
    );

    observer.observe(trigger);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, rootMargin, threshold, debounceMs, isScrollActivated]);

  // Don't render if no more data
  if (!hasMore) return null;

  return (
    <>
      {/* Invisible trigger element */}
      <div
        ref={triggerRef}
        className={`h-1 w-full ${className}`}
        data-testid="infinite-scroll-trigger"
        aria-hidden="true"
      />

      {/* Screen reader announcement */}
      {loadingAnnouncement && (
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {loadingAnnouncement}
        </div>
      )}
    </>
  );
}
