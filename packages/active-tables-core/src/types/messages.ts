/**
 * i18n Messages interface for Active Tables
 *
 * This interface defines all translatable strings used by Active Tables components.
 * Parent applications should provide translations via props.
 *
 * All fields are optional with English fallbacks provided.
 */

export interface ActiveTablesMessages {
  // ============================================
  // Common Actions
  // ============================================
  save?: string;
  cancel?: string;
  delete?: string;
  edit?: string;
  add?: string;
  remove?: string;
  create?: string;
  update?: string;
  confirm?: string;
  close?: string;
  back?: string;
  next?: string;
  previous?: string;
  submit?: string;
  reset?: string;
  clear?: string;
  apply?: string;
  search?: string;
  filter?: string;
  sort?: string;
  export?: string;
  import?: string;
  refresh?: string;
  reload?: string;

  // ============================================
  // Record Actions
  // ============================================
  addRecord?: string;
  editRecord?: string;
  deleteRecord?: string;
  viewRecord?: string;
  duplicateRecord?: string;
  saveRecord?: string;
  cancelEdit?: string;

  // ============================================
  // States & Status
  // ============================================
  loading?: string;
  saving?: string;
  deleting?: string;
  processing?: string;
  success?: string;
  error?: string;
  warning?: string;
  info?: string;

  // ============================================
  // Empty States
  // ============================================
  noRecordsFound?: string;
  noRecordsYet?: string;
  noSearchResults?: string;
  noDataAvailable?: string;
  createFirstRecord?: string;
  emptyValue?: string;
  noRecordsDescription?: string;

  // ============================================
  // Errors
  // ============================================
  errorLoadingRecords?: string;
  errorSavingRecord?: string;
  errorDeletingRecord?: string;
  errorInvalidData?: string;
  errorRequiredField?: string;
  errorEncryptionFailed?: string;
  errorDecryptionFailed?: string;
  errorPermissionDenied?: string;
  errorNetworkError?: string;
  retry?: string;
  recordNotFound?: string;
  recordNotFoundDescription?: string;

  // ============================================
  // Confirmations
  // ============================================
  confirmDelete?: string;
  confirmDeleteRecord?: string;
  confirmUnsavedChanges?: string;
  confirmClearFilters?: string;
  areYouSure?: string;
  cannotBeUndone?: string;

  // ============================================
  // Filters & Search
  // ============================================
  searchPlaceholder?: string;
  filterBy?: string;
  clearFilters?: string;
  activeFilters?: string;
  noFiltersApplied?: string;
  sortBy?: string;
  sortAscending?: string;
  sortDescending?: string;

  // ============================================
  // Pagination
  // ============================================
  page?: string;
  of?: string;
  records?: string;
  showing?: string;
  to?: string;
  loadMore?: string;
  previousPage?: string;
  nextPage?: string;

  // ============================================
  // Selection
  // ============================================
  selected?: string;
  selectAll?: string;
  deselectAll?: string;
  selectedRecords?: string;

  // ============================================
  // Views
  // ============================================
  listView?: string;
  cardView?: string;
  tableView?: string;
  kanbanView?: string;
  ganttView?: string;
  calendarView?: string;

  // ============================================
  // Fields
  // ============================================
  fieldRequired?: string;
  fieldInvalid?: string;
  fieldTooLong?: string;
  fieldTooShort?: string;
  fieldMustBeNumber?: string;
  fieldMustBeEmail?: string;
  fieldMustBeUrl?: string;
  fieldMustBeDate?: string;

  // ============================================
  // Comments
  // ============================================
  comments?: string;
  addComment?: string;
  editComment?: string;
  deleteComment?: string;
  deleteCommentConfirm?: string;
  noComments?: string;
  writeComment?: string;
  postComment?: string;
  loadingComments?: string;
  commentsCount?: string;
  addCommentPlaceholder?: string;
  edited?: string;

  // ============================================
  // Permissions
  // ============================================
  noPermission?: string;
  noAccessPermission?: string;
  noUpdatePermission?: string;
  noDeletePermission?: string;

  // ============================================
  // Encryption
  // ============================================
  encryptionEnabled?: string;
  encryptionDisabled?: string;
  enterEncryptionKey?: string;
  encryptionKeyRequired?: string;
  encryptionKeyInvalid?: string;
  encryptionKeyMismatch?: string;
  unlockWithKey?: string;

  // ============================================
  // Drag & Drop (Kanban)
  // ============================================
  dragToMove?: string;
  dropHere?: string;
  moveToColumn?: string;

  // ============================================
  // File Upload
  // ============================================
  uploadFile?: string;
  chooseFile?: string;
  dropFile?: string;
  fileUploading?: string;
  fileUploaded?: string;
  uploadFailed?: string;

  // ============================================
  // Dates & Times
  // ============================================
  today?: string;
  yesterday?: string;
  tomorrow?: string;
  thisWeek?: string;
  lastWeek?: string;
  thisMonth?: string;
  lastMonth?: string;
  customRange?: string;

  // ============================================
  // Miscellaneous
  // ============================================
  moreOptions?: string;
  showMore?: string;
  showLess?: string;
  expandAll?: string;
  collapseAll?: string;
  copy?: string;
  copied?: string;
  download?: string;
  print?: string;
  share?: string;
  yes?: string;
  no?: string;
  scrollHorizontally?: string;
  selectPlaceholder?: string;
  multiSelectHint?: string;
}

/**
 * Type helper to ensure all message keys are strings
 */
export type MessageKey = keyof ActiveTablesMessages;

/**
 * Partial messages (all optional)
 */
export type PartialMessages = Partial<ActiveTablesMessages>;
