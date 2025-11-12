import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Metric size variants
 */
type MetricSize = 'large' | 'medium' | 'small';

/**
 * HTML elements that can render metrics
 */
type MetricElement = 'div' | 'span' | 'p';

export interface MetricProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Metric size determines visual prominence.
   * Maps to typography design tokens (--font-metric-*-size, --font-metric-*-line-height)
   *
   * - `large`: 32px - Dashboard KPIs, hero metrics
   * - `medium`: 24px - Card statistics, section metrics
   * - `small`: 20px - Inline metrics, table cells
   *
   * @default 'medium'
   *
   * @example
   * <Metric size="large" value={1234} label="Total Users" />
   * <Metric size="medium" value="99.9%" label="Uptime" />
   * <Metric size="small" value={42} />
   */
  size?: MetricSize;

  /**
   * Numeric or string value to display prominently.
   * Can be number, string, or React node for custom formatting.
   *
   * @example
   * <Metric value={1234} /> // Number
   * <Metric value="99.9%" /> // String with units
   * <Metric value={<>$1,234<sup>*</sup></>} /> // Custom formatting
   */
  value: React.ReactNode;

  /**
   * Optional descriptive label displayed below the value.
   * Typically explains what the metric represents.
   *
   * @example
   * <Metric value={1234} label="Total Users" />
   * <Metric value="24h" label="Avg Response Time" />
   */
  label?: React.ReactNode;

  /**
   * HTML element to render
   *
   * @default 'div'
   */
  as?: MetricElement;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional CSS classes for the value element
   */
  valueClassName?: string;

  /**
   * Additional CSS classes for the label element
   */
  labelClassName?: string;
}

/**
 * Metric component for displaying numeric data prominently.
 *
 * Automatically applies typography design tokens based on size:
 * - Large font sizes with tight line heights
 * - Semibold weight (600) for emphasis
 * - Negative letter spacing for better visual balance
 * - Vietnamese optimization when document.documentElement.lang === 'vi'
 *
 * @example
 * // Dashboard KPI
 * <Metric size="large" value={1234} label="Total Users" />
 *
 * @example
 * // Card statistic
 * <Metric size="medium" value="99.9%" label="Uptime" />
 *
 * @example
 * // Inline metric
 * <Metric size="small" value={42} label="Active" />
 *
 * @example
 * // Custom formatting with units
 * <Metric
 *   value={
 *     <>
 *       $1,234<sup className="text-sm">.99</sup>
 *     </>
 *   }
 *   label="Revenue"
 * />
 *
 * @example
 * // Without label
 * <Metric value={1000} />
 *
 * @example
 * // With custom styling
 * <Metric
 *   value={95}
 *   label="Score"
 *   valueClassName="text-primary"
 *   labelClassName="text-muted-foreground"
 * />
 *
 * @example
 * // Vietnamese content (auto-optimized when lang="vi")
 * <Metric value={1234} label="Tổng người dùng" />
 */
export const Metric = React.forwardRef<HTMLElement, MetricProps>(
  ({ size = 'medium', value, label, as = 'div', className, valueClassName, labelClassName, ...props }, ref) => {
    const Component = as;

    // Map size to CSS custom properties for the value
    const metricStyles = {
      fontSize: `var(--font-metric-${size}-size)`,
      lineHeight: `var(--font-metric-${size}-line-height)`,
      fontWeight: `var(--font-metric-${size}-weight)`,
      letterSpacing: `var(--font-metric-${size}-letter-spacing)`,
      fontFamily: `var(--font-metric-${size}-family)`,
    };

    return (
      <Component ref={ref as any} className={cn('flex flex-col gap-1', className)} {...props}>
        {/* Metric Value */}
        <div style={metricStyles} className={cn('font-semibold tabular-nums text-foreground', valueClassName)}>
          {value}
        </div>

        {/* Optional Label */}
        {label && <div className={cn('text-sm font-medium text-muted-foreground', labelClassName)}>{label}</div>}
      </Component>
    );
  },
);

Metric.displayName = 'Metric';
