/**
 * Record Detail Sidebar Component
 *
 * Right sidebar showing:
 * - Status badge
 * - Metadata (created, updated, assignee)
 * - Quick actions (edit, duplicate, delete, share)
 * - Related records
 * - Tags/labels
 */

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
import { Pencil, Copy, Share, Trash2, User, Calendar, Clock } from 'lucide-react';
import type { Table, TableRecord } from '@workspace/active-tables-core';
import type { ActiveTableRecordPermissions } from '../types';

export interface RecordDetailSidebarProps {
  table: Table;
  record: TableRecord;
  permissions?: ActiveTableRecordPermissions;
  workspaceUsers?: Array<{ id: string; name: string; avatar?: string }>;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  locale?: string;
  className?: string;
}

/**
 * Sidebar with metadata and quick actions
 */
export function RecordDetailSidebar({
  table,
  record,
  permissions,
  workspaceUsers,
  onEdit,
  onDuplicate,
  onDelete,
  onShare,
  locale = 'vi',
  className = '',
}: RecordDetailSidebarProps) {
  // Get user info
  const createdByUser = workspaceUsers?.find((u) => u.id === record.createdBy);
  const updatedByUser = workspaceUsers?.find((u) => u.id === record.updatedBy);
  const assignedUsers = record.assignedUserIds?.map((id) => workspaceUsers?.find((u) => u.id === id)).filter(Boolean);

  // Format timestamps
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return '-';
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: locale === 'vi' ? vi : undefined,
      });
    } catch {
      return timestamp;
    }
  };

  // Labels
  const labels = {
    status: locale === 'vi' ? 'Trạng thái' : 'Status',
    details: locale === 'vi' ? 'Chi tiết' : 'Details',
    created: locale === 'vi' ? 'Tạo lúc' : 'Created',
    updated: locale === 'vi' ? 'Cập nhật' : 'Updated',
    assignee: locale === 'vi' ? 'Người thực hiện' : 'Assignee',
    actions: locale === 'vi' ? 'Hành động' : 'Actions',
    edit: locale === 'vi' ? 'Chỉnh sửa' : 'Edit',
    duplicate: locale === 'vi' ? 'Nhân bản' : 'Duplicate',
    share: locale === 'vi' ? 'Chia sẻ' : 'Share',
    delete: locale === 'vi' ? 'Xóa' : 'Delete',
    unassigned: locale === 'vi' ? 'Chưa phân công' : 'Unassigned',
  };

  // Get status from record (if status field exists)
  const statusField = table.config.fields?.find((f) => f.name === 'status');
  const statusValue = statusField ? record.data?.[statusField.name] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Card */}
      {statusValue && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{labels.status}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-sm">
              {String(statusValue)}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Metadata Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{labels.details}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Created */}
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">{labels.created}</div>
              <div className="text-sm font-medium">{formatTime(record.createdAt)}</div>
              {createdByUser && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Avatar className="h-4 w-4">
                    {createdByUser.avatar && <AvatarImage src={createdByUser.avatar} />}
                    <AvatarFallback className="text-[8px]">
                      {createdByUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{createdByUser.name}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Updated */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">{labels.updated}</div>
              <div className="text-sm font-medium">{formatTime(record.updatedAt)}</div>
              {updatedByUser && record.updatedBy !== record.createdBy && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Avatar className="h-4 w-4">
                    {updatedByUser.avatar && <AvatarImage src={updatedByUser.avatar} />}
                    <AvatarFallback className="text-[8px]">
                      {updatedByUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{updatedByUser.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          {(assignedUsers && assignedUsers.length > 0) ||
            (true /* Always show assignee section */ && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">{labels.assignee}</div>
                    {assignedUsers && assignedUsers.length > 0 ? (
                      <div className="space-y-1.5">
                        {assignedUsers.map((user) => (
                          <div key={user?.id} className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              {user?.avatar && <AvatarImage src={user.avatar} />}
                              <AvatarFallback className="text-[10px]">
                                {user?.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user?.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">{labels.unassigned}</span>
                    )}
                  </div>
                </div>
              </>
            ))}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{labels.actions}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Edit - requires update permission */}
          {permissions?.update && onEdit && (
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              {labels.edit}
            </Button>
          )}

          {/* Duplicate - requires create permission (assumed from access) */}
          {permissions?.access && onDuplicate && (
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              {labels.duplicate}
            </Button>
          )}

          {/* Share */}
          {onShare && (
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onShare}>
              <Share className="h-4 w-4 mr-2" />
              {labels.share}
            </Button>
          )}

          {/* Delete - requires delete permission */}
          {permissions?.delete && onDelete && (
            <>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {labels.delete}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
