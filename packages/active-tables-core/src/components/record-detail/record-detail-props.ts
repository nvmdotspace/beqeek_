/**
 * Props for RecordDetail component and its layouts
 */

import type { TableRecord, RecordComment } from '../../types/record.js';
import type { Table } from '../../types/common.js';
import type { RecordDetailConfig } from '../../types/config.js';
import type { ActiveTablesMessages } from '../../types/messages.js';
import type { CurrentUser, WorkspaceUser } from '../../types/responses.js';

/**
 * Base props for all detail layouts
 */
export interface BaseRecordDetailProps {
  /** Table metadata and configuration */
  table: Table;

  /** Record to display */
  record: TableRecord;

  /** Detail layout configuration */
  config: RecordDetailConfig;

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
 * Props for RecordDetail with interaction handlers
 */
export interface RecordDetailProps extends BaseRecordDetailProps {
  /** Enable inline editing */
  enableEditing?: boolean;

  /** Callback when record is updated */
  onUpdate?: (recordId: string, updates: Record<string, unknown>) => Promise<void>;

  /** Callback when record is deleted */
  onDelete?: (recordId: string) => Promise<void>;

  /** Comments for this record */
  comments?: RecordComment[];

  /** Callback when new comment is added */
  onCommentAdd?: (comment: string) => Promise<void>;

  /** Callback when comment is updated */
  onCommentUpdate?: (commentId: string, content: string) => Promise<void>;

  /** Callback when comment is deleted */
  onCommentDelete?: (commentId: string) => Promise<void>;

  /** Loading state for comments */
  commentsLoading?: boolean;

  /** Additional CSS class names */
  className?: string;

  /** Callback for retry on error */
  onRetry?: () => void;
}

/**
 * Props for individual layout components
 */
export interface DetailLayoutProps extends BaseRecordDetailProps {
  /** Enable inline editing */
  enableEditing?: boolean;

  /** Callback when record is updated */
  onUpdate?: (recordId: string, updates: Record<string, unknown>) => Promise<void>;

  /** Comments panel component (if configured) */
  commentsPanel?: React.ReactNode;

  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for CommentsPanel component
 */
export interface CommentsPanelProps {
  /** Comments to display */
  comments: RecordComment[];

  /** Current authenticated user */
  currentUser?: CurrentUser;

  /** Workspace users for user mentions */
  workspaceUsers?: WorkspaceUser[];

  /** Loading state */
  loading?: boolean;

  /** Callback when new comment is added */
  onCommentAdd?: (content: string) => Promise<void>;

  /** Callback when comment is updated */
  onCommentUpdate?: (commentId: string, content: string) => Promise<void>;

  /** Callback when comment is deleted */
  onCommentDelete?: (commentId: string) => Promise<void>;

  /** Localized messages */
  messages?: Partial<ActiveTablesMessages>;

  /** Additional CSS class names */
  className?: string;
}

/**
 * State for inline editing
 */
export interface InlineEditState {
  /** Whether editing is active */
  isEditing: boolean;

  /** Field currently being edited */
  editingField: string | null;

  /** Edited values */
  editedValues: Record<string, unknown>;

  /** Validation errors */
  errors: Record<string, string>;

  /** Saving state */
  isSaving: boolean;
}
