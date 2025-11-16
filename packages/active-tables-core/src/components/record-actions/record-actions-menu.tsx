/**
 * RecordActionsMenu Component
 *
 * Dropdown menu for record actions (Update, Delete, Custom Actions)
 * Only displays actions the user has permissions for
 */

import { useState, useRef, useEffect } from 'react';
import type { TableRecord } from '../../types/record.js';
import type { ActionConfig } from '@workspace/beqeek-shared/types';
import { hasPermission } from '../../types/record.js';

export interface RecordActionsMenuProps {
  /** The record to show actions for */
  record: TableRecord;

  /** Table actions configuration */
  actions: ActionConfig[];

  /** Callback when update action is clicked */
  onUpdate?: (recordId: string) => void;

  /** Callback when delete action is clicked */
  onDelete?: (recordId: string) => void;

  /** Callback when custom action is clicked */
  onCustomAction?: (actionId: string, recordId: string) => void;

  /** Custom messages */
  messages?: {
    noActions?: string;
  };
}

/**
 * Simple SVG icon for more menu (three vertical dots)
 */
const MoreVertIcon = ({ className = '' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

/**
 * Get permission key for an action
 */
function getPermissionKey(action: ActionConfig): string {
  return action.type === 'custom' ? `custom_${action.actionId}` : action.type;
}

/**
 * Filter actions based on record permissions
 */
function getDisplayableActions(record: TableRecord, actions: ActionConfig[]): ActionConfig[] {
  return actions.filter((action) => {
    // Only show update, delete, and custom actions
    if (!['update', 'delete', 'custom'].includes(action.type)) {
      return false;
    }

    // Check if user has permission for this action
    const permissionKey = getPermissionKey(action);
    return hasPermission(record, permissionKey);
  });
}

export function RecordActionsMenu({
  record,
  actions,
  onUpdate,
  onDelete,
  onCustomAction,
  messages,
}: RecordActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter actions based on permissions
  const displayActions = getDisplayableActions(record, actions);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // No actions to display
  if (displayActions.length === 0) {
    return null;
  }

  const handleActionClick = (action: ActionConfig) => {
    setIsOpen(false);

    switch (action.type) {
      case 'update':
        onUpdate?.(record.id);
        break;
      case 'delete':
        onDelete?.(record.id);
        break;
      case 'custom':
        onCustomAction?.(action.actionId, record.id);
        break;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Record actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreVertIcon className="h-4 w-4" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {displayActions.map((action) => (
            <button
              key={action.actionId}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span>{action.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
