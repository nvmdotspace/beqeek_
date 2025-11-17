import { Copy, Check, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Stack, Inline } from '@workspace/ui/components/primitives';

import type { ActiveTable } from '../../types';
import { useTableEncryption } from '../../hooks/use-table-encryption';

export interface GeneralSettingsTabProps {
  table: ActiveTable;
  workspaceId: string;
}

/**
 * General Settings Tab
 *
 * Displays and allows editing of general table configuration:
 * - Table ID (read-only)
 * - Encryption key (editable for E2EE tables)
 * - Record limit
 * - Default sort direction
 * - Searchable fields
 */
export const GeneralSettingsTab = ({ table, workspaceId }: GeneralSettingsTabProps) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  const { encryptionKey, saveKey } = useTableEncryption(workspaceId, table.id, table.config);

  const displayKey = encryptionKey || table.config.encryptionKey || '';
  const fields = table.config.fields || [];
  const hashedKeywordFields = table.config.hashedKeywordFields || [];

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(table.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  const handleCopyKey = async () => {
    if (!displayKey) return;

    try {
      await navigator.clipboard.writeText(displayKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const handleSaveKey = () => {
    if (!keyInput.trim()) {
      alert('Please enter an encryption key');
      return;
    }

    try {
      saveKey(keyInput.trim());
      setKeyInput('');
      alert('Encryption key saved successfully!');
    } catch (error) {
      console.error('Failed to save key:', error);
      alert('Failed to save encryption key: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Stack space="space-300">
      {/* Table Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình chung (General Configuration)</CardTitle>
          <CardDescription>Basic table information and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack space="space-100">
            {/* Table ID (Read-only) */}
            <Stack space="space-050">
              <Label htmlFor="table-id" className="text-sm font-medium">
                ID Bảng
              </Label>
              <Inline space="space-050">
                <Input id="table-id" value={table.id} readOnly className="flex-1 bg-muted font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopyId} className="shrink-0">
                  {copiedId ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </Inline>
            </Stack>

            {/* Encryption Key - Always show */}
            <Stack space="space-050">
              <Label htmlFor="encryption-key" className="text-sm font-medium">
                Khóa mã hóa
              </Label>
              <Inline space="space-050">
                <div className="relative flex-1">
                  <Input
                    id="encryption-key"
                    type={showKey ? 'text' : 'password'}
                    value={displayKey}
                    readOnly
                    className="pr-10 bg-muted font-mono text-sm"
                    placeholder={displayKey ? undefined : 'No encryption key configured'}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-0 top-0 h-full"
                    disabled={!displayKey}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  disabled={!displayKey}
                  className="shrink-0"
                >
                  {copiedKey ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </Inline>

              {/* Update Key Section - Show input when no key exists */}
              {!displayKey && (
                <Stack space="space-050" className="mt-2">
                  <Inline space="space-050">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="Enter 32-character encryption key"
                      className="flex-1 font-mono text-sm"
                    />
                    <Button onClick={handleSaveKey} size="sm" variant="default">
                      <Inline space="space-050" align="center">
                        <Save className="h-4 w-4" />
                        Lưu
                      </Inline>
                    </Button>
                  </Inline>
                  <p className="text-xs text-muted-foreground">Enter encryption key to enable data decryption</p>
                </Stack>
              )}
            </Stack>

            {/* Record Limit */}
            <Stack space="space-050">
              <Label htmlFor="record-limit" className="text-sm font-medium">
                Giới hạn bản ghi (Tối đa 1000) *
              </Label>
              <Input
                id="record-limit"
                type="number"
                value={table.config.tableLimit || 1000}
                readOnly
                className="bg-muted"
              />
            </Stack>

            {/* Default Sort */}
            <Stack space="space-050">
              <Label htmlFor="default-sort" className="text-sm font-medium">
                Chiều sắp xếp mặc định *
              </Label>
              <Input id="default-sort" value={table.config.defaultSort || 'Cũ nhất'} readOnly className="bg-muted" />
            </Stack>

            {/* Searchable Fields */}
            <Stack space="space-050">
              <Label className="text-sm font-medium">Trường dữ liệu tìm kiếm *</Label>
              {hashedKeywordFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No searchable fields configured</p>
              ) : (
                <Inline space="space-050" wrap>
                  {hashedKeywordFields.map((fieldName) => {
                    const field = fields.find((f) => f.name === fieldName);
                    return (
                      <Badge key={fieldName} variant="outline" className="px-3 py-1.5 text-sm">
                        × {field?.label || fieldName} ({field?.type || 'SHORT_TEXT'})
                      </Badge>
                    );
                  })}
                </Inline>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Metadata */}
      {(table.createdAt || table.updatedAt) && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Creation and update information</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack space="space-100">
              {table.createdAt && (
                <Stack space="space-050">
                  <Label>Created At</Label>
                  <div className="text-sm text-muted-foreground">
                    {new Date(table.createdAt).toLocaleString('vi-VN')}
                  </div>
                </Stack>
              )}

              {table.updatedAt && (
                <Stack space="space-050">
                  <Label>Last Updated</Label>
                  <div className="text-sm text-muted-foreground">
                    {new Date(table.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
