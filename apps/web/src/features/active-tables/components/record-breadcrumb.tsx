/**
 * RecordBreadcrumb - Breadcrumb navigation for record detail page
 */

import { ChevronRight, Home } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Text } from '@workspace/ui/components/typography';
import { ROUTES } from '@/shared/route-paths';
import type { Table, TableRecord } from '@workspace/active-tables-core';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

interface RecordBreadcrumbProps {
  table: Table;
  record: TableRecord;
  referenceRecords?: Record<string, TableRecord[]>;
}

export function RecordBreadcrumb({ table, record, referenceRecords }: RecordBreadcrumbProps) {
  const { locale, workspaceId } = route.useParams();
  const navigate = route.useNavigate();

  // Get record title from layout-specific field
  // head-detail should use titleField, but API may return headTitleField
  // two-column-detail uses headTitleField
  const config = table.config.recordDetailConfig;
  const titleFieldName =
    config?.headTitleField || // Try headTitleField first (actual API response)
    config?.titleField || // Fallback to titleField (spec)
    table.config.fields[0]?.name; // Final fallback to first field

  const recordData = (record as any).data || record.record || record;
  let titleValue = titleFieldName ? recordData[titleFieldName] : null;

  // Check if titleField is a reference field and lookup the actual value
  const titleField = table.config.fields.find((f) => f.name === titleFieldName);
  if (titleField?.referenceTableId && titleValue && referenceRecords) {
    const refRecords = referenceRecords[titleField.referenceTableId] || [];
    const refRecord = refRecords.find((r) => r.id === String(titleValue));
    if (refRecord) {
      const labelField = titleField.referenceLabelField || 'name';
      const refData = (refRecord as any).data || refRecord.record || refRecord;
      titleValue = refData[labelField] || titleValue;
    }
  }

  const recordTitle = titleValue != null && titleValue !== '' ? String(titleValue) : record.id;

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <nav aria-label="Breadcrumb" className="py-2">
      <Inline space="space-100" align="center" className="flex-wrap">
        {/* Workspace */}
        <button
          onClick={() => navigate({ to: ROUTES.ACTIVE_TABLES.LIST, params: { locale, workspaceId } })}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="size-3.5" />
          <Text size="small">Tables</Text>
        </button>

        <ChevronRight className="size-3.5 text-muted-foreground" />

        {/* Table */}
        <button
          onClick={() =>
            navigate({
              to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
              params: { locale, workspaceId, tableId: table.id },
            })
          }
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Text size="small">{truncateTitle(table.name)}</Text>
        </button>

        <ChevronRight className="size-3.5 text-muted-foreground" />

        {/* Record */}
        <Text size="small" className="text-foreground font-medium" aria-current="page">
          {truncateTitle(recordTitle)}
        </Text>
      </Inline>
    </nav>
  );
}
