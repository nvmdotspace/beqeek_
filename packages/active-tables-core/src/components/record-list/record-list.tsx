/**
 * RecordList Component
 *
 * Main component that routes to appropriate layout based on config
 * Supports: table, card (head-column), and compact layouts
 */

import { useMemo } from 'react';
import type { RecordListProps } from './record-list-props.js';
import { EmptyState, LoadingState, ErrorState } from '../states/index.js';
import { HeadColumnLayout } from './head-column-layout.js';
import { GenericTableLayout } from './generic-table-layout.js';

/**
 * RecordList - Main list component with layout routing
 */
export function RecordList(props: RecordListProps) {
  const {
    table,
    records,
    config,
    loading = false,
    error = null,
    messages,
    onRetry,
    className = '',
  } = props;

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingState
          message={messages?.loading || 'Loading records...'}
          type="skeleton"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <div className={className}>
        <ErrorState
          message={messages?.error || 'Failed to load records'}
          details={errorMessage}
          onRetry={onRetry}
          retryText={messages?.retry || 'Retry'}
        />
      </div>
    );
  }

  // Empty state
  if (!records || records.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          message={messages?.noRecordsFound || 'No records found'}
          description={messages?.noRecordsDescription || 'Try adjusting your filters or create a new record'}
        />
      </div>
    );
  }

  // Determine layout component
  const LayoutComponent = useMemo(() => {
    const layoutType = config.layout.toLowerCase();

    switch (layoutType) {
      case 'head-column':
      case 'card':
        return HeadColumnLayout;

      case 'table':
      case 'generic-table':
        return GenericTableLayout;

      default:
        // Default to table layout
        console.warn(`Unknown layout type: ${config.layout}, falling back to table layout`);
        return GenericTableLayout;
    }
  }, [config.layout]);

  return <LayoutComponent {...props} />;
}
