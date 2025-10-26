import { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryAction?: ReactNode;
}

/**
 * FeaturePlaceholder renders a friendly, on-brand empty state while a feature is under construction.
 */
export const FeaturePlaceholder = ({
  title,
  description,
  icon,
  className,
  primaryActionLabel,
  onPrimaryAction,
  secondaryAction,
}: FeaturePlaceholderProps) => {
  return (
    <div className={cn('min-h-[calc(100vh-4rem)] p-6 lg:p-10 bg-background', className)}>
      <Card className="mx-auto max-w-3xl border-dashed">
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          {icon && <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">{icon}</div>}
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center text-muted-foreground">
          <p>{description}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {primaryActionLabel && onPrimaryAction && (
              <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
            )}
            {secondaryAction}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
