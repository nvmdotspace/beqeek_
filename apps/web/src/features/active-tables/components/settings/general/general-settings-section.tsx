/**
 * General Settings Section
 *
 * Configuration for basic table settings including encryption, limits, and search fields.
 */

import { useState, useEffect } from 'react';
import { Copy, Check, Eye, EyeOff, Edit2, X, AlertTriangle, Info } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import type { TableConfig } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
} from '@workspace/beqeek-shared';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { SettingsSection } from '../settings-layout';
import { MultiSelectField } from '../multi-select-field';

export interface GeneralSettingsSectionProps {
  /** Table ID (read-only) */
  tableId: string;

  /** Current table configuration */
  config: TableConfig;

  /** Callback when configuration changes */
  onChange: (updates: Partial<TableConfig>) => void;

  /** Available fields for search field selection */
  fields: Array<{ name: string; label: string; type: string }>;
}

/**
 * General Settings Section
 *
 * Allows users to configure:
 * - Table title and description
 * - Table icon
 * - Table record limit (1-100,000)
 * - E2EE encryption settings
 * - First reference record toggle
 * - Default sort direction
 * - Searchable fields
 */
export function GeneralSettingsSection({ tableId, config, onChange, fields }: GeneralSettingsSectionProps) {
  // Local state for form inputs
  const [title, setTitle] = useState(config.title || '');
  const [tableLimit, setTableLimit] = useState(config.tableLimit || 1000);
  const [encryptionKey, setEncryptionKey] = useState(config.encryptionKey || '');
  const [hashedKeywordFields, setHashedKeywordFields] = useState<string[]>(config.hashedKeywordFields || []);
  const [defaultSort, setDefaultSort] = useState<'asc' | 'desc'>(config.defaultSort || 'asc');

  // UI state
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Define encryptable field types (matching encryptFields from encryption-core)
  const ENCRYPTABLE_FIELD_TYPES: string[] = [
    FIELD_TYPE_SHORT_TEXT,
    FIELD_TYPE_TEXT,
    FIELD_TYPE_RICH_TEXT,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_URL,
  ];

  // Get encryptable text fields for search
  const searchableFields = fields.filter((f) => ENCRYPTABLE_FIELD_TYPES.includes(f.type));

  // Update parent when local state changes
  useEffect(() => {
    onChange({
      title,
      tableLimit,
      hashedKeywordFields,
      defaultSort,
    });
  }, [title, tableLimit, hashedKeywordFields, defaultSort, onChange]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(tableId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  const handleCopyKey = async () => {
    if (!encryptionKey) return;

    try {
      await navigator.clipboard.writeText(encryptionKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const handleEditKey = () => {
    setIsEditingKey(true);
  };

  const handleCancelEdit = () => {
    setEncryptionKey(config.encryptionKey || '');
    setIsEditingKey(false);
  };

  // Update encryption key in real-time as user types (when in edit mode)
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setEncryptionKey(newKey);

    // Only update parent if key is valid (32 characters)
    if (newKey.length === 32) {
      onChange({ encryptionKey: newKey });
    }
  };

  return (
    <SettingsSection title={m.settings_general_title()} description={m.settings_general_description()}>
      <div className="space-y-5">
        {/* Table ID (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="table-id" className="text-sm font-medium">
            {m.settings_general_tableId()}
          </Label>
          <div className="flex gap-2">
            <Input
              id="table-id"
              value={tableId}
              readOnly
              className="flex-1 bg-muted font-mono text-sm"
              aria-label={m.settings_general_tableId()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyId}
              className="shrink-0"
              aria-label={m.settings_general_copyTableId()}
            >
              {copiedId ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{m.settings_general_tableIdHelp()}</p>
        </div>

        {/* Table Title */}
        <div className="space-y-2">
          <Label htmlFor="table-title" className="text-sm font-medium">
            {m.settings_general_tableTitle()} <span className="text-destructive">{m.common_required()}</span>
          </Label>
          <Input
            id="table-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={m.settings_general_tableTitlePlaceholder()}
            maxLength={100}
            required
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">{m.settings_general_tableTitleHelp()}</p>
        </div>

        {/* Note: Description removed as it's not part of TableConfig type */}

        {/* Table Limit */}
        <div className="space-y-2">
          <Label htmlFor="table-limit" className="text-sm font-medium">
            {m.settings_general_tableLimit()} <span className="text-destructive">{m.common_required()}</span>
          </Label>
          <Input
            id="table-limit"
            type="number"
            value={tableLimit}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setTableLimit(Math.min(1000, Math.max(1, value)));
            }}
            min={1}
            max={1000}
            required
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">{m.settings_general_tableLimitHelp()}</p>
        </div>

        {/* Default Sort Direction */}
        <div className="space-y-2">
          <Label htmlFor="default-sort" className="text-sm font-medium">
            {m.settings_general_defaultSort()} <span className="text-destructive">{m.common_required()}</span>
          </Label>
          <Select value={defaultSort} onValueChange={(value) => setDefaultSort(value as 'asc' | 'desc')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{m.settings_general_sortAsc()}</SelectItem>
              <SelectItem value="desc">{m.settings_general_sortDesc()}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{m.settings_general_defaultSortHelp()}</p>
        </div>

        {/* Encryption Key Section - Always Visible */}
        <div className="space-y-3 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="encryption-key" className="text-sm font-medium">
              {m.settings_general_encryptionKey()}
            </Label>
            <p className="text-sm text-muted-foreground">
              {config.e2eeEncryption ? m.settings_general_encryptionE2EE() : m.settings_general_encryptionServer()}
            </p>
          </div>

          {/* Warning Alert based on encryption mode */}
          {config.e2eeEncryption ? (
            <Alert variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong className="text-red-900 dark:text-red-100">
                  {m.settings_general_encryptionWarningTitle()}
                </strong>{' '}
                {m.settings_general_encryptionWarningE2EE()}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-600 bg-yellow-50 dark:bg-yellow-950">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong className="text-yellow-900 dark:text-yellow-100">
                  {m.settings_general_encryptionServerTitle()}
                </strong>{' '}
                {m.settings_general_encryptionWarningServer()}
              </AlertDescription>
            </Alert>
          )}

          {/* Encryption Key Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="encryption-key"
                  type={showKey ? 'text' : 'password'}
                  value={encryptionKey}
                  onChange={handleKeyChange}
                  disabled={!isEditingKey}
                  className={`pr-10 font-mono text-sm ${!isEditingKey ? 'bg-muted' : ''}`}
                  placeholder={m.settings_general_encryptionPlaceholder()}
                  maxLength={32}
                  aria-label={m.settings_general_encryptionKey()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-0 top-0 h-full"
                  disabled={!encryptionKey}
                  aria-label={showKey ? m.settings_general_encryptionHide() : m.settings_general_encryptionShow()}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Action Buttons */}
              {isEditingKey ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCancelEdit}
                  className="h-10 w-10 shrink-0"
                  aria-label={m.settings_general_encryptionCancel()}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEditKey}
                    className="h-10 w-10 shrink-0"
                    aria-label={m.settings_general_encryptionEdit()}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyKey}
                    disabled={!encryptionKey}
                    className="h-10 w-10 shrink-0"
                    aria-label={m.settings_general_encryptionCopy()}
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {isEditingKey ? m.settings_general_encryptionHelpEditing() : m.settings_general_encryptionHelpViewing()}
            </p>
          </div>
        </div>

        {/* Note: First reference record setting removed - managed at field level */}

        {/* Searchable Fields */}
        <div className="space-y-2">
          <Label htmlFor="searchable-fields" className="text-sm font-medium">
            {m.settings_general_searchableFields()}
          </Label>
          <MultiSelectField
            id="searchable-fields"
            options={searchableFields.map((f) => ({ value: f.name, label: f.label }))}
            value={hashedKeywordFields}
            onChange={(values) => setHashedKeywordFields(values)}
            placeholder={m.settings_general_searchableFieldsPlaceholder()}
          />
          <p className="text-xs text-muted-foreground">{m.settings_general_searchableFieldsHelp()}</p>
        </div>
      </div>
    </SettingsSection>
  );
}
