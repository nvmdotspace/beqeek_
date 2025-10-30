import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { useNavigate, useLocation, useParams } from '@tanstack/react-router';

// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useActiveTableRecordsWithConfig } from '../hooks/use-active-tables';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { decryptRecords, clearDecryptionCache } from '@workspace/active-tables-core';
import { useCurrentLocale } from '@/hooks/use-current-locale';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

const LoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

export const ActiveTableRecordsPage = () => {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const locale = useCurrentLocale();

  // Extract params from URL - these are now the source of truth
  const tableId = (params as any).tableId as string;
  const workspaceId = (params as any).workspaceId as string;

  // Use combined hook to ensure table config loads before records
  // This prevents race conditions in encryption/decryption logic
  const {
    table,
    tableLoading,
    tableError,
    records,
    recordsLoading,
    recordsError,
    isReady,
    nextId,
    previousId,
  } = useActiveTableRecordsWithConfig(workspaceId, tableId, {
    paging: 'cursor',
    limit: 50,
    direction: 'desc',
  });

  // Initialize encryption hook (now guaranteed to have table.config when records load)
  const encryption = useTableEncryption(workspaceId ?? '', tableId, table?.config);

  // Decrypt records if E2EE enabled and key is valid
  const [decryptedRecords, setDecryptedRecords] = useState(records);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const decryptAllRecords = async () => {
      // Guard: Wait for table config to be loaded
      if (!isReady || !table?.config) {
        return;
      }

      // Determine encryption key source
      let decryptionKey: string | null = null;

      if (encryption.isE2EEEnabled) {
        // E2EE mode: Key from localStorage (user must input)
        if (!encryption.isKeyValid || !encryption.encryptionKey) {
          // No valid key - show encrypted data
          setDecryptedRecords(records);
          return;
        }
        decryptionKey = encryption.encryptionKey;
      } else {
        // Server-side encryption mode: Key provided by server in config
        decryptionKey = table.config.encryptionKey ?? null;
      }

      // If no encryption key available, show raw records
      if (!decryptionKey) {
        setDecryptedRecords(records);
        return;
      }

      // Decrypt records with available key using batch decryption
      // Benefits: LRU caching, optimized batch processing, better error handling
      setIsDecrypting(true);
      try {
        const decrypted = await decryptRecords(
          records,
          table.config.fields ?? [],
          decryptionKey!,
          true, // useCache - enable LRU caching for performance
          50    // batchSize - process 50 records at a time
        );
        setDecryptedRecords(decrypted);
      } catch (error) {
        console.error('Failed to decrypt records:', error);
        setDecryptedRecords(records);
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptAllRecords();

    // Cleanup: Clear decryption cache when table changes
    return () => {
      // Only clear cache when actually switching tables, not on every re-render
      if (table?.id) {
        clearDecryptionCache();
      }
    };
  }, [
    isReady, // Wait for both table and records to be ready
    records,
    encryption.isE2EEEnabled,
    encryption.isKeyValid,
    encryption.encryptionKey,
    table?.config,
    table?.id,
  ]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return decryptedRecords;

    const query = searchQuery.toLowerCase();
    return decryptedRecords.filter((record) => {
      return Object.values(record.record).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      });
    });
  }, [decryptedRecords, searchQuery]);

  const handleBack = () => {
    navigate({
      to: '/$locale/workspaces/$workspaceId/tables/$tableId',
      params: { locale: locale || 'vi', workspaceId, tableId },
    });
  };

  const handleCreateRecord = () => {
    // TODO: Open create record modal
    console.log('Create record');
  };

  const handleViewRecord = (recordId: string) => {
    // TODO: Navigate to record detail page
    console.log('View record:', recordId);
  };

  const isLoading = tableLoading || recordsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Table
        </Button>
        <LoadingState />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">Table not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recordsError) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Table
        </Button>
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load records</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display fields (first 5 fields)
  const displayFields = table.config?.fields?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Table
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{table.name}</h1>
          {table.description && (
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">{table.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {encryption.isE2EEEnabled && (
            <Badge
              variant="outline"
              className={
                encryption.keyValidationStatus === 'valid'
                  ? 'border-green-500 text-green-700'
                  : 'border-yellow-500 text-yellow-700'
              }
            >
              {encryption.keyValidationStatus === 'valid' ? 'E2EE Active' : 'E2EE (Key Required)'}
            </Badge>
          )}
          <Badge variant="outline">{filteredRecords.length} records</Badge>
        </div>
      </div>

      {/* Encryption Warning */}
      {encryption.isE2EEEnabled && encryption.keyValidationStatus !== 'valid' && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              Encryption key is required to view encrypted data. Please go back to the table detail page to enter your
              encryption key.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={handleCreateRecord}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  {displayFields.map((field) => (
                    <TableHead key={field.name}>{field.label}</TableHead>
                  ))}
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={displayFields.length + 2} className="text-center py-8 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewRecord(record.id)}
                    >
                      <TableCell className="font-mono text-xs">{record.id.slice(-8)}</TableCell>
                      {displayFields.map((field) => {
                        const value = record.record[field.name];
                        let displayValue = value;

                        if (value === null || value === undefined) {
                          displayValue = '-';
                        } else if (typeof value === 'object') {
                          displayValue = JSON.stringify(value);
                        } else if (typeof value === 'boolean') {
                          displayValue = value ? 'Yes' : 'No';
                        }

                        return (
                          <TableCell key={field.name} className="max-w-[200px] truncate">
                            {String(displayValue)}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination (TODO) */}
      {nextId && (
        <div className="flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
};

export default ActiveTableRecordsPage;
