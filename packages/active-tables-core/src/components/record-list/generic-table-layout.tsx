/**
 * GenericTableLayout Component
 *
 * Table-based list layout using TanStack Table
 * Features: sortable columns, row selection, responsive design
 */

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import type { LayoutProps } from './record-list-props.js';
import type { TableRecord } from '../../types/record.js';
import { FieldRenderer } from '../fields/field-renderer.js';
import { useRecordDecryption } from '../../hooks/use-encryption.js';
import { useState } from 'react';

export function GenericTableLayout(props: LayoutProps) {
  const {
    table: tableMetadata,
    records,
    config,
    onRecordClick,
    selectedIds = [],
    onSelectionChange,
    currentUser,
    workspaceUsers,
    messages,
    encryptionKey,
    className = '',
  } = props;

  const { decryptRecord } = useRecordDecryption(tableMetadata, encryptionKey);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get all visible fields based on layout type
  const visibleFields = useMemo(() => {
    // For generic-table layout, use displayFields array directly (as per spec section 2.4)
    if (config.displayFields && Array.isArray(config.displayFields)) {
      return config.displayFields;
    }

    // For head-column layout, combine title, subline, and tail fields
    const fields = new Set<string>();

    if (config.titleField) fields.add(config.titleField);
    config.subLineFields?.forEach((f: string) => fields.add(f));
    config.tailFields?.forEach((f: string) => fields.add(f));

    return Array.from(fields);
  }, [config]);

  // Create table columns
  const columns = useMemo<ColumnDef<TableRecord>[]>(() => {
    const cols: ColumnDef<TableRecord>[] = [];

    // Selection column (if enabled)
    if (onSelectionChange) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={(e) => {
              e.stopPropagation();
              const isSelected = selectedIds.includes(row.original.id);
              const newSelection = isSelected
                ? selectedIds.filter((id) => id !== row.original.id)
                : [...selectedIds, row.original.id];
              onSelectionChange?.(newSelection);
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        size: 50,
        enableSorting: false,
      });
    }

    // Data columns
    visibleFields.forEach((fieldName) => {
      const fieldConfig = tableMetadata.config.fields.find((f) => f.name === fieldName);
      if (!fieldConfig) return;

      cols.push({
        id: fieldName,
        accessorFn: (row) => (row.data || row.record)[fieldName],
        header: fieldConfig.label,
        cell: ({ row }) => {
          const decryptedRecord = decryptRecord(row.original);
          const value = decryptedRecord.data![fieldName];

          // Handle empty values with minimal styling
          if (value === null || value === undefined || value === '') {
            return <span className="text-muted-foreground/50">—</span>;
          }

          return (
            <FieldRenderer
              field={fieldConfig}
              value={value}
              mode="display"
              table={tableMetadata}
              currentUser={currentUser}
              workspaceUsers={workspaceUsers}
              messages={messages}
            />
          );
        },
        enableSorting: true,
      });
    });

    return cols;
  }, [
    visibleFields,
    tableMetadata,
    selectedIds,
    onSelectionChange,
    decryptRecord,
    currentUser,
    workspaceUsers,
    messages,
  ]);

  // Create table instance
  const table = useReactTable({
    data: records,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className={`w-full ${className}`}>
      {/* shadcn-style table wrapper */}
      <div className="rounded-md border border-border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            {/* Minimal header following shadcn pattern */}
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                            header.column.getCanSort()
                              ? 'hover:bg-accent hover:text-accent-foreground h-8 px-2 -ml-2'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {header.column.getCanSort() && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1 h-3.5 w-3.5 opacity-50"
                            >
                              {{
                                asc: <path d="M12 19V5M5 12l7-7 7 7" />,
                                desc: <path d="M12 5v14M5 12l7 7 7-7" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <>
                                  <path d="m7 15 5 5 5-5" />
                                  <path d="m7 9 5-5 5 5" />
                                </>
                              )}
                            </svg>
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Compact table body */}
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows.map((row) => {
                const isSelected = selectedIds.includes(row.original.id);

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRecordClick?.(row.original)}
                    data-state={isSelected ? 'selected' : undefined}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {table.getRowModel().rows.length === 0 && (
          <div className="flex h-24 items-center justify-center p-4 text-center text-sm text-muted-foreground">
            {messages?.noRecordsFound || 'No records found'}
          </div>
        )}
      </div>

      {/* Mobile hint */}
      <div className="flex items-center justify-center gap-1 py-4 text-xs text-muted-foreground md:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        {messages?.scrollHorizontally || 'Scroll to see more'}
      </div>
    </div>
  );
}
