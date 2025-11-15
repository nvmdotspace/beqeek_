import { cn } from '@workspace/ui/lib/utils';
import type { PluginElementRenderProps } from '@yoopta/editor';

/**
 * Table render components for Yoopta Table plugin
 * Custom implementation matching shadcn/ui table styles
 */

export function TableShadcn({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table
        {...attributes}
        {...HTMLAttributes}
        className={cn('w-full caption-bottom text-sm', HTMLAttributes.className)}
      >
        <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <tr
      {...attributes}
      {...HTMLAttributes}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        HTMLAttributes.className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableDataCell({ attributes, children, element, HTMLAttributes = {} }: PluginElementRenderProps) {
  const props = element?.props as { asHeader?: boolean } | undefined;
  const isHeader = props?.asHeader;

  if (isHeader) {
    return (
      <th
        {...attributes}
        {...HTMLAttributes}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
          HTMLAttributes.className,
        )}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      {...attributes}
      {...HTMLAttributes}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', HTMLAttributes.className)}
    >
      {children}
    </td>
  );
}
