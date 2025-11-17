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
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
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
          <Heading level={3}>Encryption Configuration</Heading>
        </CardHeader>
        <CardContent>
          <Text size="small" color="muted">
            End-to-end encryption is not enabled for this table. All data is encrypted at rest on the server.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Heading level={3}>Encryption Configuration</Heading>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="aes" className="text-xs">
              <Inline space="space-025" align="center">
                <Shield className="h-3.5 w-3.5" />
                AES ({fieldsByType.aes.length})
              </Inline>
            </TabsTrigger>
            <TabsTrigger value="ope" className="text-xs">
              <Inline space="space-025" align="center">
                <Lock className="h-3.5 w-3.5" />
                OPE ({fieldsByType.ope.length})
              </Inline>
            </TabsTrigger>
            <TabsTrigger value="hmac" className="text-xs">
              <Inline space="space-025" align="center">
                <Hash className="h-3.5 w-3.5" />
                HMAC ({fieldsByType.hmac.length})
              </Inline>
            </TabsTrigger>
            <TabsTrigger value="none" className="text-xs">
              <Inline space="space-025" align="center">
                <Unlock className="h-3.5 w-3.5" />
                None ({fieldsByType.none.length})
              </Inline>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aes" className="mt-4">
            <Stack space="space-075">
              <Box padding="space-075" borderRadius="lg" backgroundColor="muted">
                <Stack space="space-025">
                  <Heading level={4}>AES-256-CBC Encryption</Heading>
                  <Text size="small" color="muted" className="text-xs">
                    Strong encryption for text fields. Provides full confidentiality but prevents server-side searching.
                  </Text>
                </Stack>
              </Box>
              {fieldsByType.aes.length > 0 ? (
                <Inline space="space-050" wrap>
                  {fieldsByType.aes.map((field) => (
                    <Badge key={field.name} variant="outline">
                      <Inline space="space-025" align="center">
                        <Shield className="h-3 w-3" />
                        {field.label}
                      </Inline>
                    </Badge>
                  ))}
                </Inline>
              ) : (
                <Text size="small" color="muted">
                  No fields using AES-256-CBC encryption
                </Text>
              )}
            </Stack>
          </TabsContent>

          <TabsContent value="ope" className="mt-4">
            <Stack space="space-075">
              <Box padding="space-075" borderRadius="lg" backgroundColor="muted">
                <Stack space="space-025">
                  <Heading level={4}>Order-Preserving Encryption (OPE)</Heading>
                  <Text size="small" color="muted" className="text-xs">
                    Encryption that preserves numeric/date ordering. Enables range queries and sorting on encrypted
                    data.
                  </Text>
                </Stack>
              </Box>
              {fieldsByType.ope.length > 0 ? (
                <Inline space="space-050" wrap>
                  {fieldsByType.ope.map((field) => (
                    <Badge key={field.name} variant="outline">
                      <Inline space="space-025" align="center">
                        <Lock className="h-3 w-3" />
                        {field.label}
                      </Inline>
                    </Badge>
                  ))}
                </Inline>
              ) : (
                <Text size="small" color="muted">
                  No fields using OPE encryption
                </Text>
              )}
            </Stack>
          </TabsContent>

          <TabsContent value="hmac" className="mt-4">
            <Stack space="space-075">
              <Box padding="space-075" borderRadius="lg" backgroundColor="muted">
                <Stack space="space-025">
                  <Heading level={4}>HMAC-SHA256 Hashing</Heading>
                  <Text size="small" color="muted" className="text-xs">
                    One-way hashing for select fields. Enables exact-match filtering without revealing values.
                  </Text>
                </Stack>
              </Box>
              {fieldsByType.hmac.length > 0 ? (
                <Inline space="space-050" wrap>
                  {fieldsByType.hmac.map((field) => (
                    <Badge key={field.name} variant="outline">
                      <Inline space="space-025" align="center">
                        <Hash className="h-3 w-3" />
                        {field.label}
                      </Inline>
                    </Badge>
                  ))}
                </Inline>
              ) : (
                <Text size="small" color="muted">
                  No fields using HMAC hashing
                </Text>
              )}
            </Stack>
          </TabsContent>

          <TabsContent value="none" className="mt-4">
            <Stack space="space-075">
              <Box padding="space-075" borderRadius="lg" backgroundColor="muted">
                <Stack space="space-025">
                  <Heading level={4}>No Encryption</Heading>
                  <Text size="small" color="muted" className="text-xs">
                    Fields that are not encrypted client-side (e.g., file attachments, user references).
                  </Text>
                </Stack>
              </Box>
              {fieldsByType.none.length > 0 ? (
                <Inline space="space-050" wrap>
                  {fieldsByType.none.map((field) => (
                    <Badge key={field.name} variant="secondary">
                      <Inline space="space-025" align="center">
                        <Unlock className="h-3 w-3" />
                        {field.label}
                      </Inline>
                    </Badge>
                  ))}
                </Inline>
              ) : (
                <Text size="small" color="muted">
                  All fields are encrypted
                </Text>
              )}
            </Stack>
          </TabsContent>
        </Tabs>

        {/* Hashed Keyword Fields */}
        {hashedKeywordFields.length > 0 && (
          <Box className="mt-6">
            <Stack space="space-050">
              <Heading level={4}>Searchable Fields (Hashed Keywords)</Heading>
              <Text size="small" color="muted" className="text-xs">
                These encrypted fields support full-text search through hashed keywords:
              </Text>
              <Inline space="space-050" wrap>
                {hashedKeywordFields.map((fieldName) => {
                  const field = fields.find((f) => f.name === fieldName);
                  return (
                    <Badge key={fieldName} variant="outline">
                      {field?.label || fieldName}
                    </Badge>
                  );
                })}
              </Inline>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
