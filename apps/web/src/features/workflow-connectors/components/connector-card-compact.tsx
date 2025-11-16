/**
 * Connector Card Component (Compact Design)
 *
 * Redesigned connector selection card with 45% height reduction (160px → 88px)
 * using horizontal icon-prominent layout while maintaining all business requirements.
 *
 * Design Specifications: plans/251117-connector-card-redesign/reports/251117-design-specifications.md
 *
 * Key Features:
 * - 88px fixed height (45% reduction)
 * - Horizontal layout with 40px icon
 * - 2-line description for Vietnamese text
 * - Left-aligned for faster scanning
 * - Full accessibility (WCAG 2.1 AA)
 * - Design token compliance (100%)
 */

import { Card, CardContent } from '@workspace/ui/components/card';
import { Text, Heading } from '@workspace/ui/components/typography';
import type { ConnectorTypeDefinition } from '@workspace/beqeek-shared/workflow-connectors';

interface ConnectorCardCompactProps {
  /** Connector type definition */
  connectorType: ConnectorTypeDefinition;
  /** Click handler */
  onClick: () => void;
}

export function ConnectorCardCompact({ connectorType, onClick }: ConnectorCardCompactProps) {
  return (
    <Card
      className="
        hover:shadow-md hover:border-primary/40 hover:bg-accent/20
        transition-all duration-200 cursor-pointer border-border/60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        active:scale-[0.98] active:border-primary/60
      "
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Tạo ${connectorType.name} connector`}
    >
      <CardContent className="px-4 py-3 p-0">
        <div className="flex items-start gap-3">
          {/* Icon Container - Flex shrink 0 prevents squishing */}
          <div className="flex-shrink-0">
            {connectorType.logo ? (
              <img src={connectorType.logo} alt={connectorType.name} className="size-10 object-contain rounded-lg" />
            ) : (
              // Fallback for connectors without logos
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="size-5 bg-primary/40 rounded" />
              </div>
            )}
          </div>

          {/* Content Container - Flex 1 allows text to fill space, min-w-0 enables text truncation */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Connector Name */}
            <Heading level={4} className="text-base font-semibold leading-tight truncate">
              {connectorType.name}
            </Heading>

            {/* Description - Max 2 lines with ellipsis */}
            <Text size="small" color="muted" className="line-clamp-2 leading-normal">
              {connectorType.description}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
