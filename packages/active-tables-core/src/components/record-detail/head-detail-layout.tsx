/**
 * HeadDetailLayout Component
 *
 * Single-column detail layout with head section and vertical tail fields
 */

import { useMemo } from 'react';
import type { DetailLayoutProps } from './record-detail-props.js';
import { FieldRenderer } from '../fields/field-renderer.js';
import { useRecordDecryption } from '../../hooks/use-encryption.js';

/**
 * HeadDetailLayout - Single column layout
 *
 * Structure:
 * - Head section (title + subline fields horizontal)
 * - Row tail fields (vertical stack)
 * - Comments panel (if configured)
 */
export function HeadDetailLayout(props: DetailLayoutProps) {
  const {
    table,
    record,
    config,
    enableEditing = false,
    onUpdate,
    commentsPanel,
    encryptionKey,
    currentUser,
    workspaceUsers,
    className = '',
  } = props;

  // Decrypt record if E2EE enabled
  const { decryptRecord } = useRecordDecryption(table, encryptionKey);
  const displayRecord = useMemo(() => {
    const decrypted = table.config.e2eeEncryption && encryptionKey ? decryptRecord(record) : record;

    // Normalize to have data property
    return {
      ...decrypted,
      data: decrypted.data || decrypted.record,
    };
  }, [table.config.e2eeEncryption, encryptionKey, record, decryptRecord]);

  // Get field configurations
  const fields = table.config.fields || [];

  // Parse layout sections
  const titleFieldName = config.titleField || '';
  const subLineFieldNames = config.subLineFields || [];
  const tailFieldNames = config.tailFields || [];

  // Get field configs
  const titleField = fields.find((f) => f.name === titleFieldName);
  const subLineFields = subLineFieldNames
    .map((name) => fields.find((f) => f.name === name))
    .filter((f): f is NonNullable<typeof f> => f !== undefined);
  const tailFields = tailFieldNames
    .map((name) => fields.find((f) => f.name === name))
    .filter((f): f is NonNullable<typeof f> => f !== undefined);

  // Render title field
  const renderTitle = () => {
    if (!titleField) return null;

    return (
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-600 mb-2">{titleField.label}</div>
        <div className="text-2xl font-bold text-gray-900">
          <FieldRenderer
            field={titleField}
            value={displayRecord.data[titleField.name]}
            mode="display"
            table={table}
            onChange={
              enableEditing && onUpdate ? (value) => onUpdate(record.id, { [titleField.name]: value }) : undefined
            }
            currentUser={currentUser}
            workspaceUsers={workspaceUsers}
            encryptionKey={encryptionKey}
          />
        </div>
      </div>
    );
  };

  // Render subline fields (horizontal badges/metadata)
  const renderSubLine = () => {
    if (subLineFields.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200">
        {subLineFields.map((field) => (
          <div key={field.name} className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{field.label}:</span>
            <FieldRenderer
              field={field}
              value={displayRecord.data[field.name]}
              mode="display"
              table={table}
              onChange={enableEditing && onUpdate ? (value) => onUpdate(record.id, { [field.name]: value }) : undefined}
              currentUser={currentUser}
              workspaceUsers={workspaceUsers}
              encryptionKey={encryptionKey}
            />
          </div>
        ))}
      </div>
    );
  };

  // Render tail fields (vertical stack)
  const renderTailFields = () => {
    if (tailFields.length === 0) return null;

    return (
      <div className="space-y-6">
        {tailFields.map((field) => (
          <div key={field.name} className="border-b border-gray-100 pb-4">
            <div className="text-sm font-medium text-gray-600 mb-2">{field.label}</div>
            <div className="text-gray-900">
              <FieldRenderer
                field={field}
                value={displayRecord.data[field.name]}
                mode="display"
                table={table}
                onChange={
                  enableEditing && onUpdate ? (value) => onUpdate(record.id, { [field.name]: value }) : undefined
                }
                currentUser={currentUser}
                workspaceUsers={workspaceUsers}
                encryptionKey={encryptionKey}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Title Section */}
      {renderTitle()}

      {/* Subline Section */}
      {renderSubLine()}

      {/* Tail Fields */}
      {renderTailFields()}

      {/* Comments Panel (bottom position) */}
      {config.commentsPosition === 'bottom' && commentsPanel && (
        <div className="mt-6 pt-6 border-t border-gray-200">{commentsPanel}</div>
      )}
    </div>
  );
}
