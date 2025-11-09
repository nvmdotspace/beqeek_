/**
 * GenericTableLayout Component
 *
 * Table-based list layout using TanStack Table
 * Features: sortable columns, row selection, responsive design
 */

import { useMemo, useState, useEffect } from 'react';
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
import { FieldListRenderer } from '../fields/field-list-renderer.js';
import { useRecordDecryption } from '../../hooks/use-encryption.js';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Mobile Card View Component
function MobileCardView({
  records,
  visibleFields,
  tableMetadata,
  onRecordClick,
  selectedIds = [],
  onSelectionChange,
  decryptRecord,
  currentUser,
  workspaceUsers,
  messages,
}: {
  records: TableRecord[];
  visibleFields: string[];
  tableMetadata: any;
  onRecordClick?: (record: TableRecord) => void;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  decryptRecord: (record: TableRecord) => TableRecord;
  currentUser?: any;
  workspaceUsers?: any;
  messages?: any;
}) {
  return (
    <div className="space-y-3">
      {records.map((record) => {
        const decryptedRecord = decryptRecord(record);
        const isSelected = selectedIds.includes(record.id);

        return (
          <div
            key={record.id}
            role="button"
            tabIndex={0}
            onClick={() => onRecordClick?.(record)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRecordClick?.(record);
              }
            }}
            className={`
              bg-card text-card-foreground rounded-lg border border-border p-3
              cursor-pointer transition-colors hover:bg-accent/50
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
              ${isSelected ? 'bg-accent border-accent-foreground/20' : ''}
            `}
          >
            {onSelectionChange && (
              <div className="flex items-start gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSelection = isSelected
                      ? selectedIds.filter((id) => id !== record.id)
                      : [...selectedIds, record.id];
                    onSelectionChange(newSelection);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-1 focus:ring-ring"
                />
                <div className="flex-1 min-w-0">
                  <div className="space-y-2">
                    {visibleFields.slice(0, 3).map((fieldName) => {
                      const fieldConfig = tableMetadata.config.fields.find((f: any) => f.name === fieldName);
                      if (!fieldConfig) return null;

                      const value = decryptedRecord.data![fieldName];
                      const isFirst = visibleFields.indexOf(fieldName) === 0;

                      return (
                        <div
                          key={fieldName}
                          className={isFirst ? 'text-sm font-medium' : 'text-xs text-muted-foreground'}
                        >
                          {!isFirst && <span className="font-medium">{fieldConfig.label}: </span>}
                          {value === null || value === undefined || value === '' ? (
                            <span className="text-muted-foreground/50">—</span>
                          ) : (
                            <FieldListRenderer
                              field={fieldConfig}
                              value={value}
                              table={tableMetadata}
                              currentUser={currentUser}
                              workspaceUsers={workspaceUsers}
                              messages={messages}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!onSelectionChange && (
              <div className="space-y-2">
                {visibleFields.slice(0, 3).map((fieldName) => {
                  const fieldConfig = tableMetadata.config.fields.find((f: any) => f.name === fieldName);
                  if (!fieldConfig) return null;

                  const value = decryptedRecord.data![fieldName];
                  const isFirst = visibleFields.indexOf(fieldName) === 0;

                  return (
                    <div key={fieldName} className={isFirst ? 'text-sm font-medium' : 'text-xs text-muted-foreground'}>
                      {!isFirst && <span className="font-medium">{fieldConfig.label}: </span>}
                      {value === null || value === undefined || value === '' ? (
                        <span className="text-muted-foreground/50">—</span>
                      ) : (
                        <FieldListRenderer
                          field={fieldConfig}
                          value={value}
                          table={tableMetadata}
                          currentUser={currentUser}
                          workspaceUsers={workspaceUsers}
                          messages={messages}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const isMobile = useIsMobile();

  // Get all visible fields based on layout type and field ordering
  const visibleFields = useMemo(() => {
    // Use fieldOrder if available (advanced configuration)
    if (config.fieldOrder && config.fieldOrder.length > 0) {
      // Filter out mobile-hidden fields if on mobile
      const filteredFields = isMobile ? config.fieldOrder.filter((field) => !field.hideOnMobile) : config.fieldOrder;

      // Sort by priority (higher priority first) or keep original order
      return filteredFields.sort((a, b) => (b.priority || 0) - (a.priority || 0)).map((field) => field.fieldName);
    }

    // Fallback to displayFields array (as per spec section 2.4)
    if (config.displayFields && Array.isArray(config.displayFields)) {
      return config.displayFields;
    }

    // For head-column layout, combine title, subline, and tail fields
    const fields = new Set<string>();

    if (config.titleField) fields.add(config.titleField);
    config.subLineFields?.forEach((f: string) => fields.add(f));
    config.tailFields?.forEach((f: string) => fields.add(f));

    return Array.from(fields);
  }, [config, isMobile]);

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

      // Get field order config for this field
      const fieldOrderConfig = config.fieldOrder?.find((f) => f.fieldName === fieldName);

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
            <FieldListRenderer
              field={fieldConfig}
              value={value}
              table={tableMetadata}
              currentUser={currentUser}
              workspaceUsers={workspaceUsers}
              messages={messages}
            />
          );
        },
        enableSorting: fieldOrderConfig?.sortable !== false, // Default true, can be overridden
        size: fieldOrderConfig?.width, // Custom width if specified
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

  // Use mobile card view on small screens
  if (isMobile) {
    return (
      <div className={className}>
        <MobileCardView
          records={records}
          visibleFields={visibleFields}
          tableMetadata={tableMetadata}
          onRecordClick={onRecordClick}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          decryptRecord={decryptRecord}
          currentUser={currentUser}
          workspaceUsers={workspaceUsers}
          messages={messages}
        />
      </div>
    );
  }

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
                          } ${header.column.getIsSorted() ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {header.column.getCanSort() && (
                            <div className="flex flex-col ml-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-3 w-3 transition-colors ${
                                  header.column.getIsSorted() === 'asc'
                                    ? 'text-primary'
                                    : header.column.getIsSorted() === 'desc'
                                      ? 'text-muted-foreground'
                                      : 'opacity-30'
                                }`}
                              >
                                <path d="M12 19V5M5 12l7-7 7 7" />
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-3 w-3 -mt-1 transition-colors ${
                                  header.column.getIsSorted() === 'desc'
                                    ? 'text-primary'
                                    : header.column.getIsSorted() === 'asc'
                                      ? 'text-muted-foreground'
                                      : 'opacity-30'
                                }`}
                              >
                                <path d="M12 5v14M5 12l7 7 7-7" />
                              </svg>
                            </div>
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

      {/* Mobile hint - only show on larger screens */}
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
