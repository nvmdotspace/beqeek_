/**
 * RecordBreadcrumb - Breadcrumb navigation for record detail page
 */

import { ChevronRight, Home } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Text } from '@workspace/ui/components/typography';
import { ROUTES } from '@/shared/route-paths';
import type { Table } from '@workspace/active-tables-core';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

interface RecordBreadcrumbProps {
  table: Table;
}

export function RecordBreadcrumb({ table }: RecordBreadcrumbProps) {
  const { locale, workspaceId } = route.useParams();
  const navigate = route.useNavigate();

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

        {/* Current Table */}
        <Text size="small" className="text-foreground font-medium" aria-current="page">
          {table.name}
        </Text>
      </Inline>
    </nav>
  );
}
