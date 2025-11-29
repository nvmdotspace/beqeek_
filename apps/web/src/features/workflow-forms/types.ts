/**
 * Workflow Forms - Type Definitions
 *
 * TypeScript interfaces for workflow form builder feature.
 * Based on legacy implementation and functional spec.
 *
 * Key decisions:
 * - No E2EE (forms are non-sensitive metadata)
 * - Server-side ID generation
 * - No versioning (simple CRUD)
 * - Manual validation (no Zod)
 *
 * @see /docs/workflow-forms-functional-spec.md
 * @see /plans/251114-2305-workflow-forms-implementation/DECISIONS.md
 */

/**
 * Form type template identifiers
 */
export type FormType = 'BASIC' | 'SUBSCRIPTION' | 'SURVEY';

/**
 * Field input types supported by form builder
 */
export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime-local';

/**
 * Select field option definition
 */
export interface Option {
  /** Display text for the option */
  text: string;
  /** Value submitted when selected */
  value: string;
}

/**
 * Field configuration
 */
export interface Field {
  /** Field input type */
  type: FieldType;
  /** Display label for the field */
  label: string;
  /** Variable name for form submission (auto-generated from label if empty) */
  name: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string;
  /** Whether field is required */
  required: boolean;
  /** Options for select field type */
  options?: Option[];
  /** Character limit for textarea (default: 1500) */
  maxlength?: number;
}

/**
 * Form configuration structure
 */
export interface FormConfig {
  /** Form title */
  title: string;
  /** Array of field definitions */
  fields: Field[];
  /** Submit button configuration */
  submitButton: {
    /** Submit button text */
    text: string;
  };
}

/**
 * Complete form instance (API entity)
 */
export interface FormInstance {
  /** Form ID (server-generated) */
  id: string;
  /** Form name */
  name: string;
  /** Form description */
  description: string;
  /** Form template type */
  formType: FormType;
  /** Form structure and fields */
  config: FormConfig;
  /** Creation timestamp (ISO 8601) */
  createdAt?: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt?: string;
}

/**
 * Form type definition for template selection UI
 */
export interface FormTypeDefinition {
  /** Template type identifier */
  type: FormType;
  /** Display name */
  name: string;
  /** Template description */
  description: string;
  /** Icon/logo URL */
  logo: string;
  /** Optional Lucide icon name */
  icon?: string;
}

/**
 * Payload for creating a new form
 */
export interface FormCreatePayload {
  /** Form name */
  name: string;
  /** Form description */
  description: string;
  /** Template type to use */
  formType: FormType;
  /** Initial form configuration */
  config: FormConfig;
}

/**
 * Payload for updating an existing form
 */
export interface FormUpdatePayload {
  /** Updated form name */
  name: string;
  /** Updated form description */
  description: string;
  /** Updated form configuration */
  config: FormConfig;
}

/**
 * API response for list forms endpoint
 */
export interface FormListResponse {
  /** Array of form instances */
  data: FormInstance[];
}

/**
 * API response for get form detail endpoint
 */
export interface FormDetailResponse {
  /** Form instance */
  data: FormInstance;
}

/**
 * API response for create form endpoint
 */
export interface FormCreateResponse {
  /** Created form ID */
  data: {
    /** Server-generated form ID */
    id: string;
  };
  /** Success message */
  message: string;
}

/**
 * API response for update form endpoint
 */
export interface FormUpdateResponse {
  /** Success message */
  message: string;
}

/**
 * API response for delete form endpoint
 */
export interface FormDeleteResponse {
  /** Success message */
  message: string;
}
