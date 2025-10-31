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

  // Get all visible fields (title, subline, tail)
  const visibleFields = useMemo(() => {
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

          return (
            <div className="py-2">
              <FieldRenderer
                field={fieldConfig}
                value={value}
                mode="display"
                table={tableMetadata}
                currentUser={currentUser}
                workspaceUsers={workspaceUsers}
                messages={messages}
              />
            </div>
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
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center gap-2 ${
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}

                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '⇅'}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => {
            const isSelected = selectedIds.includes(row.original.id);

            return (
              <tr
                key={row.id}
                onClick={() => onRecordClick?.(row.original)}
                className={`
                  hover:bg-gray-50 transition-colors cursor-pointer
                  ${isSelected ? 'bg-blue-50' : ''}
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile-responsive message */}
      <div className="mt-4 text-sm text-gray-500 text-center md:hidden">
        {messages?.scrollHorizontally || 'Scroll horizontally to see more columns'}
      </div>
    </div>
  );
}
