/**
 * RelatedRecords - Display related records through reference fields
 * @module active-tables-core/components/record-detail
 */

import React, { useState } from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedRecordsProps } from '../../types/record-detail.js';
import type { FieldConfig } from '../../types/field.js';
import {
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
} from '@workspace/beqeek-shared/constants';

/**
 * Group related records by reference field
 */
function groupRelatedRecords(record: any, fields: FieldConfig[], referenceRecords: Record<string, any[]>) {
  const groups: Array<{
    field: FieldConfig;
    records: any[];
  }> = [];

  fields.forEach((field) => {
    const isReferenceField =
      field.type === FIELD_TYPE_SELECT_ONE_RECORD ||
      field.type === FIELD_TYPE_SELECT_LIST_RECORD ||
      field.type === FIELD_TYPE_FIRST_REFERENCE_RECORD;

    if (!isReferenceField) return;

    const fieldValue = record[field.name];
    if (!fieldValue) return;

    const tableId = field.referenceTableId || field.referencedTableId;
    if (!tableId) return;

    const recordsForTable = referenceRecords[tableId] || [];
    let relatedRecords: any[] = [];

    if (field.type === FIELD_TYPE_SELECT_LIST_RECORD) {
      const ids = Array.isArray(fieldValue) ? fieldValue : [];
      relatedRecords = recordsForTable.filter((r) => ids.includes(r.id));
    } else {
      relatedRecords = recordsForTable.filter((r) => r.id === fieldValue);
    }

    if (relatedRecords.length > 0) {
      groups.push({ field, records: relatedRecords });
    }
  });

  return groups;
}

/**
 * Related records section component
 */
export function RelatedRecords({ record, table, referenceRecords, onRecordClick, className }: RelatedRecordsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const locale = typeof document !== 'undefined' ? document.documentElement.lang || 'vi' : 'vi';

  const toggleSection = (fieldName: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  };

  const groups = groupRelatedRecords(record, table.config.fields, referenceRecords);

  if (groups.length === 0) {
    return (
      <Stack space="space-200" className={className}>
        <Heading level={3}>{locale === 'vi' ? 'Bản ghi liên quan' : 'Related Records'}</Heading>
        <Text className="text-muted-foreground">
          {locale === 'vi' ? 'Không có bản ghi liên quan' : 'No related records'}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack space="space-300" className={className}>
      <Heading level={3}>{locale === 'vi' ? 'Bản ghi liên quan' : 'Related Records'}</Heading>

      <Stack space="space-200">
        {groups.map(({ field, records }) => {
          const isExpanded = expandedSections.has(field.name);
          const labelField = field.referenceLabelField || 'name';

          return (
            <Stack key={field.name} space="space-100">
              {/* Section header */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(field.name)}
                className="w-full justify-start gap-2 px-2 -mx-2"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Text weight="medium">{field.label}</Text>
                <Badge variant="secondary" className="ml-auto">
                  {records.length}
                </Badge>
              </Button>

              {/* Related records list */}
              {isExpanded && (
                <Stack space="space-100" className="pl-6">
                  {records.map((relatedRecord) => {
                    const displayValue = relatedRecord[labelField] || relatedRecord.id;

                    return (
                      <button
                        key={relatedRecord.id}
                        onClick={() => onRecordClick?.(relatedRecord.id)}
                        className={cn(
                          'text-left px-3 py-2 rounded-md',
                          'hover:bg-accent transition-colors',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                          onRecordClick ? 'cursor-pointer' : 'cursor-default',
                        )}
                        disabled={!onRecordClick}
                      >
                        <Text size="small" className="truncate">
                          {String(displayValue)}
                        </Text>
                      </button>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
