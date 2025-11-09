import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Clock, Database, Workflow, FileText, X, TrendingUp, Activity } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { useSidebarStore, selectRecentItems, selectCurrentWorkspace } from '@/stores/sidebar-store';
import type { RecentItem } from '@/stores/sidebar-store';

interface ActivityTrackingProps {
  isCollapsed?: boolean;
  className?: string;
}

const getItemIcon = (type: RecentItem['type']) => {
  switch (type) {
    case 'table':
      return Database;
    case 'workflow':
      return Workflow;
    case 'form':
      return FileText;
    case 'record':
      return Database;
    default:
      return Activity;
  }
};

const getItemTypeLabel = (type: RecentItem['type']) => {
  switch (type) {
    case 'table':
      return m.activity_table();
    case 'workflow':
      return m.activity_workflow();
    case 'form':
      return m.activity_form();
    case 'record':
      return m.activity_record();
    default:
      return m.activity_item();
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const ActivityTracking = ({ isCollapsed = false, className }: ActivityTrackingProps) => {
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const recentItems = useSidebarStore(selectRecentItems);
  const { removeRecentItem, clearRecentItems } = useSidebarStore();

  const buildItemHref = (item: RecentItem) => {
    switch (item.type) {
      case 'table':
        return `/workspaces/tables/${item.id}`;
      case 'workflow':
        return `/workflows/${item.id}`;
      case 'form':
        return `/forms/${item.id}`;
      case 'record':
        return item.tableId ? `/workspaces/tables/${item.tableId}/records/${item.id}` : '/workspaces';
      default:
        return '/workspaces';
    }
  };

  const handleItemClick = (item: RecentItem) => {
    const href = buildItemHref(item);
    if (href) {
      window.location.assign(href);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeRecentItem(itemId);
  };

  const handleClearAll = () => {
    clearRecentItems();
  };

  // Filter recent items by current workspace
  const workspaceRecentItems = currentWorkspace
    ? recentItems.filter((item) => item.workspaceId === currentWorkspace.id)
    : [];

  if (isCollapsed) {
    return null; // Don't show in collapsed state
  }

  return (
    <div className={cn('px-3 py-2', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {m.activity_recentActivity()}
        </h3>
        {workspaceRecentItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {m.activity_clearAll()}
          </Button>
        )}
      </div>

      {/* Recent Items List */}
      {workspaceRecentItems.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{m.activity_noRecentItems()}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {workspaceRecentItems.slice(0, 5).map((item) => {
            const Icon = getItemIcon(item.type);
            const typeLabel = getItemTypeLabel(item.type);
            const timeAgo = formatRelativeTime(item.accessedAt);

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group flex items-start gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted flex-shrink-0 mt-0.5">
                  <Icon className="h-3 w-3" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemoveItem(e, item.id)}
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {typeLabel}
                    </Badge>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {workspaceRecentItems.length > 5 && (
            <div className="pt-2 text-center">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                {m.activity_viewAll()}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Activity Summary */}
      {currentWorkspace && workspaceRecentItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{m.activity_summary({ count: workspaceRecentItems.length })}</span>
          </div>
        </div>
      )}
    </div>
  );
};
