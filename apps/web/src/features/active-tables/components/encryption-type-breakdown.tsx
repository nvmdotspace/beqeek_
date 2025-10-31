/**
 * EncryptionTypeBreakdown Component
 *
 * Displays which fields use which encryption algorithm
 * Shows categorized tabs for:
 * - AES-256-CBC (text fields)
 * - OPE (numbers, dates)
 * - HMAC-SHA256 (selects)
 * - Unencrypted fields
 * Also shows hashed keyword fields for searchability
 */

import { useMemo } from 'react';
import { Shield, Lock, Hash, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getEncryptionTypeForField } from '@workspace/active-tables-core';
import type { ActiveFieldConfig } from '../types';

export interface EncryptionTypeBreakdownProps {
  fields: ActiveFieldConfig[];
  hashedKeywordFields: string[];
  isE2EEEnabled: boolean;
}

export function EncryptionTypeBreakdown({ fields, hashedKeywordFields, isE2EEEnabled }: EncryptionTypeBreakdownProps) {
  // Categorize fields by encryption type
  const fieldsByType = useMemo(() => {
    if (!isE2EEEnabled) {
      return {
        aes: [],
        ope: [],
        hmac: [],
        none: fields,
      };
    }

    const aes: ActiveFieldConfig[] = [];
    const ope: ActiveFieldConfig[] = [];
    const hmac: ActiveFieldConfig[] = [];
    const none: ActiveFieldConfig[] = [];

    fields.forEach((field) => {
      const encType = getEncryptionTypeForField(field.type);
      switch (encType) {
        case 'AES-256-CBC':
          aes.push(field);
          break;
        case 'OPE':
          ope.push(field);
          break;
        case 'HMAC-SHA256':
          hmac.push(field);
          break;
        default:
          none.push(field);
      }
    });

    return { aes, ope, hmac, none };
  }, [fields, isE2EEEnabled]);

  if (!isE2EEEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Encryption Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            End-to-end encryption is not enabled for this table. All data is encrypted at rest on the server.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encryption Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="aes" className="text-xs">
              <Shield className="mr-1 h-3.5 w-3.5" />
              AES ({fieldsByType.aes.length})
            </TabsTrigger>
            <TabsTrigger value="ope" className="text-xs">
              <Lock className="mr-1 h-3.5 w-3.5" />
              OPE ({fieldsByType.ope.length})
            </TabsTrigger>
            <TabsTrigger value="hmac" className="text-xs">
              <Hash className="mr-1 h-3.5 w-3.5" />
              HMAC ({fieldsByType.hmac.length})
            </TabsTrigger>
            <TabsTrigger value="none" className="text-xs">
              <Unlock className="mr-1 h-3.5 w-3.5" />
              None ({fieldsByType.none.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aes" className="space-y-3 mt-4">
            <div className="rounded-lg bg-muted p-3">
              <h4 className="font-semibold text-sm mb-1">AES-256-CBC Encryption</h4>
              <p className="text-xs text-muted-foreground">
                Strong encryption for text fields. Provides full confidentiality but prevents server-side searching.
              </p>
            </div>
            {fieldsByType.aes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fieldsByType.aes.map((field) => (
                  <Badge key={field.name} variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {field.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No fields using AES-256-CBC encryption</p>
            )}
          </TabsContent>

          <TabsContent value="ope" className="space-y-3 mt-4">
            <div className="rounded-lg bg-muted p-3">
              <h4 className="font-semibold text-sm mb-1">Order-Preserving Encryption (OPE)</h4>
              <p className="text-xs text-muted-foreground">
                Encryption that preserves numeric/date ordering. Enables range queries and sorting on encrypted data.
              </p>
            </div>
            {fieldsByType.ope.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fieldsByType.ope.map((field) => (
                  <Badge key={field.name} variant="outline" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {field.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No fields using OPE encryption</p>
            )}
          </TabsContent>

          <TabsContent value="hmac" className="space-y-3 mt-4">
            <div className="rounded-lg bg-muted p-3">
              <h4 className="font-semibold text-sm mb-1">HMAC-SHA256 Hashing</h4>
              <p className="text-xs text-muted-foreground">
                One-way hashing for select fields. Enables exact-match filtering without revealing values.
              </p>
            </div>
            {fieldsByType.hmac.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fieldsByType.hmac.map((field) => (
                  <Badge key={field.name} variant="outline" className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {field.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No fields using HMAC hashing</p>
            )}
          </TabsContent>

          <TabsContent value="none" className="space-y-3 mt-4">
            <div className="rounded-lg bg-muted p-3">
              <h4 className="font-semibold text-sm mb-1">No Encryption</h4>
              <p className="text-xs text-muted-foreground">
                Fields that are not encrypted client-side (e.g., file attachments, user references).
              </p>
            </div>
            {fieldsByType.none.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fieldsByType.none.map((field) => (
                  <Badge key={field.name} variant="secondary" className="flex items-center gap-1">
                    <Unlock className="h-3 w-3" />
                    {field.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All fields are encrypted</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Hashed Keyword Fields */}
        {hashedKeywordFields.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm">Searchable Fields (Hashed Keywords)</h4>
            <p className="text-xs text-muted-foreground">
              These encrypted fields support full-text search through hashed keywords:
            </p>
            <div className="flex flex-wrap gap-2">
              {hashedKeywordFields.map((fieldName) => {
                const field = fields.find((f) => f.name === fieldName);
                return (
                  <Badge key={fieldName} variant="outline">
                    {field?.label || fieldName}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
