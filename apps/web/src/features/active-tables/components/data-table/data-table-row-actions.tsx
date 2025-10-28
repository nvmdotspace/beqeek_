"use client";

import * as React from "react";
import { MoreVertical, Edit, Trash2, MessageSquare, Eye } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import type { ActiveTableRecord } from "../../types";

/**
 * Props for DataTableRowActions component
 */
export interface DataTableRowActionsProps {
  /** Record to perform actions on */
  record: ActiveTableRecord;

  /** Callback when edit is clicked */
  onEdit?: (record: ActiveTableRecord) => void;

  /** Callback when delete is clicked */
  onDelete?: (record: ActiveTableRecord) => void;

  /** Callback when view comments is clicked */
  onViewComments?: (record: ActiveTableRecord) => void;

  /** Callback when view details is clicked */
  onViewDetails?: (record: ActiveTableRecord) => void;
}

/**
 * DataTableRowActions component with dropdown menu
 *
 * Features:
 * - Edit record action
 * - Delete record action
 * - View comments action
 * - View details action
 * - Permission-based visibility
 *
 * @example
 * ```tsx
 * <DataTableRowActions
 *   record={record}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onViewComments={handleViewComments}
 * />
 * ```
 */
export function DataTableRowActions({
  record,
  onEdit,
  onDelete,
  onViewComments,
  onViewDetails,
}: DataTableRowActionsProps) {
  // Check permissions
  const canEdit = record.permissions?.update !== false;
  const canDelete = record.permissions?.delete !== false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onViewDetails && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(record);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {onEdit && canEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Record
          </DropdownMenuItem>
        )}

        {onViewComments && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onViewComments(record);
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            View Comments
          </DropdownMenuItem>
        )}

        {onDelete && canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Record
            </DropdownMenuItem>
          </>
        )}

        {!canEdit && !canDelete && !onViewComments && !onViewDetails && (
          <DropdownMenuItem disabled>
            No actions available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
