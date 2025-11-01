import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-secondary/20',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-border bg-background text-foreground',
        success:
          'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30',
        warning:
          'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30',
        info: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
