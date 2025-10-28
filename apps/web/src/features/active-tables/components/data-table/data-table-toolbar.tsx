"use client";

import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { Plus, RefreshCw, Search, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import type { ActiveTable, ActiveTableRecord } from "../../types";

/**
 * Props for DataTableToolbar component
 */
export interface DataTableToolbarProps {
  /** TanStack Table instance */
  table: Table<ActiveTableRecord>;

  /** Active Table configuration */
  activeTable?: ActiveTable;

  /** Whether data is loading */
  isLoading?: boolean;

  /** Callback when refresh is clicked */
  onRefresh?: () => void;

  /** Callback when create record is clicked */
  onCreate?: () => void;
}

/**
 * DataTableToolbar component with search, filters, and actions
 *
 * Features:
 * - Search input (disabled with "coming soon" message)
 * - Refresh button to reload data
 * - Create record button
 * - Column visibility toggle (future)
 * - Filter dropdowns (future)
 */
export function DataTableToolbar({
  table,
  isLoading = false,
  onRefresh,
  onCreate,
}: DataTableToolbarProps) {
  const [searchValue, setSearchValue] = React.useState("");

  const isFiltered = table.getState().columnFilters.length > 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleResetFilters = () => {
    table.resetColumnFilters();
    setSearchValue("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search records... (coming soon)"
              value={searchValue}
              onChange={handleSearchChange}
              disabled
              className="h-10 pl-9 pr-4"
            />
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-10 px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="default"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-10 gap-2 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          {onCreate && (
            <Button
              size="default"
              onClick={onCreate}
              disabled={isLoading}
              className="h-10 gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create Record</span>
            </Button>
          )}
        </div>
      </div>

      {searchValue && (
        <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Search functionality is coming soon. Use column filters for now.
        </div>
      )}
    </div>
  );
}
