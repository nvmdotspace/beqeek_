/**
 * Form Template Card Component - Compact Horizontal Layout
 *
 * Redesigned card for form template selection with 45% height reduction
 * while maintaining full business functionality and accessibility.
 *
 * Design improvements:
 * - Horizontal left-aligned layout (vs centered vertical)
 * - 88px height (vs 160px original)
 * - Icon-prominent design with 40×40px icon
 * - 2-line description with proper Vietnamese typography
 * - WCAG 2.1 AA compliant
 * - Full keyboard navigation and screen reader support
 */

import { Card, CardContent } from '@workspace/ui/components/card';
import { Text } from '@workspace/ui/components/typography';

import type { FormTypeDefinition } from '../types';

interface FormTemplateCardProps {
  template: FormTypeDefinition;
  onSelect: () => void;
}

export function FormTemplateCard({ template, onSelect }: FormTemplateCardProps) {
  // Template icons using SVG (40×40px for compact layout)
  const getIcon = () => {
    const iconClasses = 'text-foreground/80';
    const size = 40;

    switch (template.type) {
      case 'BASIC':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClasses}
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'SUBSCRIPTION':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClasses}
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case 'SURVEY':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClasses}
          >
            <path d="M9 11H3v2h6v-2zm0-5H3v2h6V6zm0 10H3v2h6v-2zm5 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 3h14v-2h-14v2zm0-5h14v-2h-14v2z" />
            <circle cx="14" cy="14" r="3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className="hover:shadow-md hover:scale-[1.01] hover:border-primary/40 transition-all cursor-pointer border-border/60"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Tạo form ${template.name}`}
    >
      <CardContent className="px-4 py-3">
        {/* Horizontal layout: Icon + Content */}
        <div className="flex items-start gap-3">
          {/* Icon - Icon-prominent 40×40px */}
          <div className="flex-shrink-0">{getIcon()}</div>

          {/* Content - Left-aligned, stacked */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Name - 16px semibold, 1 line max */}
            <div className="text-base font-semibold text-foreground leading-tight truncate">{template.name}</div>

            {/* Description - 14px normal, 2 lines max, optimized for Vietnamese */}
            <Text size="small" color="muted" className="line-clamp-2 leading-relaxed">
              {template.description}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
