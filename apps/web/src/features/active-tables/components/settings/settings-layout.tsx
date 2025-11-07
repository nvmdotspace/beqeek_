/**
 * Settings Layout Component
 *
 * Provides the main layout structure for the settings screen with header, tabs, and footer.
 */

import { type ReactNode } from 'react';
import { Card } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';

export interface SettingsLayoutProps {
  /** Header component */
  header: ReactNode;

  /** Tab navigation component (includes tab content if using SettingsTabs) */
  tabs: ReactNode;

  /** Main content area (optional if tabs already include content) */
  children?: ReactNode;

  /** Footer with action buttons */
  footer?: ReactNode;
}

/**
 * Settings Layout
 *
 * Provides a consistent layout for all settings sections with:
 * - Fixed header with breadcrumbs and actions
 * - Tab navigation
 * - Scrollable content area
 * - Sticky footer with save/cancel buttons
 */
export function SettingsLayout({ header, tabs, children, footer }: SettingsLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0">
        {header}
        <Separator className="mt-4" />
      </div>

      {/* Tab Navigation and Content - Scrollable */}
      <div className="flex min-h-0 flex-1 flex-col pt-6">{tabs}</div>

      {/* Additional Content Area (if needed) */}
      {children && (
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-6">{children}</div>
        </div>
      )}

      {/* Footer */}
      {footer && <div className="shrink-0 border-t bg-background pt-4">{footer}</div>}
    </div>
  );
}

/**
 * Settings Section
 *
 * Wrapper for individual settings sections with consistent spacing and styling.
 */
export interface SettingsSectionProps {
  /** Section title */
  title: string;

  /** Section description */
  description?: string;

  /** Section content */
  children: ReactNode;

  /** Additional actions for the section */
  actions?: ReactNode;

  /** Additional CSS classes for the card */
  className?: string;
}

export function SettingsSection({ title, description, children, actions, className }: SettingsSectionProps) {
  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </Card>
  );
}
