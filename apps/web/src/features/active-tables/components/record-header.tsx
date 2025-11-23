/**
 * RecordHeader - Header component for record detail page
 * Shows title, breadcrumb, and action buttons
 */

import { memo, useState, useMemo, useCallback } from 'react';
import { ArrowLeft, MoreVertical, Trash2, Copy, Share2 } from 'lucide-react';
import type { TableRecord, Table } from '@workspace/active-tables-core';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Box } from '@workspace/ui/components/primitives/box';
import { Heading, Text } from '@workspace/ui/components/typography';
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

/**
 * Safely get record data from various data structures
 * Handles: record.data, record.record, or direct field access
 */
function getRecordData(record: TableRecord): Record<string, unknown> {
  return record.data || record.record || (record as unknown as Record<string, unknown>);
}

interface RecordHeaderProps {
  record: TableRecord;
  table: Table;
  referenceRecords?: Record<string, TableRecord[]>;
  onDelete?: () => Promise<void>;
  onBack: () => void;
}

function RecordHeaderInner({ record, table, referenceRecords, onDelete, onBack }: RecordHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoize config extraction
  const config = table.config.recordDetailConfig;

  // Memoize title computation to prevent re-renders
  const titleComputed = useMemo(() => {
    // Get record title from layout-specific field
    // head-detail should use titleField, but API may return headTitleField
    // two-column-detail uses headTitleField
    const fieldName =
      config?.headTitleField || // Try headTitleField first (actual API response)
      config?.titleField || // Fallback to titleField (spec)
      table.config.fields[0]?.name; // Final fallback to first field

    const recordData = getRecordData(record);
    let titleValue = fieldName ? recordData[fieldName] : null;

    // Check if titleField is a reference field and lookup the actual value
    const titleField = table.config.fields.find((f) => f.name === fieldName);
    if (titleField?.referenceTableId && titleValue && referenceRecords) {
      const refRecords = referenceRecords[titleField.referenceTableId] || [];
      const refRecord = refRecords.find((r) => r.id === String(titleValue));
      if (refRecord) {
        const labelField = titleField.referenceLabelField || 'name';
        const refData = getRecordData(refRecord);
        titleValue = refData[labelField] || titleValue;
      }
      // Note: Don't log warnings for missing reference records - it's expected during loading
    }

    return titleValue != null && titleValue !== '' ? String(titleValue) : record.id;
  }, [config, table.config.fields, record, referenceRecords]);

  const recordTitle = titleComputed;

  // Memoize subline values computation to prevent re-renders
  const subLineValues = useMemo(() => {
    const subLineFieldNames = config?.headSubLineFields || config?.subLineFields || [];
    const recordData = getRecordData(record);

    return subLineFieldNames
      .map((fieldName) => {
        const field = table.config.fields.find((f) => f.name === fieldName);
        if (!field) return null;

        let value = recordData[fieldName];

        // Handle reference fields
        if (field.referenceTableId && value && referenceRecords) {
          const refRecords = referenceRecords[field.referenceTableId] || [];
          const refRecord = refRecords.find((r) => r.id === String(value));
          if (refRecord) {
            const labelField = field.referenceLabelField || 'name';
            const refData = getRecordData(refRecord);
            value = refData[labelField] || value;
          }
          // Note: Don't log warnings for missing reference records - it's expected during loading
        }

        return value != null && value !== '' ? String(value) : null;
      })
      .filter((v): v is string => v != null);
  }, [config, table.config.fields, record, referenceRecords]);

  // Memoize handlers
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete record:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  const handleCopyLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: recordTitle,
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  }, [recordTitle, handleCopyLink]);

  return (
    <Box className="border-b border-border bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <Inline justify="between" align="start">
          {/* Left: Back button + Title + Metadata */}
          <Inline space="space-200" align="start" className="flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back" className="mt-0.5">
              <ArrowLeft className="size-4" />
            </Button>
            <Stack space="space-050" className="flex-1 min-w-0">
              {/* Title */}
              <Heading level={1} className="text-lg font-semibold truncate">
                {recordTitle}
              </Heading>
              {/* Subline metadata */}
              {subLineValues.length > 0 && (
                <Inline space="space-100" wrap className="text-sm text-muted-foreground">
                  {subLineValues.map((value, index) => (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && <span>·</span>}
                      <Text size="small">{value}</Text>
                    </span>
                  ))}
                </Inline>
              )}
            </Stack>
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

/**
 * Memoized RecordHeader component to prevent unnecessary re-renders
 * when parent component re-renders with same props
 */
export const RecordHeader = memo(RecordHeaderInner);
