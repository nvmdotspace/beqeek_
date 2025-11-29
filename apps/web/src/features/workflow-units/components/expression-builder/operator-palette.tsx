/**
 * Operator Palette Component
 *
 * Visual grid of math operators for quick selection.
 */
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { MATH_OPERATORS, type MathOperator } from './math-operators';

interface OperatorPaletteProps {
  /** Callback when operator is selected */
  onSelect: (operator: MathOperator) => void;
  /** Currently selected operator */
  selected?: MathOperator;
  /** Additional CSS classes */
  className?: string;
  /** Show only binary or all operators */
  filter?: 'all' | 'binary' | 'unary';
}

/**
 * Grid of operator buttons for quick selection
 */
export function OperatorPalette({ onSelect, selected, className, filter = 'all' }: OperatorPaletteProps) {
  const operators = MATH_OPERATORS.filter((op) => {
    if (filter === 'all') return true;
    if (filter === 'binary') return op.arity === 'binary';
    if (filter === 'unary') return op.arity === 'unary';
    return true;
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-xs font-medium text-muted-foreground">Math Operators</div>
      <div className="grid grid-cols-4 gap-1.5 p-2 bg-muted/50 rounded-lg">
        {operators.map((op) => (
          <Button
            key={op.name}
            variant={selected === op.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(op.name)}
            className={cn(
              'h-10 flex flex-col items-center justify-center gap-0.5 font-mono',
              selected === op.name && 'ring-2 ring-ring',
            )}
            title={op.label}
          >
            <span className="text-base leading-none">{op.symbol}</span>
            <span className="text-[10px] font-normal opacity-70">{op.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
