/**
 * Reference Field Configuration Component
 *
 * Configures reference fields (SELECT_ONE_RECORD, SELECT_LIST_RECORD, FIRST_REFERENCE_RECORD).
 * Allows selecting reference table and configuring label/reference fields.
 */

import { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { type FieldType, FIELD_TYPE_FIRST_REFERENCE_RECORD } from '@workspace/beqeek-shared';

export interface ReferenceFieldConfigProps {
  /** Current field type */
  fieldType: FieldType;

  /** Reference table ID */
  referenceTableId?: string;

  /** Reference label field (for display) */
  referenceLabelField?: string;

  /** Reference field (for FIRST_REFERENCE_RECORD only) */
  referenceField?: string;

  /** Available tables in workspace */
  availableTables: Array<{ id: string; name: string }>;

  /** Available fields in selected reference table */
  availableFields: Array<{ name: string; label: string; type: string }>;

  /** Callback when configuration changes */
  onChange: (config: { referenceTableId?: string; referenceLabelField?: string; referenceField?: string }) => void;

  /** Loading state for fields */
  loadingFields?: boolean;

  /** Show error state */
  error?: boolean;

  /** Error message */
  errorMessage?: string;
}

/**
 * Reference Field Configuration Component
 *
 * Features:
 * - Select reference table from workspace tables
 * - Select label field from reference table fields
 * - For FIRST_REFERENCE_RECORD: select reference field (reverse lookup)
 * - Real-time validation
 * - Loading states
 */
export function ReferenceFieldConfig({
  fieldType,
  referenceTableId,
  referenceLabelField,
  referenceField,
  availableTables,
  availableFields,
  onChange,
  loadingFields,
  error,
  errorMessage,
}: ReferenceFieldConfigProps) {
  const [localTableId, setLocalTableId] = useState(referenceTableId);
  const [localLabelField, setLocalLabelField] = useState(referenceLabelField);
  const [localRefField, setLocalRefField] = useState(referenceField);

  const isFirstReferenceRecord = fieldType === FIELD_TYPE_FIRST_REFERENCE_RECORD;

  // Sync with parent
  useEffect(() => {
    setLocalTableId(referenceTableId);
  }, [referenceTableId]);

  useEffect(() => {
    setLocalLabelField(referenceLabelField);
  }, [referenceLabelField]);

  useEffect(() => {
    setLocalRefField(referenceField);
  }, [referenceField]);

  /**
   * Handle table selection
   */
  const handleTableChange = (tableId: string) => {
    setLocalTableId(tableId);
    setLocalLabelField(undefined);
    setLocalRefField(undefined);
    onChange({
      referenceTableId: tableId,
      referenceLabelField: undefined,
      referenceField: undefined,
    });
  };

  /**
   * Handle label field selection
   */
  const handleLabelFieldChange = (fieldName: string) => {
    setLocalLabelField(fieldName);
    onChange({
      referenceTableId: localTableId,
      referenceLabelField: fieldName,
      referenceField: localRefField,
    });
  };

  /**
   * Handle reference field selection (FIRST_REFERENCE_RECORD only)
   */
  const handleReferenceFieldChange = (fieldName: string) => {
    setLocalRefField(fieldName);
    onChange({
      referenceTableId: localTableId,
      referenceLabelField: localLabelField,
      referenceField: fieldName,
    });
  };

  /**
   * Get eligible fields for reference field (SELECT_ONE_RECORD types only)
   */
  const getEligibleReferenceFields = () => {
    return availableFields.filter((field) => field.type === 'SELECT_ONE_RECORD' || field.type === 'SELECT_LIST_RECORD');
  };

  const selectedTable = availableTables.find((t) => t.id === localTableId);
  const eligibleRefFields = isFirstReferenceRecord ? getEligibleReferenceFields() : [];

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
      <div className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold">Reference Configuration</h4>
        {isFirstReferenceRecord && (
          <Badge variant="info" className="text-xs">
            Reverse Lookup
          </Badge>
        )}
      </div>

      {/* FIRST_REFERENCE_RECORD Info */}
      {isFirstReferenceRecord && (
        <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">Reverse Lookup Field</p>
              <p className="text-xs">
                This read-only field displays data from the first record in the selected table that references the
                current record. You must specify which field in the reference table links back to this table.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Table Selection */}
      <div className="space-y-2">
        <Label htmlFor="reference-table">
          Reference Table <span className="text-destructive">*</span>
        </Label>
        <Select value={localTableId} onValueChange={handleTableChange}>
          <SelectTrigger className={error && !localTableId ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select a table..." />
          </SelectTrigger>
          <SelectContent>
            {availableTables.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">No tables available</div>
            ) : (
              availableTables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  {table.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {selectedTable && (
          <p className="text-xs text-muted-foreground">
            Records will reference: <strong>{selectedTable.name}</strong>
          </p>
        )}
      </div>

      {/* Label Field Selection */}
      {localTableId && (
        <div className="space-y-2">
          <Label htmlFor="label-field">
            Display Field <span className="text-destructive">*</span>
          </Label>
          <Select
            value={localLabelField}
            onValueChange={handleLabelFieldChange}
            disabled={loadingFields || availableFields.length === 0}
          >
            <SelectTrigger className={error && !localLabelField ? 'border-destructive' : ''}>
              <SelectValue placeholder={loadingFields ? 'Loading fields...' : 'Select display field...'} />
            </SelectTrigger>
            <SelectContent>
              {availableFields.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No fields available in selected table
                </div>
              ) : (
                availableFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <div className="flex items-center gap-2">
                      <span>{field.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This field will be displayed as the label for referenced records
          </p>
        </div>
      )}

      {/* Reference Field Selection (FIRST_REFERENCE_RECORD only) */}
      {isFirstReferenceRecord && localTableId && (
        <div className="space-y-2">
          <Label htmlFor="reference-field">
            Reference Field <span className="text-destructive">*</span>
          </Label>
          <Select
            value={localRefField}
            onValueChange={handleReferenceFieldChange}
            disabled={loadingFields || eligibleRefFields.length === 0}
          >
            <SelectTrigger className={error && !localRefField ? 'border-destructive' : ''}>
              <SelectValue
                placeholder={
                  loadingFields
                    ? 'Loading fields...'
                    : eligibleRefFields.length === 0
                      ? 'No eligible fields'
                      : 'Select reference field...'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {eligibleRefFields.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  <p className="mb-2">No eligible reference fields found</p>
                  <p className="text-xs">
                    The selected table must have a field of type SELECT_ONE_RECORD or SELECT_LIST_RECORD that references
                    this table.
                  </p>
                </div>
              ) : (
                eligibleRefFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <div className="flex items-center gap-2">
                      <span>{field.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The field in <strong>{selectedTable?.name}</strong> that references this table
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{errorMessage || 'Reference configuration is incomplete'}</p>
        </div>
      )}

      {/* Summary */}
      {localTableId && localLabelField && (!isFirstReferenceRecord || localRefField) && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-sm text-green-900 dark:text-green-200">
            <strong>Configuration Complete</strong>
            <br />
            {isFirstReferenceRecord ? (
              <>
                Will display the <strong>{localLabelField}</strong> field from the first record in{' '}
                <strong>{selectedTable?.name}</strong> where <strong>{localRefField}</strong> references this record.
              </>
            ) : (
              <>
                Will reference records from <strong>{selectedTable?.name}</strong> and display their{' '}
                <strong>{localLabelField}</strong> field.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
