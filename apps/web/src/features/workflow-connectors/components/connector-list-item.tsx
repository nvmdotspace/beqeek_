/**
 * Connector List Item Component
 *
 * Compact card matching Active Tables design style
 * - Colored icon (40px) on left
 * - Title + inline metadata (type badge, server status)
 * - Stats row (config fields, OAuth status, last updated)
 * - Three-dot menu for actions
 */

import { memo } from 'react';
import { MoreVertical, Server, Key, Hash, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Text, Heading } from '@workspace/ui/components/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import type { ConnectorInstance } from '@workspace/beqeek-shared/workflow-connectors';
import { CONNECTOR_TYPES } from '@workspace/beqeek-shared/workflow-connectors';
import { ROUTES } from '@/shared/route-paths';
import { cn } from '@workspace/ui/lib/utils';
import { ConnectorIcon, getConnectorColors } from './connector-icon';
import {
  getConnectorFieldCount,
  isOAuthConnector,
  hasValidOAuthToken,
  getFilledFieldCount,
  formatConnectorUpdateTime,
} from '../utils/connector-metadata';

interface ConnectorListItemProps {
  /** Connector instance */
  connector: ConnectorInstance;
  /** Current workspace ID */
  workspaceId: string;
  /** Current locale */
  locale: string;
  /** Edit handler */
  onEdit?: (connector: ConnectorInstance) => void;
  /** Delete handler */
  onDelete?: (connector: ConnectorInstance) => void;
}

const route = getRouteApi(ROUTES.WORKFLOW_CONNECTORS.LIST);

export const ConnectorListItem = memo(
  ({ connector, workspaceId, locale, onEdit, onDelete }: ConnectorListItemProps) => {
    const navigate = route.useNavigate();

    // Find connector type metadata
    const connectorType = CONNECTOR_TYPES.find((t) => t.type === connector.connectorType);
    const isOAuth = isOAuthConnector(connector.connectorType);
    const hasOAuthToken = hasValidOAuthToken(connector);
    const totalFields = getConnectorFieldCount(connector.connectorType);
    const filledFields = getFilledFieldCount(connector);
    const updatedAtLabel = formatConnectorUpdateTime(connector.updatedAt, locale);
    const colors = getConnectorColors(connector.connectorType);

    const handleClick = () => {
      navigate({
        to: ROUTES.WORKFLOW_CONNECTORS.DETAIL,
        params: { locale, workspaceId, connectorId: connector.id },
      });
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(connector);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(connector);
    };

    return (
      <Card
        className={cn(
          'group relative overflow-hidden',
          'border-border/60 shadow-sm',
          'transition-all duration-200',
          'hover:shadow-md',
          'cursor-pointer',
        )}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !target.closest('[role="button"]')) {
            handleClick();
          }
        }}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2.5 sm:gap-3">
            <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
              {/* Connector Icon */}
              <ConnectorIcon type={connector.connectorType} logo={connectorType?.logo} />

              <div className="flex-1 min-w-0 space-y-2">
                {/* Title */}
                <Heading level={4} className="text-base leading-tight line-clamp-2 break-words">
                  {connector.name}
                </Heading>

                {/* Inline metadata: Type badge + Server indicator */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] capitalize font-medium whitespace-nowrap', colors.badge)}
                  >
                    {connectorType?.name || connector.connectorType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-0.5 text-[10px] whitespace-nowrap h-4 px-1.5 text-muted-foreground"
                  >
                    <Server className="h-2.5 w-2.5 shrink-0" />
                    <span>Server</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Three-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClick}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Hash className="h-3 w-3" />
              <span>
                {filledFields}/{totalFields} fields
              </span>
            </div>
            {isOAuth && (
              <div className="flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                <span className={cn(hasOAuthToken ? 'text-accent-green' : 'text-muted-foreground')}>
                  {hasOAuthToken ? 'OAuth OK' : 'Not connected'}
                </span>
              </div>
            )}
          </div>

          {/* Last updated */}
          {updatedAtLabel && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <Text size="small" color="muted">
                {updatedAtLabel}
              </Text>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

ConnectorListItem.displayName = 'ConnectorListItem';
