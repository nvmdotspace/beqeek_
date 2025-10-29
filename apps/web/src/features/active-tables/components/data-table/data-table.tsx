"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import type { ActiveTableRecord, ActiveTable } from "../../types";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

/**
 * Props for DataTable component
 */
export interface DataTableProps {
  /** Table configuration with fields and settings */
  table: ActiveTable;

  /** Array of decrypted records to display */
  records: ActiveTableRecord[];

  /** Column definitions for the table */
  columns: ColumnDef<ActiveTableRecord>[];

  /** Whether data is loading */
  isLoading?: boolean;

  /** Whether E2EE encryption is enabled */
  isE2EEEnabled?: boolean;

  /** Encryption key status */
  hasEncryptionKey?: boolean;

  /** Next page cursor for pagination */
  nextCursor?: string | null;

  /** Previous page cursor for pagination */
  previousCursor?: string | null;

  /** Callback when page changes */
  onPageChange?: (cursor: string | null, direction: "next" | "previous") => void;

  /** Callback when refresh is clicked */
  onRefresh?: () => void;

  /** Callback when create record is clicked */
  onCreate?: () => void;

  /** Total number of records (optional) */
  totalRecords?: number;

  /** Hide the built-in toolbar (use when parent has toolbar) */
  hideToolbar?: boolean;
}

/**
 * DataTable component with TanStack Table integration
 *
 * Features:
 * - Automatic decryption via use-decrypted-records hook
 * - Sorting, filtering, column visibility
 * - Cursor-based pagination
 * - Row actions (edit, delete, comments)
 * - Responsive design with mobile support
 * - Loading and error states
 *
 * @example
 * ```tsx
 * const { records: decryptedRecords } = useDecryptedRecords({
 *   records,
 *   fields: table.config.fields,
 *   encryptionKey,
 *   isE2EEEnabled: table.config.e2eeEncryption,
 * });
 *
 * const columns = createColumns(table.config.fields);
 *
 * <DataTable
 *   table={table}
 *   records={decryptedRecords}
 *   columns={columns}
 *   isLoading={isLoading}
 *   onRefresh={refetch}
 * />
 * ```
 */
export function DataTable({
  table: activeTable,
  records,
  columns,
  isLoading = false,
  isE2EEEnabled = false,
  hasEncryptionKey = false,
  nextCursor,
  previousCursor,
  onPageChange,
  onRefresh,
  onCreate,
  totalRecords,
  hideToolbar = false,
}: DataTableProps) {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Initialize TanStack Table
  const table = useReactTable({
    data: records,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Custom pagination handling for cursor-based API
    manualPagination: true,
  });

  // Loading state
  if (isLoading && records.length === 0) {
    return (
      <div className="space-y-4">
        {!hideToolbar && (
          <DataTableToolbar
            table={table}
            activeTable={activeTable}
            isLoading={isLoading}
            onRefresh={onRefresh}
            onCreate={onCreate}
          />
        )}
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Loading records...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && records.length === 0) {
    return (
      <div className="space-y-4">
        {!hideToolbar && (
          <DataTableToolbar
            table={table}
            activeTable={activeTable}
            isLoading={isLoading}
            onRefresh={onRefresh}
            onCreate={onCreate}
          />
        )}
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">No records found</p>
              <p className="text-sm text-muted-foreground">
                {isE2EEEnabled && !hasEncryptionKey
                  ? "Please provide encryption key to view records"
                  : "Create your first record to get started"}
              </p>
            </div>
            {onCreate && (!isE2EEEnabled || hasEncryptionKey) && (
              <button
                onClick={onCreate}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Create Record
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar with search, filters, and actions */}
      {!hideToolbar && (
        <DataTableToolbar
          table={table}
          activeTable={activeTable}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onCreate={onCreate}
        />
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <span className="text-sm text-muted-foreground">No results found.</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        table={table}
        nextCursor={nextCursor}
        previousCursor={previousCursor}
        onPageChange={onPageChange}
        totalRecords={totalRecords}
      />
    </div>
  );
}
