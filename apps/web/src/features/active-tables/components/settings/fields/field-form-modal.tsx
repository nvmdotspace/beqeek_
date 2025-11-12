/**
 * Field Form Modal Component
 *
 * Comprehensive modal for adding/editing fields with support for 26+ field types.
 * Features dynamic form sections, validation, and progressive disclosure.
 */

import { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import type { FieldConfig, FieldOption } from '@workspace/active-tables-core';
import {
  type FieldType,
  requiresOptions,
  requiresReference,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
} from '@workspace/beqeek-shared';
import { FieldTypeSelector } from './field-type-selector';
import { FieldOptionsEditor } from './field-options-editor';
import { ReferenceFieldConfig } from './reference-field-config';
import { generateUniqueFieldName, validateFieldName } from '../../../utils/field-name-generator';

// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface FieldFormModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Close callback */
  onClose: () => void;

  /** Submit callback */
  onSubmit: (field: FieldConfig) => void;

  /** Field being edited (null for new field) */
  editingField?: FieldConfig | null;

  /** Existing field names (for uniqueness validation) */
  existingFieldNames: string[];

  /** Available tables for reference fields */
  availableTables?: Array<{ id: string; name: string }>;

  /** Callback to load fields for a reference table */
  onLoadReferenceFields?: (tableId: string) => Promise<Array<{ name: string; label: string; type: string }>>;
}

interface FormData {
  type: FieldType | '';
  label: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  required: boolean;
  options: FieldOption[];
  referenceTableId?: string;
  referenceLabelField?: string;
  referenceField?: string;
}

interface ValidationErrors {
  type?: string;
  label?: string;
  name?: string;
  options?: string;
  referenceTableId?: string;
  referenceLabelField?: string;
  referenceField?: string;
}

type ReferenceFieldConfig = FieldConfig & {
  referenceTableId?: string;
  referenceField?: string;
};

/**
 * Field Form Modal Component
 *
 * Features:
 * - Dynamic form based on field type
 * - Progressive disclosure (show only relevant fields)
 * - Auto-generate field name from label
 * - Real-time validation
 * - Support for 26+ field types
 * - Options editor for SELECT/CHECKBOX
 * - Reference configuration for REFERENCE types
 * - Mobile-responsive
 */
export function FieldFormModal({
  open,
  onClose,
  onSubmit,
  editingField,
  existingFieldNames,
  availableTables = [],
  onLoadReferenceFields,
}: FieldFormModalProps) {
  const isEditing = Boolean(editingField);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    type: '',
    label: '',
    name: '',
    placeholder: '',
    defaultValue: '',
    required: false,
    options: [],
  });

  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [referenceFields, setReferenceFields] = useState<Array<{ name: string; label: string; type: string }>>([]);
  const [loadingReferenceFields, setLoadingReferenceFields] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);

  /**
   * Load fields for reference table
   */
  const loadReferenceTableFields = useCallback(
    async (tableId: string) => {
      if (!onLoadReferenceFields) return;

      setLoadingReferenceFields(true);
      try {
        const fields = await onLoadReferenceFields(tableId);
        setReferenceFields(fields);
      } catch (error) {
        console.error('Failed to load reference fields:', error);
        setReferenceFields([]);
      } finally {
        setLoadingReferenceFields(false);
      }
    },
    [onLoadReferenceFields],
  );

  // Initialize form with editing field
  useEffect(() => {
    if (open && editingField) {
      const referenceConfig = editingField as ReferenceFieldConfig;
      setFormData({
        type: editingField.type as FieldType,
        label: editingField.label,
        name: editingField.name,
        placeholder: editingField.placeholder || '',
        defaultValue: editingField.defaultValue || '',
        required: editingField.required || false,
        options: editingField.options || [],
        referenceTableId: referenceConfig.referenceTableId,
        referenceLabelField: editingField.referenceLabelField,
        referenceField: referenceConfig.referenceField,
      });
      setNameManuallyEdited(true);

      // Load reference fields if editing reference field
      if (referenceConfig.referenceTableId) {
        loadReferenceTableFields(referenceConfig.referenceTableId);
      }
    } else if (open && !editingField) {
      // Reset form for new field
      setFormData({
        type: '',
        label: '',
        name: '',
        placeholder: '',
        defaultValue: '',
        required: false,
        options: [],
      });
      setNameManuallyEdited(false);
      setReferenceFields([]);
      setShowValidation(false);
      setValidationErrors({});
    }
  }, [open, editingField, loadReferenceTableFields]);

  /**
   * Auto-generate field name from label
   */
  const handleLabelChange = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      label,
      // Auto-generate name only if not manually edited
      name: nameManuallyEdited ? prev.name : generateUniqueFieldName(label, existingFieldNames),
    }));
  };

  /**
   * Handle field name manual edit
   */
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setNameManuallyEdited(true);
  };

  /**
   * Handle field type change
   */
  const handleTypeChange = (type: FieldType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      // Clear type-specific fields
      options: requiresOptions(type) ? prev.options : [],
      referenceTableId: requiresReference(type) ? prev.referenceTableId : undefined,
      referenceLabelField: requiresReference(type) ? prev.referenceLabelField : undefined,
      referenceField: type === FIELD_TYPE_FIRST_REFERENCE_RECORD ? prev.referenceField : undefined,
    }));
    setReferenceFields([]);
  };

  /**
   * Handle reference configuration change
   */
  const handleReferenceConfigChange = async (config: {
    referenceTableId?: string;
    referenceLabelField?: string;
    referenceField?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...config,
    }));

    // Load fields when table changes
    if (config.referenceTableId && config.referenceTableId !== formData.referenceTableId) {
      await loadReferenceTableFields(config.referenceTableId);
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Type required
    if (!formData.type) {
      errors.type = m.settings_fieldModal_errorTypeRequired();
    }

    // Label required
    if (!formData.label.trim()) {
      errors.label = m.settings_fieldModal_errorLabelRequired();
    }

    // Name required and valid
    if (!formData.name.trim()) {
      errors.name = m.settings_fieldModal_errorNameRequired();
    } else {
      const nameValidation = validateFieldName(formData.name);
      if (!nameValidation.valid) {
        errors.name = nameValidation.error;
      } else {
        // Check uniqueness (exclude current field when editing)
        const filteredNames = isEditing
          ? existingFieldNames.filter((n) => n !== editingField?.name)
          : existingFieldNames;

        if (filteredNames.includes(formData.name)) {
          errors.name = m.settings_fieldModal_errorNameUnique();
        }
      }
    }

    // Options required for selection fields
    if (formData.type && requiresOptions(formData.type as FieldType) && formData.options.length === 0) {
      errors.options = m.settings_fieldModal_errorOptionsRequired();
    }

    // Reference configuration required
    if (formData.type && requiresReference(formData.type as FieldType)) {
      if (!formData.referenceTableId) {
        errors.referenceTableId = m.settings_fieldModal_errorReferenceTableRequired();
      }
      if (!formData.referenceLabelField) {
        errors.referenceLabelField = m.settings_fieldModal_errorReferenceLabelRequired();
      }
      if (formData.type === FIELD_TYPE_FIRST_REFERENCE_RECORD && !formData.referenceField) {
        errors.referenceField = m.settings_fieldModal_errorReferenceFieldRequired();
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    setShowValidation(true);

    if (!validateForm()) {
      return;
    }

    const fieldConfig: ReferenceFieldConfig = {
      type: formData.type as FieldType,
      label: formData.label.trim(),
      name: formData.name.trim(),
      placeholder: formData.placeholder.trim() || undefined,
      defaultValue: formData.defaultValue.trim() || undefined,
      required: formData.required,
      options: formData.options.length > 0 ? formData.options : undefined,
      referenceLabelField: formData.referenceLabelField,
      ...(formData.type === FIELD_TYPE_FIRST_REFERENCE_RECORD && {
        referenceField: formData.referenceField,
      }),
    };

    // Add referenceTableId as a non-standard property (stored separately in backend)
    if (formData.referenceTableId) {
      fieldConfig.referenceTableId = formData.referenceTableId;
    }

    onSubmit(fieldConfig);
    onClose();
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    onClose();
  };

  const showOptionsEditor = formData.type && requiresOptions(formData.type as FieldType);
  const showReferenceConfig = formData.type && requiresReference(formData.type as FieldType);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{isEditing ? m.settings_fieldModal_titleEdit() : m.settings_fieldModal_titleAdd()}</DialogTitle>
          <DialogDescription>
            {isEditing ? m.settings_fieldModal_descriptionEdit() : m.settings_fieldModal_descriptionAdd()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 pb-6">
            {/* Field Type Selector */}
            <FieldTypeSelector
              value={formData.type as FieldType}
              onChange={handleTypeChange}
              disabled={isEditing}
              error={showValidation && Boolean(validationErrors.type)}
            />

            {isEditing && (
              <div className="rounded-md bg-info-subtle border border-info/20 p-3">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
                  <p className="text-sm text-info">{m.settings_fieldModal_typeLockedInfo()}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Basic Field Configuration */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">{m.settings_fieldModal_sectionBasic()}</h3>

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="field-label" className="text-sm font-medium">
                  {m.settings_fieldModal_labelField()} <span className="text-destructive">{m.common_required()}</span>
                </Label>
                <Input
                  id="field-label"
                  value={formData.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder={m.settings_fieldModal_labelPlaceholder()}
                  className={showValidation && validationErrors.label ? 'border-destructive' : ''}
                />
                {showValidation && validationErrors.label && (
                  <p className="text-xs text-destructive">{validationErrors.label}</p>
                )}
                <p className="text-xs text-muted-foreground">{m.settings_fieldModal_labelHelp()}</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="field-name" className="text-sm font-medium">
                  {m.settings_fieldModal_nameField()} <span className="text-destructive">{m.common_required()}</span>
                </Label>
                <Input
                  id="field-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={m.settings_fieldModal_namePlaceholder()}
                  className={`font-mono text-sm ${showValidation && validationErrors.name ? 'border-destructive' : ''}`}
                  disabled={isEditing}
                />
                {showValidation && validationErrors.name && (
                  <p className="text-xs text-destructive">{validationErrors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {isEditing ? m.settings_fieldModal_nameLockedHelp() : m.settings_fieldModal_nameHelp()}
                </p>
              </div>

              {/* Placeholder */}
              <div className="space-y-2">
                <Label htmlFor="field-placeholder" className="text-sm font-medium">
                  {m.settings_fieldModal_placeholderField()}
                </Label>
                <Input
                  id="field-placeholder"
                  value={formData.placeholder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, placeholder: e.target.value }))}
                  placeholder={m.settings_fieldModal_placeholderPlaceholder()}
                />
                <p className="text-xs text-muted-foreground">{m.settings_fieldModal_placeholderHelp()}</p>
              </div>

              {/* Default Value */}
              <div className="space-y-2">
                <Label htmlFor="field-default-value" className="text-sm font-medium">
                  {m.settings_fieldModal_defaultValueField()}
                </Label>
                <Input
                  id="field-default-value"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultValue: e.target.value }))}
                  placeholder={m.settings_fieldModal_defaultValuePlaceholder()}
                />
                <p className="text-xs text-muted-foreground">{m.settings_fieldModal_defaultValueHelp()}</p>
              </div>

              {/* Required Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="field-required" className="text-sm font-medium">
                    {m.settings_fieldModal_requiredField()}
                  </Label>
                  <p className="text-sm text-muted-foreground">{m.settings_fieldModal_requiredHelp()}</p>
                </div>
                <Switch
                  id="field-required"
                  checked={formData.required}
                  onCheckedChange={(required) => setFormData((prev) => ({ ...prev, required }))}
                />
              </div>
            </div>

            {/* Options Editor (for SELECT/CHECKBOX fields) */}
            {showOptionsEditor && (
              <>
                <Separator />
                <FieldOptionsEditor
                  options={formData.options}
                  onChange={(options) => setFormData((prev) => ({ ...prev, options }))}
                  error={showValidation && Boolean(validationErrors.options)}
                  errorMessage={validationErrors.options}
                />
              </>
            )}

            {/* Reference Configuration (for REFERENCE fields) */}
            {showReferenceConfig && (
              <>
                <Separator />
                <ReferenceFieldConfig
                  fieldType={formData.type as FieldType}
                  referenceTableId={formData.referenceTableId}
                  referenceLabelField={formData.referenceLabelField}
                  referenceField={formData.referenceField}
                  availableTables={availableTables}
                  availableFields={referenceFields}
                  onChange={handleReferenceConfigChange}
                  loadingFields={loadingReferenceFields}
                  error={
                    showValidation &&
                    (Boolean(validationErrors.referenceTableId) ||
                      Boolean(validationErrors.referenceLabelField) ||
                      Boolean(validationErrors.referenceField))
                  }
                  errorMessage={
                    validationErrors.referenceTableId ||
                    validationErrors.referenceLabelField ||
                    validationErrors.referenceField
                  }
                />
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {m.common_cancel()}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isEditing ? m.settings_fieldModal_buttonUpdate() : m.settings_fieldModal_buttonAdd()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
