/**
 * Default English messages for Active Tables
 *
 * These are used as fallbacks when no translations are provided
 */

import type { ActiveTablesMessages } from '../types/messages.js';

/**
 * Complete English message set
 */
export const DEFAULT_MESSAGES: Required<ActiveTablesMessages> = {
  // Common Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  remove: 'Remove',
  create: 'Create',
  update: 'Update',
  confirm: 'Confirm',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  submit: 'Submit',
  reset: 'Reset',
  clear: 'Clear',
  apply: 'Apply',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  export: 'Export',
  import: 'Import',
  refresh: 'Refresh',
  reload: 'Reload',

  // Record Actions
  addRecord: 'Add Record',
  editRecord: 'Edit Record',
  deleteRecord: 'Delete Record',
  viewRecord: 'View Record',
  duplicateRecord: 'Duplicate Record',
  saveRecord: 'Save Record',
  cancelEdit: 'Cancel Edit',

  // States & Status
  loading: 'Loading...',
  saving: 'Saving...',
  deleting: 'Deleting...',
  processing: 'Processing...',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',

  // Empty States
  noRecordsFound: 'No records found',
  noRecordsYet: 'No records yet',
  noSearchResults: 'No search results',
  noDataAvailable: 'No data available',
  createFirstRecord: 'Create your first record',
  emptyValue: '—',
  noRecordsDescription: 'Get started by creating your first record',

  // Errors
  errorLoadingRecords: 'Error loading records',
  errorSavingRecord: 'Error saving record',
  errorDeletingRecord: 'Error deleting record',
  errorInvalidData: 'Invalid data',
  errorRequiredField: 'This field is required',
  errorEncryptionFailed: 'Encryption failed',
  errorDecryptionFailed: 'Decryption failed',
  errorPermissionDenied: 'Permission denied',
  errorNetworkError: 'Network error',
  retry: 'Retry',
  recordNotFound: 'Record not found',
  recordNotFoundDescription: 'The record you are looking for does not exist or has been deleted',

  // Confirmations
  confirmDelete: 'Are you sure you want to delete?',
  confirmDeleteRecord: 'Are you sure you want to delete this record?',
  confirmUnsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
  confirmClearFilters: 'Clear all filters?',
  areYouSure: 'Are you sure?',
  cannotBeUndone: 'This action cannot be undone',

  // Filters & Search
  searchPlaceholder: 'Search...',
  filterBy: 'Filter by',
  clearFilters: 'Clear filters',
  activeFilters: 'Active filters',
  noFiltersApplied: 'No filters applied',
  sortBy: 'Sort by',
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',

  // Pagination
  page: 'Page',
  of: 'of',
  records: 'records',
  showing: 'Showing',
  to: 'to',
  loadMore: 'Load more',
  previousPage: 'Previous page',
  nextPage: 'Next page',

  // Selection
  selected: 'selected',
  selectAll: 'Select all',
  deselectAll: 'Deselect all',
  selectedRecords: 'Selected records',

  // Views
  listView: 'List view',
  cardView: 'Card view',
  tableView: 'Table view',
  kanbanView: 'Kanban view',
  ganttView: 'Gantt view',
  calendarView: 'Calendar view',

  // Fields
  fieldRequired: 'This field is required',
  fieldInvalid: 'Invalid value',
  fieldTooLong: 'Value is too long',
  fieldTooShort: 'Value is too short',
  fieldMustBeNumber: 'Must be a number',
  fieldMustBeEmail: 'Must be a valid email',
  fieldMustBeUrl: 'Must be a valid URL',
  fieldMustBeDate: 'Must be a valid date',

  // Comments
  comments: 'Comments',
  addComment: 'Add comment',
  editComment: 'Edit comment',
  deleteComment: 'Delete comment',
  deleteCommentConfirm: 'Are you sure you want to delete this comment?',
  noComments: 'No comments yet',
  writeComment: 'Write a comment...',
  postComment: 'Post comment',
  loadingComments: 'Loading comments...',
  commentsCount: 'comments',
  addCommentPlaceholder: 'Write a comment...',
  edited: 'edited',

  // Permissions
  noPermission: 'No permission',
  noAccessPermission: 'You don\'t have permission to access this',
  noUpdatePermission: 'You don\'t have permission to edit this',
  noDeletePermission: 'You don\'t have permission to delete this',

  // Encryption
  encryptionEnabled: 'Encryption enabled',
  encryptionDisabled: 'Encryption disabled',
  enterEncryptionKey: 'Enter encryption key',
  encryptionKeyRequired: 'Encryption key is required',
  encryptionKeyInvalid: 'Invalid encryption key',
  encryptionKeyMismatch: 'Encryption key mismatch',
  unlockWithKey: 'Unlock with encryption key',

  // Drag & Drop
  dragToMove: 'Drag to move',
  dropHere: 'Drop here',
  moveToColumn: 'Move to column',

  // File Upload
  uploadFile: 'Upload file',
  chooseFile: 'Choose file',
  dropFile: 'Drop file here',
  fileUploading: 'Uploading...',
  fileUploaded: 'File uploaded',
  uploadFailed: 'Upload failed',

  // Dates & Times
  today: 'Today',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  thisWeek: 'This week',
  lastWeek: 'Last week',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  customRange: 'Custom range',

  // Miscellaneous
  moreOptions: 'More options',
  showMore: 'Show more',
  showLess: 'Show less',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  copy: 'Copy',
  copied: 'Copied!',
  download: 'Download',
  print: 'Print',
  share: 'Share',
  yes: 'Yes',
  no: 'No',
  scrollHorizontally: 'Scroll horizontally to see all columns',
  selectPlaceholder: 'Select an option',
  multiSelectHint: 'Hold Ctrl/Cmd to select multiple options',
};

/**
 * Get message with fallback
 */
export function getMessage(
  key: keyof ActiveTablesMessages,
  messages?: Partial<ActiveTablesMessages>
): string {
  return messages?.[key] ?? DEFAULT_MESSAGES[key];
}

/**
 * Merge custom messages with defaults
 */
export function mergeMessages(
  custom?: Partial<ActiveTablesMessages>
): Required<ActiveTablesMessages> {
  return {
    ...DEFAULT_MESSAGES,
    ...custom,
  };
}
