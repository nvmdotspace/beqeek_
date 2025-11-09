/**
 * Kanban Board Component Props
 *
 * Type definitions for Kanban board components
 */

import type { Table } from '../../types/common.js';
import type { TableRecord } from '../../types/record.js';
import type { KanbanConfig, FieldConfig } from '../../types/index.js';
import type { PartialMessages } from '../../types/messages.js';

// ============================================
// Base Props (shared across components)
// ============================================

/**
 * Base props shared by all Kanban components
 */
export interface BaseKanbanProps {
  /** Active table metadata and configuration */
  table: Table;

  /** Optional localized messages */
  messages?: PartialMessages;

  /** Optional CSS class name */
  className?: string;
}

// ============================================
// Kanban Board Props
// ============================================

/**
 * Props for KanbanBoard component
 */
export interface KanbanBoardProps extends BaseKanbanProps {
  /** All records to display on the board */
  records: TableRecord[];

  /** Kanban configuration (which fields to use for columns, cards, etc.) */
  config: KanbanConfig;

  /** Callback when a card is moved to a different column */
  onRecordMove?: (recordId: string, newStatusValue: string) => void;

  /** Callback when a card is clicked */
  onRecordClick?: (record: TableRecord) => void;

  /** Loading state */
  loading?: boolean;

  /** Disable drag and drop */
  readOnly?: boolean;
}

// ============================================
// Kanban Column Props
// ============================================

/**
 * Props for KanbanColumn component
 */
export interface KanbanColumnProps extends BaseKanbanProps {
  /** Column ID (status field value) */
  columnId: string;

  /** Column title to display */
  title: string;

  /** Optional column color (background) */
  color?: string;

  /** Optional text color */
  textColor?: string;

  /** Records in this column */
  records: TableRecord[];

  /** Kanban configuration */
  config: KanbanConfig;

  /** Field to use as card headline */
  headlineField: FieldConfig;

  /** Fields to display in card body */
  displayFields: FieldConfig[];

  /** Callback when a card is clicked */
  onRecordClick?: (record: TableRecord) => void;

  /** Whether column is collapsed */
  collapsed?: boolean;

  /** Callback to toggle collapse state */
  onToggleCollapse?: () => void;

  /** Disable drag and drop */
  readOnly?: boolean;
}

// ============================================
// Kanban Card Props
// ============================================

/**
 * Props for KanbanCard component
 */
export interface KanbanCardProps extends BaseKanbanProps {
  /** Record to display */
  record: TableRecord;

  /** Field to use as card headline */
  headlineField: FieldConfig;

  /** Fields to display in card body */
  displayFields: FieldConfig[];

  /** Callback when card is clicked */
  onClick?: (record: TableRecord) => void;

  /** Whether card is being dragged */
  isDragging?: boolean;

  /** Disable drag */
  readOnly?: boolean;
}

// ============================================
// Drag & Drop Types
// ============================================

/**
 * Drag event data
 */
export interface DragEventData {
  /** Record ID being dragged */
  recordId: string;

  /** Source column ID */
  sourceColumnId: string;

  /** Destination column ID */
  destinationColumnId: string;

  /** New status value (destination column value) */
  newStatusValue: string;
}

/**
 * Column data for sortable context
 */
export interface ColumnData extends Record<string, unknown> {
  /** Column ID (status field value) */
  id: string;

  /** Column name (for shadcn kanban compatibility) */
  name: string;

  /** Column title */
  title: string;

  /** Record IDs in this column */
  recordIds: string[];

  /** Optional styling */
  color?: string;
  textColor?: string;
}
