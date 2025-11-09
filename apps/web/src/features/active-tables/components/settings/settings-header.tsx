/**
 * Settings Header Component
 *
 * Displays the table name, description, and navigation back button.
 */

import { ArrowLeft, Settings2 } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { ROUTES } from '@/shared/route-paths';

// Type-safe route API
const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_SETTINGS);

export interface SettingsHeaderProps {
  /** Table name */
  tableName: string;

  /** Table description */
  description?: string;

  /** Whether there are unsaved changes */
  isDirty?: boolean;
}

/**
 * Settings Header
 *
 * Shows table name, optional description, back navigation, and unsaved changes indicator.
 */
export function SettingsHeader({ tableName, description, isDirty }: SettingsHeaderProps) {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();

  const handleBack = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
      params: { locale, workspaceId, tableId },
    });
  };

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
            aria-label={m.activeTables_detail_backToList()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="text-3xl font-bold tracking-tight">{m.settings_header_title({ tableName })}</h1>
            {isDirty && (
              <Badge variant="secondary" className="ml-2">
                {m.settings_header_unsaved()}
              </Badge>
            )}
          </div>
        </div>
        {description && <p className="ml-14 text-muted-foreground">{description}</p>}
        {!description && <p className="ml-14 text-muted-foreground">{m.settings_general_description()}</p>}
      </div>
    </div>
  );
}
