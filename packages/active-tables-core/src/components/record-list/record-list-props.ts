/**
 * Props for RecordList component and its layouts
 */

import type { TableRecord } from '../../types/record.js';
import type { Table } from '../../types/common.js';
import type { RecordListConfig } from '../../types/config.js';
import type { ActiveTablesMessages } from '../../types/messages.js';
import type { CurrentUser, WorkspaceUser } from '../../types/responses.js';

/**
 * Base props for all list layouts
 */
export interface BaseRecordListProps {
  /** Table metadata and configuration */
  table: Table;

  /** Array of records to display */
  records: TableRecord[];

  /** List layout configuration */
  config: RecordListConfig;

  /** Loading state */
  loading?: boolean;

  /** Error state */
  error?: Error | string | null;

  /** Current authenticated user */
  currentUser?: CurrentUser;

  /** Workspace users (for user field rendering) */
  workspaceUsers?: WorkspaceUser[];

  /** Localized messages */
  messages?: Partial<ActiveTablesMessages>;

  /** Encryption key for E2EE tables */
  encryptionKey?: string;
}

/**
 * Props for RecordList with interaction handlers
 */
export interface RecordListProps extends BaseRecordListProps {
  /** Callback when a record is clicked */
  onRecordClick?: (record: TableRecord) => void;

  /** Callback when records are selected */
  onSelectionChange?: (selectedIds: string[]) => void;

  /** Enable bulk selection */
  enableSelection?: boolean;

  /** Initial selected record IDs */
  selectedIds?: string[];

  /** Enable sorting */
  enableSorting?: boolean;

  /** Enable filtering */
  enableFiltering?: boolean;

  /** Callback when sort changes */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;

  /** Callback when filter changes */
  onFilterChange?: (filters: Record<string, unknown>) => void;

  /** Additional CSS class names */
  className?: string;

  /** Callback for retry on error */
  onRetry?: () => void;

  /** Show actions menu (update/delete/custom) - default: true */
  showActions?: boolean;

  /** Callback when update action is clicked */
  onUpdateRecord?: (recordId: string) => void;

  /** Callback when delete action is clicked */
  onDeleteRecord?: (recordId: string) => void;

  /** Callback when custom action is clicked */
  onCustomAction?: (actionId: string, recordId: string) => void;
}

/**
 * Props for individual layout components
 */
export interface LayoutProps extends BaseRecordListProps {
  /** Callback when a record is clicked */
  onRecordClick?: (record: TableRecord) => void;

  /** Selected record IDs */
  selectedIds?: string[];

  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;

  /** Additional CSS class names */
  className?: string;

  /** Show actions menu (update/delete/custom) - default: true */
  showActions?: boolean;

  /** Callback when update action is clicked */
  onUpdateRecord?: (recordId: string) => void;

  /** Callback when delete action is clicked */
  onDeleteRecord?: (recordId: string) => void;

  /** Callback when custom action is clicked */
  onCustomAction?: (actionId: string, recordId: string) => void;
}
