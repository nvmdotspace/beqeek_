import type { LucideIcon } from 'lucide-react';

import { Box, Inline } from '@workspace/ui/components/primitives';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Text } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';

interface StatBadgeProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  /**
   * Color variant using design system accent colors
   * @example "accent-blue", "primary", "success", "warning"
   */
  color?: 'accent-blue' | 'primary' | 'success' | 'warning' | 'accent' | 'accent-purple';
  loading?: boolean;
}

export const StatBadge = ({ icon: Icon, value, label, color = 'primary', loading }: StatBadgeProps) => {
  if (loading) {
    return <Skeleton className="h-[60px] w-[140px] rounded-lg" />;
  }

  // Map color variants to design system classes
  const colorClasses = {
    'accent-blue': {
      bg: 'bg-accent-blue-subtle',
      text: 'text-accent-blue',
    },
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
    },
    success: {
      bg: 'bg-success-subtle',
      text: 'text-success',
    },
    warning: {
      bg: 'bg-warning-subtle',
      text: 'text-warning',
    },
    accent: {
      bg: 'bg-accent/10',
      text: 'text-accent',
    },
    'accent-purple': {
      bg: 'bg-accent-purple-subtle',
      text: 'text-accent-purple',
    },
  };

  const colors = colorClasses[color];

  return (
    <Box
      padding="space-200"
      backgroundColor="card"
      borderRadius="lg"
      border="default"
      className="min-w-[140px] transition-shadow hover:shadow-sm"
    >
      <Inline space="space-150" align="center">
        <div className={cn('h-6 w-6 rounded-md flex items-center justify-center shrink-0', colors.bg)}>
          <Icon className={cn('h-4 w-4', colors.text)} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <Text className="text-lg font-semibold leading-none">{value}</Text>
          <Text size="small" color="muted" className="truncate">
            {label}
          </Text>
        </div>
      </Inline>
    </Box>
  );
};
