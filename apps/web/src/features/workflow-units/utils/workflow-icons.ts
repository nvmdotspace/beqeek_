/**
 * Workflow Node Icons
 *
 * This module provides a curated map of Lucide icons used in workflow nodes.
 * Instead of importing all icons from lucide-react (which prevents tree-shaking),
 * we explicitly import only the icons we need.
 *
 * To add a new icon:
 * 1. Import it from lucide-react
 * 2. Add it to the WORKFLOW_ICONS map
 */

import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  Webhook,
  FileText,
  Table,
  Database,
  MessageSquarePlus,
  MessageSquare,
  Mail,
  Sheet,
  Globe,
  User,
  Timer,
  GitBranch,
  SplitSquareVertical,
  Repeat,
  Calculator,
  Variable,
  Search,
  Bug,
} from 'lucide-react';

/**
 * Map of icon names to Lucide icon components.
 * Only includes icons used in workflow node definitions.
 */
export const WORKFLOW_ICONS: Record<string, LucideIcon> = {
  Clock,
  Webhook,
  FileText,
  Table,
  Database,
  MessageSquarePlus,
  MessageSquare,
  Mail,
  Sheet,
  Globe,
  User,
  Timer,
  GitBranch,
  SplitSquareVertical,
  Repeat,
  Calculator,
  Variable,
  Search,
  Bug,
};

/**
 * Get a workflow icon component by name.
 * Returns undefined if the icon is not in the workflow icons map.
 */
export function getWorkflowIcon(iconName: string): LucideIcon | undefined {
  return WORKFLOW_ICONS[iconName];
}
