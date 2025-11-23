/**
 * Reference Field Display - Renders SELECT_ONE_RECORD, SELECT_LIST_RECORD, FIRST_REFERENCE_RECORD field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Badge } from '@workspace/ui/components/badge';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Text } from '@workspace/ui/components/typography/text';
import {
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
} from '@workspace/beqeek-shared/constants';
import type { FieldConfig } from '../../../../types/field.js';
import type { TableRecord } from '../../../../types/record.js';

interface ReferenceFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
  referenceRecords?: Record<string, TableRecord[]>;
}

/**
 * Display component for reference record fields
 * Looks up and displays referenced record label field
 *
 * @example
 * <ReferenceFieldDisplay
 *   value="record123"
 *   field={{
 *     type: 'SELECT_ONE_RECORD',
 *     referenceTableId: 'table456',
 *     referenceLabelField: 'name'
 *   }}
 *   referenceRecords={{ table456: [{ id: 'record123', data: { name: 'Project A' } }] }}
 * />
 */
export function ReferenceFieldDisplay({ value, field, referenceRecords }: ReferenceFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '') {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const referenceTableId = field?.referenceTableId || field?.referencedTableId;
  const labelField = field?.referenceLabelField || 'name';

  if (!referenceTableId || !referenceRecords) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const tableRecords = referenceRecords[referenceTableId] || [];

  // Handle single reference (SELECT_ONE_RECORD, FIRST_REFERENCE_RECORD)
  if (field?.type === FIELD_TYPE_SELECT_ONE_RECORD || field?.type === FIELD_TYPE_FIRST_REFERENCE_RECORD) {
    const recordId = String(value);
    const record = tableRecords.find((r) => r.id === recordId);

    if (!record) {
      return <Text className="text-muted-foreground">-</Text>;
    }

    // Try multiple data access patterns
    const recordData = (record as any).data || (record as any).record || record;
    const label = recordData[labelField] || recordId;

    return (
      <Badge variant="outline" className="cursor-pointer hover:bg-accent/50">
        {String(label)}
      </Badge>
    );
  }

  // Handle multiple references (SELECT_LIST_RECORD)
  if (field?.type === FIELD_TYPE_SELECT_LIST_RECORD) {
    const recordIds = Array.isArray(value) ? value : [value];
    const filteredIds = recordIds.filter((id) => id != null && id !== '').map(String);

    if (filteredIds.length === 0) {
      return <Text className="text-muted-foreground">-</Text>;
    }

    const records = filteredIds.map((id) => tableRecords.find((r) => r.id === id)).filter((r) => r != null);

    if (records.length === 0) {
      return <Text className="text-muted-foreground">-</Text>;
    }

    return (
      <Inline space="space-050" wrap>
        {records.map((record, index) => {
          const label = record.data?.[labelField] || record.id;
          return (
            <Badge key={`${record.id}-${index}`} variant="outline" className="cursor-pointer hover:bg-accent/50">
              {String(label)}
            </Badge>
          );
        })}
      </Inline>
    );
  }

  // Fallback
  return <Text className="text-muted-foreground">-</Text>;
}
