"use client";

import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import type { ActiveTableRecord } from "../../types";

/**
 * Props for DataTablePagination component
 */
export interface DataTablePaginationProps {
  /** TanStack Table instance */
  table: Table<ActiveTableRecord>;

  /** Next page cursor from API */
  nextCursor?: string | null;

  /** Previous page cursor from API */
  previousCursor?: string | null;

  /** Callback when page changes */
  onPageChange?: (cursor: string | null, direction: "next" | "previous") => void;

  /** Total number of records (optional) */
  totalRecords?: number;
}

/**
 * DataTablePagination component with cursor-based navigation
 *
 * Features:
 * - Cursor-based pagination (next/previous)
 * - Row count display
 * - Navigation buttons
 * - Disabled states
 *
 * @example
 * ```tsx
 * <DataTablePagination
 *   table={table}
 *   nextCursor={data?.next_id}
 *   previousCursor={data?.previous_id}
 *   onPageChange={(cursor, direction) => {
 *     if (direction === "next" && cursor) {
 *       fetchNextPage(cursor);
 *     } else if (direction === "previous" && cursor) {
 *       fetchPreviousPage(cursor);
 *     }
 *   }}
 * />
 * ```
 */
export function DataTablePagination({
  table,
  nextCursor,
  previousCursor,
  onPageChange,
  totalRecords,
}: DataTablePaginationProps) {
  const currentRows = table.getFilteredRowModel().rows.length;

  // Handle previous page
  const handlePrevious = () => {
    if (previousCursor && onPageChange) {
      onPageChange(previousCursor, "previous");
    }
  };

  // Handle next page
  const handleNext = () => {
    if (nextCursor && onPageChange) {
      onPageChange(nextCursor, "next");
    }
  };

  return (
    <div className="flex items-center justify-between px-2">
      {/* Row count info */}
      <div className="flex-1 text-sm text-muted-foreground">
        {currentRows > 0 ? (
          <span>
            Showing {currentRows} record{currentRows !== 1 ? "s" : ""}
            {totalRecords && <span> of {totalRecords.toLocaleString()}</span>}
          </span>
        ) : (
          <span>No records</span>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!previousCursor || !onPageChange}
          className="h-8 w-8 p-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!nextCursor || !onPageChange}
          className="h-8 w-8 p-0"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
