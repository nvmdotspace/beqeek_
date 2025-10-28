"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

import type { ActiveTableRecord, ActiveFieldConfig } from "../../types";
import { DataTableRowActions } from "./data-table-row-actions";

/**
 * Format field value for display based on field type
 */
function formatFieldValue(value: unknown, field: ActiveFieldConfig): React.ReactNode {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  switch (field.type) {
    case "SHORT_TEXT":
    case "RICH_TEXT":
    case "EMAIL":
    case "URL":
      return <span className="max-w-[300px] truncate text-sm">{String(value)}</span>;

    case "INTEGER":
    case "NUMERIC":
      return <span className="font-mono text-sm tabular-nums">{Number(value).toLocaleString()}</span>;

    case "DATE":
      try {
        const date = new Date(value as string);
        return <span className="text-sm tabular-nums">{date.toLocaleDateString()}</span>;
      } catch {
        return <span className="text-sm text-muted-foreground">{String(value)}</span>;
      }

    case "DATETIME":
      try {
        const datetime = new Date(value as string);
        return <span className="text-sm tabular-nums">{datetime.toLocaleString()}</span>;
      } catch {
        return <span className="text-sm text-muted-foreground">{String(value)}</span>;
      }

    case "SELECT_ONE": {
      // Find option configuration for styling
      const option = field.options?.find((opt) => opt.value === value);
      if (option) {
        return (
          <Badge
            variant="secondary"
            style={{
              backgroundColor: option.background_color,
              color: option.text_color,
            }}
          >
            {option.text}
          </Badge>
        );
      }
      return <span>{String(value)}</span>;
    }

    case "SELECT_LIST": {
      // Multiple select values
      const values = Array.isArray(value) ? value : [value];
      return (
        <div className="flex flex-wrap gap-1">
          {values.map((val, idx) => {
            const opt = field.options?.find((o) => o.value === val);
            return (
              <Badge
                key={idx}
                variant="secondary"
                style={{
                  backgroundColor: opt?.background_color,
                  color: opt?.text_color,
                }}
              >
                {opt?.text || String(val)}
              </Badge>
            );
          })}
        </div>
      );
    }

    case "CHECKBOX":
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={Boolean(value)}
            readOnly
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      );

    case "RATING":
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className={cn(idx < Number(value) ? "text-yellow-500" : "text-gray-300")}>
              ★
            </span>
          ))}
        </div>
      );

    case "ATTACHMENT":
      // Display file count or file names
      if (Array.isArray(value)) {
        return <span className="text-sm">{value.length} file(s)</span>;
      }
      return <span className="text-sm">1 file</span>;

    case "USER":
      // Display user ID or name
      return <span className="text-sm">{String(value)}</span>;

    case "FORMULA":
    case "COMPUTED":
      return <span className="font-mono text-sm">{String(value)}</span>;

    default:
      // Fallback for unknown types
      if (typeof value === "object") {
        return <span className="text-xs text-muted-foreground">Complex value</span>;
      }
      return <span>{String(value)}</span>;
  }
}

/**
 * Create sortable column header
 */
function SortableHeader({ column, children, align }: { column: any; children: React.ReactNode; align?: 'left' | 'right' }) {
  if (!column.getCanSort()) {
    return <div className={cn("flex items-center gap-2 text-sm font-semibold", align === 'right' && 'justify-end')}>{children}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 gap-2 text-sm font-semibold hover:bg-transparent data-[state=open]:bg-accent",
        align === 'right' && 'flex-row-reverse'
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{children}</span>
      {sorted === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
      ) : sorted === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}

/**
 * Create column definitions from Active Table field configurations
 *
 * @param fields - Array of field configurations from Active Table
 * @param options - Optional configuration for columns
 * @returns Array of TanStack Table column definitions
 */
export function createColumns(
  fields: ActiveFieldConfig[],
  options?: {
    /** Enable row actions (edit, delete, comments) */
    enableRowActions?: boolean;
    /** Callback when edit is clicked */
    onEdit?: (record: ActiveTableRecord) => void;
    /** Callback when delete is clicked */
    onDelete?: (record: ActiveTableRecord) => void;
    /** Callback when view comments is clicked */
    onViewComments?: (record: ActiveTableRecord) => void;
  }
): ColumnDef<ActiveTableRecord>[] {
  const columns: ColumnDef<ActiveTableRecord>[] = [
    // ID column (always visible, sticky)
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium text-muted-foreground">{row.original.id}</div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
  ];

  // Add field columns
  for (const field of fields) {
    const isNumeric = field.type === "INTEGER" || field.type === "NUMERIC";
    const isDate = field.type === "DATE" || field.type === "DATETIME";
    const alignRight = isNumeric || isDate;

    columns.push({
      accessorFn: (row) => row.record[field.name],
      id: field.name,
      header: ({ column }) => (
        <SortableHeader column={column} align={alignRight ? 'right' : 'left'}>
          {field.label}
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const value = row.original.record[field.name];
        return (
          <div className={cn(alignRight && "text-right")}>
            {formatFieldValue(value, field)}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    });
  }

  // Add updated_at column
  columns.push({
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableHeader column={column} align="right">Updated</SortableHeader>,
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;
      if (!updatedAt) {
        return <div className="text-right text-sm text-muted-foreground">—</div>;
      }
      try {
        const date = new Date(updatedAt);
        return (
          <div className="flex flex-col items-end text-right">
            <span className="text-sm tabular-nums">{date.toLocaleDateString()}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{date.toLocaleTimeString()}</span>
          </div>
        );
      } catch {
        return <div className="text-right text-sm text-muted-foreground">Invalid date</div>;
      }
    },
    enableSorting: true,
    enableHiding: true,
  });

  // Add row actions column if enabled
  if (options?.enableRowActions) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          record={row.original}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
          onViewComments={options.onViewComments}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  return columns;
}
