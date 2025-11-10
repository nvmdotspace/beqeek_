/**
 * Keyboard Shortcuts Hook for Scroll Navigation
 *
 * Provides keyboard shortcuts for navigating long record lists:
 * - Cmd/Ctrl + Home: Scroll to top
 * - Cmd/Ctrl + End: Scroll to bottom
 * - Page Up/Down: Scroll by viewport height
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { useEffect } from 'react';

export interface UseScrollShortcutsOptions {
  /**
   * Enable shortcuts (default: true)
   */
  enabled?: boolean;

  /**
   * Scroll container selector (default: window)
   */
  containerSelector?: string;

  /**
   * Callback when scrolling starts
   */
  onScrollStart?: () => void;

  /**
   * Callback when scrolling ends
   */
  onScrollEnd?: () => void;
}

/**
 * Hook for keyboard scroll shortcuts
 *
 * @example
 * ```tsx
 * useScrollShortcuts({
 *   enabled: true,
 *   containerSelector: '.records-container',
 * });
 * ```
 */
export function useScrollShortcuts(options?: UseScrollShortcutsOptions) {
  const { enabled = true, containerSelector, onScrollStart, onScrollEnd } = options ?? {};

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for modifier keys (Cmd on Mac, Ctrl on Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      // Get scroll container
      const container = containerSelector ? document.querySelector(containerSelector) : window;
      if (!container) return;

      let shouldPreventDefault = false;
      let scrollAction: (() => void) | null = null;

      // Cmd/Ctrl + Home: Scroll to top
      if (modifierKey && event.key === 'Home') {
        shouldPreventDefault = true;
        scrollAction = () => {
          if (container === window) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
          }
        };
      }

      // Cmd/Ctrl + End: Scroll to bottom
      if (modifierKey && event.key === 'End') {
        shouldPreventDefault = true;
        scrollAction = () => {
          if (container === window) {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          } else {
            const element = container as HTMLElement;
            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
          }
        };
      }

      // Page Up: Scroll up by viewport height
      if (event.key === 'PageUp' && !modifierKey) {
        shouldPreventDefault = true;
        scrollAction = () => {
          const viewportHeight = window.innerHeight;
          if (container === window) {
            window.scrollBy({ top: -viewportHeight, behavior: 'smooth' });
          } else {
            const element = container as HTMLElement;
            element.scrollBy({ top: -viewportHeight, behavior: 'smooth' });
          }
        };
      }

      // Page Down: Scroll down by viewport height
      if (event.key === 'PageDown' && !modifierKey) {
        shouldPreventDefault = true;
        scrollAction = () => {
          const viewportHeight = window.innerHeight;
          if (container === window) {
            window.scrollBy({ top: viewportHeight, behavior: 'smooth' });
          } else {
            const element = container as HTMLElement;
            element.scrollBy({ top: viewportHeight, behavior: 'smooth' });
          }
        };
      }

      // Execute scroll action if defined
      if (scrollAction) {
        if (shouldPreventDefault) {
          event.preventDefault();
        }

        onScrollStart?.();
        scrollAction();

        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Scrolling...';
        document.body.appendChild(announcement);

        // Remove announcement after scroll ends
        setTimeout(() => {
          document.body.removeChild(announcement);
          onScrollEnd?.();
        }, 500);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, containerSelector, onScrollStart, onScrollEnd]);
}
