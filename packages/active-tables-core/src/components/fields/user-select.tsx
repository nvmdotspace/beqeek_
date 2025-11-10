/**
 * UserSelect Component
 *
 * Week 2: Phase 2 Implementation
 *
 * Async select component for SELECT_ONE_WORKSPACE_USER and SELECT_LIST_WORKSPACE_USER field types
 * Features:
 * - Search by name or email with 300ms debounce
 * - User avatars and status
 * - Loading states
 * - Empty states
 * - Keyboard navigation
 * - Accessibility (ARIA labels)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, Loader2, User } from 'lucide-react';
import type { WorkspaceUser } from '../../types/responses.js';

/**
 * UserSelect uses the standard WorkspaceUser type from responses.ts
 */
export type UserSelectUser = WorkspaceUser;

export interface UserSelectProps {
  /** Currently selected value (single or multiple user IDs) */
  value?: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Multiple selection mode */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Available workspace users */
  users: UserSelectUser[];
  /** Loading state */
  loading?: boolean;
  /** Custom error message */
  error?: string;
}

export function UserSelect({
  value,
  onChange,
  multiple = false,
  placeholder = 'Select user...',
  disabled = false,
  users = [],
  loading = false,
  error,
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Scroll dropdown into view when opened
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Filter users based on search query (client-side)
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) => user.name?.toLowerCase().includes(query) || user.id.toLowerCase().includes(query),
    );

    return filtered;
  }, [users, searchQuery]);

  // Handle selection
  const handleSelect = useCallback(
    (userId: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(userId)
          ? currentValues.filter((id) => id !== userId)
          : [...currentValues, userId];
        onChange(newValues);
      } else {
        onChange(userId);
        setOpen(false);
      }
    },
    [multiple, value, onChange],
  );

  // Check if user is selected
  const isSelected = useCallback(
    (userId: string) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(userId);
      }
      return value === userId;
    },
    [multiple, value],
  );

  // Get display label for selected value(s)
  const displayLabel = useMemo(() => {
    if (!value) return placeholder;

    if (multiple) {
      const selectedIds = Array.isArray(value) ? value : [];
      if (selectedIds.length === 0) return placeholder;
      return `${selectedIds.length} user${selectedIds.length > 1 ? 's' : ''} selected`;
    }

    const selectedUser = users.find((u) => u.id === value);
    return selectedUser?.name || (value as string);
  }, [value, users, placeholder, multiple]);

  // Get user display name
  const getUserDisplayName = useCallback((user: UserSelectUser) => {
    return user.name || user.id;
  }, []);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="user-select-listbox"
        disabled={disabled || loading}
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
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Loading users...</span>
          </>
        ) : (
          <>
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && !loading && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />

          {/* Popover */}
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full min-w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
          >
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
              <input
                type="text"
                role="searchbox"
                aria-label="Search users"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
              />
            </div>

            {/* Results List */}
            <div
              id="user-select-listbox"
              role="listbox"
              aria-multiselectable={multiple}
              className="max-h-[300px] overflow-y-auto p-1"
            >
              {/* Empty State */}
              {filteredUsers.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {searchQuery ? `No users found for "${searchQuery}"` : 'No users available'}
                </div>
              )}

              {/* Users */}
              {filteredUsers.map((user) => {
                const selected = isSelected(user.id);
                return (
                  <div
                    key={user.id}
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(user.id)}
                    className={`
                      relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none
                      hover:bg-accent hover:text-accent-foreground
                      ${selected ? 'bg-accent' : ''}
                    `}
                  >
                    <Check className={`mr-2 h-4 w-4 ${selected ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />

                    {/* User Avatar */}
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                          aria-hidden="true"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 truncate">
                      <div className="font-medium">{getUserDisplayName(user)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Multi-select Hint */}
            {multiple && filteredUsers.length > 0 && (
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">Click users to select multiple</div>
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
