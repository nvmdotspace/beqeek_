/**
 * Connector List Page
 *
 * Main list view showing all connectors with category filtering
 */

import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Plus, Link2, CheckCircle2, XCircle, Filter } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { ROUTES } from '@/shared/route-paths';
import { useConnectors } from '../api/connector-api';
import { ConnectorListItem } from '../components/connector-list-item';
import { EmptyState } from '../components/empty-state';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';
import { FilterChip } from '@workspace/ui/components/filter-chip';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { StatBadge } from '@/features/workspace/components/stat-badge';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';
import { CONNECTOR_TYPES, CONNECTOR_CONFIGS } from '@workspace/beqeek-shared/workflow-connectors';

const route = getRouteApi(ROUTES.WORKFLOW_CONNECTORS.LIST);

export function ConnectorListPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<'all' | 'connected' | 'not_connected'>('all');

  const { data: connectors = [], isLoading } = useConnectors(workspaceId);

  // Calculate stats
  const totalConnectors = connectors.length;
  const connectedConnectors = useMemo(
    () => connectors.filter((c) => c.config && Object.keys(c.config).length > 0).length,
    [connectors],
  );
  const oauthConnectors = useMemo(
    () =>
      connectors.filter((c) => {
        const configDef = CONNECTOR_CONFIGS.find((cfg) => cfg.connectorType === c.connectorType);
        return configDef?.oauth;
      }).length,
    [connectors],
  );

  // Get unique connector types
  const availableTypes = useMemo(() => {
    const types = new Set(connectors.map((c) => c.connectorType));
    return Array.from(types);
  }, [connectors]);

  // Filter connectors
  const filteredConnectors = useMemo(() => {
    return connectors.filter((connector) => {
      const typeMatches = typeFilter === 'all' || connector.connectorType === typeFilter;
      const hasConfig = connector.config && Object.keys(connector.config).length > 0;
      const connectionMatches =
        connectionFilter === 'all' || (connectionFilter === 'connected' ? hasConfig : !hasConfig);
      return typeMatches && connectionMatches;
    });
  }, [connectors, typeFilter, connectionFilter]);

  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) + (connectionFilter !== 'all' ? 1 : 0);

  const handleCreateClick = () => {
    navigate({
      to: ROUTES.WORKFLOW_CONNECTORS.SELECT,
      params: { locale, workspaceId },
    });
  };

  return (
    <Box padding="space-300">
      <Stack space="space-300">
        {/* Header */}
        {/* TODO: Migrate to primitives when responsive gap support is added */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Stack space="space-025">
            <Heading level={1}>{m.connectors_page_title()}</Heading>
            <Text size="small" color="muted">
              {m.connectors_page_subtitle()}
            </Text>
          </Stack>

          <Button variant="brand-primary" size="sm" onClick={handleCreateClick}>
            <Plus className="mr-2 size-4" />
            {m.connectors_page_create()}
          </Button>
        </div>

        {/* Stats */}
        <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
          <StatBadge
            icon={Link2}
            value={totalConnectors}
            label={m.connectors_page_statTotal()}
            color="accent-blue"
            loading={isLoading}
          />
          <StatBadge
            icon={CheckCircle2}
            value={connectedConnectors}
            label={m.connectors_page_statConnected()}
            color="success"
            loading={isLoading}
          />
          <StatBadge
            icon={XCircle}
            value={oauthConnectors}
            label={m.connectors_page_statOAuth()}
            color="accent-purple"
            loading={isLoading}
          />
        </Inline>

        {/* Filters */}
        <Stack space="space-100">
          <Inline space="space-050" wrap className="text-xs text-muted-foreground">
            <Badge variant="outline" className="border-dashed">
              {filteredConnectors.length === 1
                ? m.connectors_page_connectorCount({ count: filteredConnectors.length })
                : m.connectors_page_connectorCountPlural({ count: filteredConnectors.length })}
            </Badge>
            <div className="rounded-full border border-border/60 text-xs text-foreground">
              <Box padding="space-025" className="px-3">
                <Inline space="space-050" align="center">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  {activeFilterCount
                    ? m.connectors_page_filterApplied({ count: activeFilterCount })
                    : m.connectors_page_noFilters()}
                </Inline>
              </Box>
            </div>
          </Inline>

          <Box padding="space-100" backgroundColor="card" borderRadius="xl" border="default" className="shadow-sm">
            <Stack space="space-100">
              {/* Connector Type Filter */}
              {availableTypes.length > 0 && (
                <Inline space="space-100" align="start">
                  <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1">
                    {m.connectors_page_filterType()}
                  </Text>
                  <Inline space="space-075" wrap align="center" className="flex-1">
                    <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                      {m.connectors_page_filterAll()}
                    </FilterChip>
                    {availableTypes.map((type) => {
                      const typeDef = CONNECTOR_TYPES.find((t) => t.type === type);
                      return (
                        <FilterChip key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
                          {typeDef?.name || type}
                        </FilterChip>
                      );
                    })}
                  </Inline>
                </Inline>
              )}

              {/* Connection Status Filter */}
              <Inline space="space-100" align="start">
                <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1">
                  {m.connectors_page_filterStatus()}
                </Text>
                <Inline space="space-075" wrap align="center" className="flex-1">
                  <FilterChip active={connectionFilter === 'all'} onClick={() => setConnectionFilter('all')}>
                    {m.connectors_page_filterAll()}
                  </FilterChip>
                  <FilterChip
                    active={connectionFilter === 'connected'}
                    onClick={() => setConnectionFilter('connected')}
                    variant="success"
                  >
                    {m.connectors_page_filterConnected()}
                  </FilterChip>
                  <FilterChip
                    active={connectionFilter === 'not_connected'}
                    onClick={() => setConnectionFilter('not_connected')}
                  >
                    {m.connectors_page_filterNotConnected()}
                  </FilterChip>
                </Inline>
              </Inline>
            </Stack>
          </Box>
        </Stack>

        {/* List content */}
        {isLoading ? (
          <Grid
            columns={1}
            gap="space-100"
            className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </Grid>
        ) : filteredConnectors.length > 0 ? (
          <Grid
            columns={1}
            gap="space-100"
            className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {filteredConnectors.map((connector) => (
              <ConnectorListItem key={connector.id} connector={connector} workspaceId={workspaceId} locale={locale} />
            ))}
          </Grid>
        ) : (
          <EmptyState
            message={
              typeFilter === 'all' && connectionFilter === 'all'
                ? m.connectors_page_empty()
                : m.connectors_page_noResults()
            }
            description={
              typeFilter === 'all' && connectionFilter === 'all'
                ? m.connectors_page_emptyDesc()
                : m.connectors_page_noResultsDesc()
            }
          />
        )}
      </Stack>
    </Box>
  );
}
