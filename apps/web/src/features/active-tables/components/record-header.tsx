/**
 * RecordHeader - Header component for record detail page
 * Shows title, breadcrumb, and action buttons
 */

import { ArrowLeft, MoreVertical, Trash2, Copy, Share2 } from 'lucide-react';
import type { TableRecord, Table } from '@workspace/active-tables-core';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Box } from '@workspace/ui/components/primitives/box';
import { Heading } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { useState } from 'react';

interface RecordHeaderProps {
  record: TableRecord;
  table: Table;
  referenceRecords?: Record<string, TableRecord[]>;
  onDelete?: () => Promise<void>;
  onBack: () => void;
}

export function RecordHeader({ record, table, referenceRecords, onDelete, onBack }: RecordHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Get record title from layout-specific field
  // head-detail should use titleField, but API may return headTitleField
  // two-column-detail uses headTitleField
  const config = table.config.recordDetailConfig;
  const titleFieldName =
    config?.headTitleField || // Try headTitleField first (actual API response)
    config?.titleField || // Fallback to titleField (spec)
    table.config.fields[0]?.name; // Final fallback to first field

  const recordData = (record as any).data || record.record || record;
  let titleValue = titleFieldName ? recordData[titleFieldName] : null;

  // Check if titleField is a reference field and lookup the actual value
  const titleField = table.config.fields.find((f) => f.name === titleFieldName);
  if (titleField?.referenceTableId && titleValue && referenceRecords) {
    const refRecords = referenceRecords[titleField.referenceTableId] || [];
    const refRecord = refRecords.find((r) => r.id === String(titleValue));
    if (refRecord) {
      const labelField = titleField.referenceLabelField || 'name';
      const refData = (refRecord as any).data || refRecord.record || refRecord;
      titleValue = refData[labelField] || titleValue;
    }
  }

  const recordTitle = titleValue != null && titleValue !== '' ? String(titleValue) : record.id;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete record:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recordTitle,
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <Box className="border-b border-border bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <Inline justify="between" align="center">
          {/* Left: Back button + Title */}
          <Inline space="space-200" align="center" className="flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
              <ArrowLeft className="size-4" />
            </Button>
            <Heading level={1} className="text-lg font-semibold truncate">
              {recordTitle}
            </Heading>
          </Inline>

          {/* Right: Action buttons */}
          <Inline space="space-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More options">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="size-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="size-4 mr-2" />
                  Share
                </DropdownMenuItem>

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this record and remove all
                            associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Inline>
        </Inline>
      </div>
    </Box>
  );
}
