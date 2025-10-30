import { useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useCurrentLocale } from './use-current-locale';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const metaMatches = !!shortcut.metaKey === event.metaKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const altMatches = !!shortcut.altKey === event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts for the app
export const useAppKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const locale = useCurrentLocale();
  const currentWorkspace = useSidebarStore((state) => state.currentWorkspace);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'g',
      ctrlKey: true,
      action: () => navigate({ to: '/' }),
      description: 'Go to Dashboard',
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => {
        if (currentWorkspace) {
          navigate({
            to: '/$locale/workspaces/$workspaceId/tables',
            params: { locale, workspaceId: currentWorkspace.id }
          });
          setActiveSection('tables');
        }
      },
      description: 'Go to Tables',
      enabled: !!currentWorkspace,
    },
    {
      key: 'w',
      ctrlKey: true,
      action: () => {
        if (currentWorkspace) {
          navigate({
            to: '/$locale/workspaces/$workspaceId/workflows',
            params: { locale, workspaceId: currentWorkspace.id }
          });
          setActiveSection('workflow');
        }
      },
      description: 'Go to Workflows',
      enabled: !!currentWorkspace,
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        if (currentWorkspace) {
          navigate({
            to: '/$locale/workspaces/$workspaceId/team',
            params: { locale, workspaceId: currentWorkspace.id }
          });
          setActiveSection('team');
        }
      },
      description: 'Go to Team',
      enabled: !!currentWorkspace,
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        navigate({
          to: '/$locale/workspaces',
          params: { locale }
        });
      },
      description: 'Go to Settings',
    },

    // Sidebar shortcuts
    {
      key: 'b',
      ctrlKey: true,
      action: () => toggleSidebar(),
      description: 'Toggle Sidebar',
    },

    // Search shortcuts
    {
      key: '/',
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus Search',
    },

    // Quick action shortcuts
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Open command palette (placeholder)
        console.log('Open command palette');
      },
      description: 'Open Command Palette',
    },

    // Workspace shortcuts
    {
      key: '1',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Quick switch to workspace 1 (placeholder)
        console.log('Switch to workspace 1');
      },
      description: 'Switch to Workspace 1',
    },
    {
      key: '2',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Quick switch to workspace 2 (placeholder)
        console.log('Switch to workspace 2');
      },
      description: 'Switch to Workspace 2',
    },
    {
      key: '3',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Quick switch to workspace 3 (placeholder)
        console.log('Switch to workspace 3');
      },
      description: 'Switch to Workspace 3',
    },

    // Help shortcut
    {
      key: '?',
      action: () => {
        // Show keyboard shortcuts help
        console.log('Show keyboard shortcuts help');
      },
      description: 'Show Keyboard Shortcuts',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

// Hook for accessibility enhancements
export const useAccessibilityEnhancements = () => {
  useEffect(() => {
    // Announce dynamic content changes to screen readers
    const announceToScreenReader = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Add focus management for modal dialogs
    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement;
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      }
    };

    // Add skip to main content link
    const addSkipLink = () => {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className =
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';

      document.body.insertBefore(skipLink, document.body.firstChild);
    };

    // Initialize accessibility features
    addSkipLink();
    document.addEventListener('keydown', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, []);
};

// Hook for managing ARIA labels and roles
export const useAriaManagement = () => {
  useEffect(() => {
    // Ensure proper ARIA attributes on dynamic content
    const updateAriaAttributes = () => {
      // Update sidebar ARIA attributes
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
      if (sidebar) {
        const isCollapsed = sidebar.classList.contains('w-16');
        sidebar.setAttribute('aria-label', isCollapsed ? 'Collapsed sidebar' : 'Expanded sidebar');
        sidebar.setAttribute('role', 'navigation');
      }

      // Update mobile navigation ARIA attributes
      const mobileNav = document.querySelector('.fixed.bottom-0') as HTMLElement;
      if (mobileNav) {
        mobileNav.setAttribute('role', 'navigation');
        mobileNav.setAttribute('aria-label', 'Mobile navigation');
      }

      // Update main content ARIA attributes
      const mainContent = document.querySelector('main') as HTMLElement;
      if (mainContent) {
        mainContent.setAttribute('id', 'main-content');
        mainContent.setAttribute('role', 'main');
        mainContent.setAttribute('aria-label', 'Main content');
      }
    };

    // Update ARIA attributes initially and on DOM changes
    updateAriaAttributes();

    const observer = new MutationObserver(updateAriaAttributes);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
};
