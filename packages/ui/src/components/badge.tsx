import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-secondary px-2 py-0.5 text-xs font-normal text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-secondary/20',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-border bg-background text-foreground',
        success: 'bg-success-subtle text-success border-success/20',
        warning: 'bg-warning-subtle text-warning border-warning/20',
        info: 'bg-info-subtle text-info border-info/20',
      },
      size: {
        base: '',
        compact: 'text-[11px] leading-[16px] tracking-tight',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  },
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
