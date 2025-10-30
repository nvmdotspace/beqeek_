/**
 * useActiveTable Context Hook
 *
 * Provides table configuration context to child components
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { TableConfig } from '../types/config.js';
import type { ActiveTablesMessages } from '../types/messages.js';

// ============================================
// Context
// ============================================

export interface ActiveTableContextValue {
  /** Table configuration */
  config: TableConfig;

  /** Table ID */
  tableId: string;

  /** Workspace ID */
  workspaceId: string;

  /** i18n messages */
  messages?: Partial<ActiveTablesMessages>;
}

const ActiveTableContext = createContext<ActiveTableContextValue | null>(null);

// ============================================
// Provider
// ============================================

export interface ActiveTableProviderProps {
  config: TableConfig;
  tableId: string;
  workspaceId: string;
  messages?: Partial<ActiveTablesMessages>;
  children: ReactNode;
}

export function ActiveTableProvider({
  config,
  tableId,
  workspaceId,
  messages,
  children,
}: ActiveTableProviderProps) {
  return (
    <ActiveTableContext.Provider value={{ config, tableId, workspaceId, messages }}>
      {children}
    </ActiveTableContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access Active Table context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { config, tableId } = useActiveTable();
 *   return <div>{config.title}</div>;
 * }
 * ```
 */
export function useActiveTable() {
  const context = useContext(ActiveTableContext);
  if (!context) {
    throw new Error('useActiveTable must be used within ActiveTableProvider');
  }
  return context;
}
