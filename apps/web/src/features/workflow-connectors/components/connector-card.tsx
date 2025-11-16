/**
 * Connector Card Component
 *
 * Grid card for connector type selection in select view
 */

import { Card, CardContent } from '@workspace/ui/components/card';
import { Text, Heading } from '@workspace/ui/components/typography';
import type { ConnectorTypeDefinition } from '@workspace/beqeek-shared/workflow-connectors';

interface ConnectorCardProps {
  /** Connector type definition */
  connectorType: ConnectorTypeDefinition;
  /** Click handler */
  onClick: () => void;
}

export function ConnectorCard({ connectorType, onClick }: ConnectorCardProps) {
  return (
    <Card
      className="hover:shadow-md hover:scale-[1.01] hover:border-primary/40 transition-all cursor-pointer border-border/60"
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
      <CardContent className="p-4 space-y-3 text-center">
        {/* Logo - Compact */}
        <div className="flex justify-center">
          {connectorType.logo ? (
            <img src={connectorType.logo} alt={connectorType.name} className="size-12 object-contain rounded-lg" />
          ) : (
            <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="size-6 bg-primary/40 rounded" />
            </div>
          )}
        </div>

        {/* Name - Smaller heading */}
        <Heading level={4} className="text-center">
          {connectorType.name}
        </Heading>

        {/* Description - Compact, 2 lines max */}
        <Text size="small" color="muted" className="line-clamp-2">
          {connectorType.description}
        </Text>
      </CardContent>
    </Card>
  );
}
