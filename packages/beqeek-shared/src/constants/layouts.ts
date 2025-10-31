/**
 * Active Table Layout Constants
 * Based on active-table-config-functional-spec.md Sections 2.4 and 2.5
 */

// ============================================
// Record List Layouts (Section 2.4)
// ============================================

/**
 * Generic table layout - Standard table view
 *
 * Each record is a row, each field is a column.
 * Uses displayFields property.
 */
export const RECORD_LIST_LAYOUT_GENERIC_TABLE = 'generic-table' as const;

/**
 * Head column layout - Card-style compact view
 *
 * Each record displayed as a summarized info line.
 * Suitable for mobile or tight spaces.
 * Uses titleField, subLineFields, tailFields properties.
 */
export const RECORD_LIST_LAYOUT_HEAD_COLUMN = 'head-column' as const;

export const RECORD_LIST_LAYOUTS = [RECORD_LIST_LAYOUT_GENERIC_TABLE, RECORD_LIST_LAYOUT_HEAD_COLUMN] as const;

export type RecordListLayout = (typeof RECORD_LIST_LAYOUTS)[number];

// ============================================
// Record Detail Layouts (Section 2.5)
// ============================================

/**
 * Head detail layout - Single column view
 *
 * Similar to head-column but fields stacked vertically.
 * Suitable for narrow screens.
 * Uses titleField, subLineFields, tailFields properties.
 */
export const RECORD_DETAIL_LAYOUT_HEAD_DETAIL = 'head-detail' as const;

/**
 * Two column detail layout - Wide screen optimized
 *
 * Information split into left and right columns.
 * Uses headTitleField, headSubLineFields, column1Fields, column2Fields properties.
 */
export const RECORD_DETAIL_LAYOUT_TWO_COLUMN = 'two-column-detail' as const;

export const RECORD_DETAIL_LAYOUTS = [RECORD_DETAIL_LAYOUT_HEAD_DETAIL, RECORD_DETAIL_LAYOUT_TWO_COLUMN] as const;

export type RecordDetailLayout = (typeof RECORD_DETAIL_LAYOUTS)[number];

// ============================================
// Comments Position (Section 2.5.3)
// ============================================

/**
 * Right panel - Display comments in a separate column on the right
 */
export const COMMENTS_POSITION_RIGHT_PANEL = 'right-panel' as const;

/**
 * Hidden - Hide comments section
 */
export const COMMENTS_POSITION_HIDDEN = 'hidden' as const;

export const COMMENTS_POSITIONS = [COMMENTS_POSITION_RIGHT_PANEL, COMMENTS_POSITION_HIDDEN] as const;

export type CommentsPosition = (typeof COMMENTS_POSITIONS)[number];

// ============================================
// Sort Orders
// ============================================

/**
 * Ascending sort order (oldest first)
 */
export const SORT_ORDER_ASC = 'asc' as const;

/**
 * Descending sort order (newest first)
 */
export const SORT_ORDER_DESC = 'desc' as const;

export const SORT_ORDERS = [SORT_ORDER_ASC, SORT_ORDER_DESC] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];
