/**
 * FieldListRenderer Component
 *
 * Simplified field renderer optimized for list views
 * Designed for high-density display with minimal styling
 */

import type { FieldConfig } from '../../types/field.js';
import type { Table } from '../../types/common.js';
import type { CurrentUser, WorkspaceUser } from '../../types/responses.js';
import type { ActiveTablesMessages } from '../../types/messages.js';
import { FieldBadge } from '../common/index.js';

interface FieldListRendererProps {
  /** Field configuration */
  field: FieldConfig;
  /** Field value */
  value: unknown;
  /** Table metadata */
  table: Table;
  /** Current authenticated user */
  currentUser?: CurrentUser;
  /** Workspace users (for user field rendering) */
  workspaceUsers?: WorkspaceUser[];
  /** Localized messages */
  messages?: Partial<ActiveTablesMessages>;
  /** Disable text truncation (for multi-line display) */
  disableTruncate?: boolean;
}

/**
 * Simplified select field renderer for list views
 */
function SelectFieldList({ field, value }: { field: FieldConfig; value: unknown }) {
  const isArray = Array.isArray(value);

  if (isArray) {
    if (value.length === 0) {
      return <span className="text-muted-foreground/50">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {value.map((val) => {
          const option = field.options?.find((opt: { value: string }) => opt.value === val);
          return (
            <FieldBadge
              key={val}
              variant={option?.background_color ? 'outline' : 'secondary'}
              size="compact"
              style={
                option?.background_color
                  ? {
                      backgroundColor: option.background_color,
                      color: option.text_color ?? 'inherit',
                    }
                  : undefined
              }
            >
              {option?.text || String(val)}
            </FieldBadge>
          );
        })}
      </div>
    );
  }

  // Single select
  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  const option = field.options?.find((opt: { value: string }) => opt.value === value);
  return (
    <FieldBadge
      variant={option?.background_color ? 'outline' : 'secondary'}
      size="compact"
      style={
        option?.background_color
          ? {
              backgroundColor: option.background_color,
              color: option.text_color ?? 'inherit',
            }
          : undefined
      }
    >
      {option?.text || String(value)}
    </FieldBadge>
  );
}

/**
 * Simplified date field renderer for list views
 */
function DateFieldList({ field, value }: { field: FieldConfig; value: unknown }) {
  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  try {
    const date = new Date(value as string);
    return (
      <span className="text-sm">
        {date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </span>
    );
  } catch {
    return <span className="text-sm">{String(value)}</span>;
  }
}

/**
 * Simplified URL field renderer for list views
 */
function URLFieldList({ value, disableTruncate }: { value: unknown; disableTruncate?: boolean }) {
  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  return (
    <a
      href={String(value)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        disableTruncate
          ? 'text-sm text-blue-600 hover:text-blue-800'
          : 'text-sm text-blue-600 hover:text-blue-800 truncate max-w-[150px] inline-block'
      }
      title={disableTruncate ? undefined : String(value)}
    >
      {String(value)}
    </a>
  );
}

/**
 * Simplified email field renderer for list views
 */
function EmailFieldList({ value, disableTruncate }: { value: unknown; disableTruncate?: boolean }) {
  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  return (
    <a
      href={`mailto:${String(value)}`}
      className={
        disableTruncate
          ? 'text-sm text-blue-600 hover:text-blue-800'
          : 'text-sm text-blue-600 hover:text-blue-800 truncate max-w-[150px] inline-block'
      }
      title={disableTruncate ? undefined : String(value)}
    >
      {String(value)}
    </a>
  );
}

/**
 * Workspace user field renderer for list views
 */
function WorkspaceUserFieldList({ value, workspaceUsers }: { value: unknown; workspaceUsers?: WorkspaceUser[] }) {
  const isArray = Array.isArray(value);

  // Helper to find user by ID
  const findUser = (userId: string) => {
    return workspaceUsers?.find((user) => user.id === userId);
  };

  // Handle array of user IDs (SELECT_LIST_WORKSPACE_USER)
  if (isArray) {
    if (value.length === 0) {
      return <span className="text-muted-foreground/50">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {value.map((userId) => {
          const user = findUser(String(userId));
          return (
            <FieldBadge key={userId} variant="secondary" size="compact">
              {user?.name || String(userId)}
            </FieldBadge>
          );
        })}
      </div>
    );
  }

  // Handle single user ID (SELECT_ONE_WORKSPACE_USER)
  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  const user = findUser(String(value));
  return (
    <FieldBadge variant="secondary" size="compact">
      {user?.name || String(value)}
    </FieldBadge>
  );
}

/**
 * Main FieldListRenderer component
 */
export function FieldListRenderer(props: FieldListRendererProps) {
  const { field, value, workspaceUsers, disableTruncate = false } = props;

  // Empty value
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground/50">—</span>;
  }

  // Field type specific renderers
  const fieldType = field.type;

  // Workspace user fields
  if (fieldType === 'SELECT_ONE_WORKSPACE_USER' || fieldType === 'SELECT_LIST_WORKSPACE_USER') {
    return <WorkspaceUserFieldList value={value} workspaceUsers={workspaceUsers} />;
  }

  // Select fields
  if (
    fieldType === 'SELECT_ONE' ||
    fieldType === 'SELECT_LIST' ||
    fieldType === 'CHECKBOX_ONE' ||
    fieldType === 'CHECKBOX_LIST'
  ) {
    return <SelectFieldList field={field} value={value} />;
  }

  // Date fields
  if (fieldType === 'DATE') {
    return <DateFieldList field={field} value={value} />;
  }

  // URL fields
  if (fieldType === 'URL') {
    return <URLFieldList value={value} disableTruncate={disableTruncate} />;
  }

  // Email fields
  if (fieldType === 'EMAIL') {
    return <EmailFieldList value={value} disableTruncate={disableTruncate} />;
  }

  // Default text rendering with truncation for long values
  return (
    <span
      className={disableTruncate ? 'text-sm' : 'text-sm truncate max-w-[200px] inline-block'}
      title={disableTruncate ? undefined : String(value)}
    >
      {String(value)}
    </span>
  );
}
