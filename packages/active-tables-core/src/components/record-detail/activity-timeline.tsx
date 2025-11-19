/**
 * ActivityTimeline - Display record history and field changes
 * @module active-tables-core/components/record-detail
 */

import React from 'react';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Box } from '@workspace/ui/components/primitives/box';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Avatar } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import type { ActivityTimelineProps, TimelineEvent } from '../../types/record-detail.js';

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string, locale: string = 'vi'): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return locale === 'vi' ? 'Vừa xong' : 'Just now';
  if (diffMins < 60) return locale === 'vi' ? `${diffMins} phút trước` : `${diffMins} min ago`;
  if (diffHours < 24) return locale === 'vi' ? `${diffHours} giờ trước` : `${diffHours} hr ago`;
  if (diffDays < 7) return locale === 'vi' ? `${diffDays} ngày trước` : `${diffDays} days ago`;

  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get event type badge
 */
function EventTypeBadge({ type }: { type: string }) {
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    created: { label: 'Created', variant: 'default' },
    updated: { label: 'Updated', variant: 'secondary' },
    commented: { label: 'Commented', variant: 'outline' },
    custom: { label: 'Action', variant: 'secondary' },
  };

  const config = variants[type] || variants.custom;
  if (!config) {
    return (
      <Badge variant="secondary" className="text-xs">
        Action
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}

/**
 * Render field change diff
 */
function FieldChangeDiff({
  fieldLabel,
  oldValue,
  newValue,
}: {
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
}) {
  const formatValue = (val: unknown): string => {
    if (val == null || val === '') return '-';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="text-sm pl-6">
      <Text size="small" className="text-muted-foreground">
        {fieldLabel}:
      </Text>
      <Inline space="space-100" className="items-center">
        <Text size="small" className="line-through text-muted-foreground">
          {formatValue(oldValue)}
        </Text>
        <Text size="small" className="text-muted-foreground">
          →
        </Text>
        <Text size="small" weight="medium">
          {formatValue(newValue)}
        </Text>
      </Inline>
    </div>
  );
}

/**
 * Timeline item component
 */
function TimelineItem({ event, locale }: { event: TimelineEvent; locale: string }) {
  return (
    <div className="relative pb-6 last:pb-0">
      {/* Timeline connector line */}
      <div className="absolute left-4 top-10 bottom-0 w-px bg-border" aria-hidden="true" />

      {/* Event content */}
      <Inline space="space-200" className="relative">
        {/* User avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          {event.user.avatar ? (
            <img src={event.user.avatar} alt={event.user.name} />
          ) : (
            <span className="text-xs">
              {event.user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </Avatar>

        {/* Event details */}
        <Stack space="space-100" className="flex-1 min-w-0">
          {/* Header: User name + action + timestamp */}
          <Inline space="space-100" className="items-center flex-wrap">
            <Text size="small" weight="medium" className="truncate">
              {event.user.name}
            </Text>
            <EventTypeBadge type={event.type} />
            <Text size="small" className="text-muted-foreground">
              {formatTimestamp(event.timestamp, locale)}
            </Text>
          </Inline>

          {/* Field changes */}
          {event.changes && event.changes.length > 0 && (
            <Stack space="space-050">
              {event.changes.map((change, idx) => (
                <FieldChangeDiff
                  key={idx}
                  fieldLabel={change.fieldLabel}
                  oldValue={change.oldValue}
                  newValue={change.newValue}
                />
              ))}
            </Stack>
          )}

          {/* Comment content */}
          {event.comment && (
            <Box className="bg-muted rounded-md p-3 text-sm">
              <Text size="small">{event.comment}</Text>
            </Box>
          )}

          {/* Custom message */}
          {event.customMessage && (
            <Text size="small" className="text-muted-foreground italic">
              {event.customMessage}
            </Text>
          )}
        </Stack>
      </Inline>
    </div>
  );
}

/**
 * Activity timeline component
 * Displays record history with field changes and comments
 */
export function ActivityTimeline({ recordId, events, loading = false, className }: ActivityTimelineProps) {
  const locale = typeof document !== 'undefined' ? document.documentElement.lang || 'vi' : 'vi';

  if (loading) {
    return (
      <Stack space="space-200" className={className}>
        <Heading level={3}>{locale === 'vi' ? 'Lịch sử hoạt động' : 'Activity Timeline'}</Heading>
        <Stack space="space-300">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <Stack space="space-100" className="flex-1">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </Stack>
            </div>
          ))}
        </Stack>
      </Stack>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Stack space="space-200" className={className}>
        <Heading level={3}>{locale === 'vi' ? 'Lịch sử hoạt động' : 'Activity Timeline'}</Heading>
        <Text className="text-muted-foreground">{locale === 'vi' ? 'Chưa có hoạt động nào' : 'No activity yet'}</Text>
      </Stack>
    );
  }

  return (
    <Stack space="space-300" className={className}>
      <Heading level={3}>{locale === 'vi' ? 'Lịch sử hoạt động' : 'Activity Timeline'}</Heading>

      <div role="list" aria-label="Activity timeline">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} locale={locale} />
        ))}
      </div>
    </Stack>
  );
}
