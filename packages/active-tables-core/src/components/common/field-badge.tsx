/**
 * FieldBadge Component
 *
 * Simplified Badge component with consistent styling
 * Copy of styling from @workspace/ui Badge to avoid circular dependency
 */

interface FieldBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: React.CSSProperties;
}

export function FieldBadge({ children, className = '', variant = 'default', style }: FieldBadgeProps) {
  const baseClasses =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-sm font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantClasses = {
    default: 'border-transparent bg-secondary text-secondary-foreground',
    secondary: 'bg-muted text-muted-foreground',
    destructive: 'bg-destructive/15 text-destructive',
    outline: 'border-border bg-background text-foreground',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style}>
      {children}
    </span>
  );
}
