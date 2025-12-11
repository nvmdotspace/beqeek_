import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Text } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import { NODE_DEFINITIONS, type NodeDefinition } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';
import { useCandidateNodeState, useWorkflowEditorStore } from '../../stores/workflow-editor-store';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface NodePaletteItemProps {
  definition: NodeDefinition;
  onActivateCandidate: (definition: NodeDefinition) => void;
}

const NodePaletteItem = ({ definition, onActivateCandidate }: NodePaletteItemProps) => {
  const IconComponent = getWorkflowIcon(definition.icon);

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', definition.type);
    event.dataTransfer.effectAllowed = 'move';

    // Create custom drag ghost to avoid the "white corners" visual artifact
    // and make it look like a real node card being dragged
    const node = event.currentTarget as HTMLElement;
    const ghost = node.cloneNode(true) as HTMLElement;

    // Reset list-specific styles and apply card-like styles
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.width = '240px'; // Approximate width of a canvas node
    ghost.style.background = 'hsl(var(--card))';
    ghost.style.border = '1px solid hsl(var(--border))';
    ghost.style.borderRadius = '8px';
    ghost.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.1)';
    ghost.style.opacity = '1';
    ghost.style.padding = '12px';
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.gap = '10px';

    // Adjust internal text styles if needed (optional, clone usually carries them)
    // We want to force the content to look "active" not "muted"
    document.body.appendChild(ghost);

    // Center the drag image under cursor
    event.dataTransfer.setDragImage(ghost, 20, 20);

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const onClick = () => {
    onActivateCandidate(definition);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivateCandidate(definition);
    }
  };

  // Modern Dify-inspired colors
  const categoryStyles = {
    trigger: {
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    action: {
      bg: 'bg-violet-100 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-400',
    },
    logic: {
      bg: 'bg-orange-100 dark:bg-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
    },
  };

  const styles = categoryStyles[definition.category] || categoryStyles.action;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-md border border-transparent',
        'hover:bg-accent hover:border-border/40 cursor-grab active:cursor-grabbing transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      )}
      title={definition.description}
    >
      {/* Icon Container with category color */}
      <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', styles.bg, styles.text)}>
        {IconComponent && <IconComponent className="size-4" aria-hidden="true" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col items-start gap-0">
        <span className="text-[13px] font-medium text-foreground leading-tight">{definition.label}</span>
        <span className="text-[11px] text-muted-foreground/80 line-clamp-1 w-full text-left">
          {definition.description}
        </span>
      </div>

      {/* Hover Action */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
        <Plus className="size-3.5" />
      </div>
    </div>
  );
};

export const NodePalette = () => {
  const { setCandidateNode } = useCandidateNodeState();
  const currentEvent = useWorkflowEditorStore((state) => state.currentEvent);
  const currentEventId = useWorkflowEditorStore((state) => state.currentEventId);
  const isLoading = useWorkflowEditorStore((state) => state.isLoading);
  const [searchQuery, setSearchQuery] = useState('');

  // Hide triggers when:
  // 1. Event is loaded and has trigger type
  // 2. Event is being loaded (currentEventId set but data not yet loaded)
  // This prevents showing triggers during page reload while waiting for API response
  const hasTriggerType =
    !!currentEvent?.eventSourceType || (!!currentEventId && isLoading) || (!!currentEventId && !currentEvent);

  // Filter nodes based on search query
  const filteredNodes = NODE_DEFINITIONS.filter((node) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return node.label.toLowerCase().includes(query) || node.description?.toLowerCase().includes(query);
  });

  // Group nodes - hide triggers if event has trigger type
  const triggers = hasTriggerType ? [] : filteredNodes.filter((d) => d.category === 'trigger');
  const actions = filteredNodes.filter((d) => d.category === 'action');
  const logic = filteredNodes.filter(
    (d) => d.category === 'logic' && !d.type.startsWith('compound_') && d.type !== 'merge',
  );

  const handleActivateCandidate = (definition: NodeDefinition) => {
    const timestamp = Date.now();
    const candidateNode = {
      id: `${definition.type}-${timestamp}`,
      type: definition.type,
      position: { x: 0, y: 0 },
      data: {
        name: `${definition.type}_${timestamp}`,
        _isCandidate: true,
        ...definition.defaultData,
      },
    };
    setCandidateNode(candidateNode);
  };

  const hasResults = triggers.length > 0 || actions.length > 0 || logic.length > 0;

  return (
    <div className="flex flex-col h-full bg-background border-r w-full">
      {/* Header & Search */}
      <div className="p-4 pb-2 space-y-3">
        {/* Simple Title instead of Heavy Tabs */}
        <div className="flex items-center justify-between px-1">
          <Text weight="semibold" className="text-sm">
            {m.workflowCanvas_nodePalette() || 'Nodes'}
          </Text>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={m.common_search ? m.common_search() : 'Search nodes...'}
            className="pl-9 h-9 bg-muted/40 text-sm border-transparent focus:bg-background transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Nodes List */}
      <ScrollArea className="flex-1 px-3 pb-4">
        <div className="space-y-6 pt-2">
          {triggers.length > 0 && (
            <div className="space-y-1">
              <Text className="text-xs font-medium text-muted-foreground px-2 pb-1">{m.workflowCanvas_triggers()}</Text>
              <div className="space-y-0.5">
                {triggers.map((def) => (
                  <NodePaletteItem key={def.type} definition={def} onActivateCandidate={handleActivateCandidate} />
                ))}
              </div>
            </div>
          )}

          {logic.length > 0 && (
            <div className="space-y-1">
              <Text className="text-xs font-medium text-muted-foreground px-2 pb-1">{m.workflowCanvas_logic()}</Text>
              <div className="space-y-0.5">
                {logic.map((def) => (
                  <NodePaletteItem key={def.type} definition={def} onActivateCandidate={handleActivateCandidate} />
                ))}
              </div>
            </div>
          )}

          {actions.length > 0 && (
            <div className="space-y-1">
              <Text className="text-xs font-medium text-muted-foreground px-2 pb-1">{m.workflowCanvas_actions()}</Text>
              <div className="space-y-0.5">
                {actions.map((def) => (
                  <NodePaletteItem key={def.type} definition={def} onActivateCandidate={handleActivateCandidate} />
                ))}
              </div>
            </div>
          )}

          {!hasResults && (
            <div className="text-center py-8 text-muted-foreground text-sm">No nodes found matching your search.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
