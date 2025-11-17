/**
 * Settings Layout Component
 *
 * Provides the main layout structure for the settings screen with header, tabs, and footer.
 */

import { type ReactNode } from 'react';
import { Card } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Stack, Inline } from '@workspace/ui/components/primitives';

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
          <Stack space="space-300">{children}</Stack>
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
        <Inline align="start" justify="between" className="mb-4">
          <Stack className="gap-0.5">
            <Heading level={3}>{title}</Heading>
            {description && (
              <Text size="small" color="muted">
                {description}
              </Text>
            )}
          </Stack>
          {actions && <Inline space="space-050">{actions}</Inline>}
        </Inline>
        {children}
      </div>
    </Card>
  );
}
