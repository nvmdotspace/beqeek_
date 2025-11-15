import { cn } from '@workspace/ui/lib/utils';
import type { PluginElementRenderProps } from '@yoopta/editor';

/**
 * Typography render components for Yoopta Editor plugins
 * Following shadcn/ui design patterns and TailwindCSS v4 design tokens
 */

export function TypographyH1({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <h1
      {...attributes}
      {...HTMLAttributes}
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', HTMLAttributes.className)}
    >
      {children}
    </h1>
  );
}

export function TypographyH2({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <h2
      {...attributes}
      {...HTMLAttributes}
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        HTMLAttributes.className,
      )}
    >
      {children}
    </h2>
  );
}

export function TypographyH3({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <h3
      {...attributes}
      {...HTMLAttributes}
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', HTMLAttributes.className)}
    >
      {children}
    </h3>
  );
}

export function TypographyP({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <p
      {...attributes}
      {...HTMLAttributes}
      className={cn('leading-7 [&:not(:first-child)]:mt-6', HTMLAttributes.className)}
    >
      {children}
    </p>
  );
}

export function TypographyBlockquote({ attributes, children, HTMLAttributes = {} }: PluginElementRenderProps) {
  return (
    <blockquote
      {...attributes}
      {...HTMLAttributes}
      className={cn('mt-6 border-l-2 pl-6 italic', HTMLAttributes.className)}
    >
      {children}
    </blockquote>
  );
}

export function TypographyLink({ attributes, children, element, HTMLAttributes = {} }: PluginElementRenderProps) {
  const props = element?.props as { url?: string; target?: string; rel?: string } | undefined;

  return (
    <a
      {...attributes}
      {...HTMLAttributes}
      href={props?.url}
      target={props?.target}
      rel={props?.rel}
      className={cn('font-medium text-primary underline underline-offset-4', HTMLAttributes.className)}
    >
      {children}
    </a>
  );
}
