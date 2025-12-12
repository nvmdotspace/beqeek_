/**
 * StartNode Component
 *
 * A special node that displays the workflow trigger type.
 * This node is automatically created when loading an event and cannot be deleted.
 * Design inspired by Dify's trigger node.
 */

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Play, Clock, Webhook, FileText, Table } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Text } from '@workspace/ui/components/typography';
import type { EventSourceType } from '../../../api/types';
import { SourceHandleWithMenu } from './source-handle-with-menu';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export interface StartNodeData {
  name: string;
  triggerType: EventSourceType;
  triggerParams?: Record<string, unknown>;
  _isStartNode: true;
}

const TRIGGER_CONFIG: Record<
  EventSourceType,
  {
    icon: typeof Clock;
    labelKey: () => string;
    getDetails: (params?: Record<string, unknown>) => string;
  }
> = {
  SCHEDULE: {
    icon: Clock,
    labelKey: () => m.workflowTrigger_type_schedule(),
    getDetails: (params) => {
      if (params?.expression) {
        return `Cron: ${params.expression}`;
      }
      return '';
    },
  },
  WEBHOOK: {
    icon: Webhook,
    labelKey: () => m.workflowTrigger_type_webhook(),
    getDetails: (params) => {
      if (params?.webhookId) {
        const id = String(params.webhookId);
        return `ID: ${id.slice(0, 8)}...`;
      }
      return '';
    },
  },
  OPTIN_FORM: {
    icon: FileText,
    labelKey: () => m.workflowTrigger_type_form(),
    getDetails: (params) => {
      if (params?.formId) {
        const id = String(params.formId);
        return `Form: ${id.slice(0, 12)}...`;
      }
      return '';
    },
  },
  ACTIVE_TABLE: {
    icon: Table,
    labelKey: () => m.workflowTrigger_type_table(),
    getDetails: (params) => {
      if (params?.tableId) {
        const id = String(params.tableId);
        return `Table: ${id.slice(0, 12)}...`;
      }
      return '';
    },
  },
};

export const StartNode = memo((props: NodeProps) => {
  const data = props.data as unknown as StartNodeData;
  const { triggerType, triggerParams } = data;
  const selected = props.selected;

  const config = TRIGGER_CONFIG[triggerType];
  const IconComponent = config?.icon || Clock;
  const label = config?.labelKey() || triggerType;
  const details = config?.getDetails(triggerParams) || '';

  return (
    <div className="relative group">
      {/* Main card - Dify-inspired design */}
      <div
        className={cn(
          'min-w-[240px] max-w-[320px] rounded-xl border-2 bg-card transition-all duration-200',
          selected ? 'shadow-lg border-blue-500' : 'shadow-sm hover:shadow-md border-blue-400/50',
        )}
      >
        {/* Header - "START" label */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Play className="size-3.5 text-blue-500" fill="currentColor" />
            <Text size="small" weight="semibold" className="text-muted-foreground uppercase tracking-wide text-xs">
              {m.workflowStart_label ? m.workflowStart_label() : 'Start'}
            </Text>
          </div>
        </div>

        {/* Content - Trigger type display */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon container */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <IconComponent className="size-5 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Trigger info */}
            <div className="flex-1 min-w-0 space-y-1">
              <Text weight="semibold" className="text-sm uppercase tracking-wide">
                {label}
              </Text>
              {details && (
                <div className="bg-muted/50 rounded-md px-2.5 py-1.5">
                  <Text size="small" color="muted" className="font-mono text-xs">
                    {details}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Source handle with menu - click to add node, drag to connect */}
      <SourceHandleWithMenu handleBgClass="!bg-blue-500" />
    </div>
  );
});

StartNode.displayName = 'StartNode';
