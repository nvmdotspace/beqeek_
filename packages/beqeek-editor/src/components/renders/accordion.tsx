import { cn } from '@workspace/ui/lib/utils';
import type { PluginElementRenderProps } from '@yoopta/editor';
import { useState } from 'react';

/**
 * Accordion render components for Yoopta Accordion plugin
 * Minimal implementation following shadcn/ui patterns
 */

export function AccordionList({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <div {...attributes} {...HTMLAttributes} className={cn('w-full border-b', HTMLAttributes.className)}>
      {children}
    </div>
  );
}

export function AccordionListItem({ attributes, children, element, HTMLAttributes = {} }: PluginElementRenderProps) {
  const itemProps = element?.props as { isExpanded?: boolean } | undefined;
  const [isOpen] = useState(itemProps?.isExpanded ?? true);

  return (
    <div
      {...attributes}
      {...HTMLAttributes}
      data-state={isOpen ? 'open' : 'closed'}
      className={cn('border-b', HTMLAttributes.className)}
    >
      {children}
    </div>
  );
}

export function AccordionListItemHeading({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <div
      {...attributes}
      {...HTMLAttributes}
      className={cn(
        'flex cursor-pointer items-center justify-between py-4 font-medium transition-all hover:underline',
        HTMLAttributes.className,
      )}
    >
      {children}
    </div>
  );
}

export function AccordionListItemContent({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <div {...attributes} {...HTMLAttributes} className={cn('pb-4 pt-0', HTMLAttributes.className)}>
      {children}
    </div>
  );
}
