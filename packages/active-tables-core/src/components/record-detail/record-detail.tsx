/**
 * RecordDetail Component
 *
 * Main component that routes to appropriate detail layout based on config
 * Supports: head-detail (single column) and two-column layouts
 */

import { useMemo } from 'react';
import type { RecordDetailProps } from './record-detail-props.js';
import { LoadingState, ErrorState } from '../states/index.js';
import { HeadDetailLayout } from './head-detail-layout.js';
import { TwoColumnDetailLayout } from './two-column-detail-layout.js';
import { CommentsPanel } from './comments-panel.js';

/**
 * RecordDetail - Main detail component with layout routing
 */
export function RecordDetail(props: RecordDetailProps) {
  const {
    record,
    config,
    loading = false,
    error = null,
    comments = [],
    commentsLoading = false,
    onCommentAdd,
    onCommentUpdate,
    onCommentDelete,
    currentUser,
    workspaceUsers,
    messages,
    onRetry,
    className = '',
  } = props;

  // Prepare comments panel (if configured)
  const commentsPanel = useMemo(() => {
    if (config.commentsPosition === 'none' || !config.commentsPosition) {
      return null;
    }

    return (
      <CommentsPanel
        comments={comments}
        currentUser={currentUser}
        workspaceUsers={workspaceUsers}
        loading={commentsLoading}
        onCommentAdd={onCommentAdd}
        onCommentUpdate={onCommentUpdate}
        onCommentDelete={onCommentDelete}
        messages={messages}
      />
    );
  }, [
    config.commentsPosition,
    comments,
    currentUser,
    workspaceUsers,
    commentsLoading,
    onCommentAdd,
    onCommentUpdate,
    onCommentDelete,
    messages,
  ]);

  // Determine layout component
  const LayoutComponent = useMemo(() => {
    const layoutType = config.layout.toLowerCase();

    switch (layoutType) {
      case 'head-detail':
      case 'single-column':
        return HeadDetailLayout;

      case 'two-column':
      case 'two-columns':
        return TwoColumnDetailLayout;

      default:
        console.warn(`Unknown layout type: ${config.layout}, falling back to head-detail layout`);
        return HeadDetailLayout;
    }
  }, [config.layout]);

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingState message={messages?.loading || 'Loading record...'} type="skeleton" />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <div className={className}>
        <ErrorState
          message={messages?.error || 'Failed to load record'}
          details={errorMessage}
          onRetry={onRetry}
          retryText={messages?.retry || 'Retry'}
        />
      </div>
    );
  }

  // No record
  if (!record) {
    return (
      <div className={className}>
        <ErrorState
          message={messages?.recordNotFound || 'Record not found'}
          details={messages?.recordNotFoundDescription || 'This record may have been deleted'}
        />
      </div>
    );
  }

  // Render layout with comments panel
  const detailContent = <LayoutComponent {...props} commentsPanel={commentsPanel} />;

  // Wrap with comments panel if positioned right
  if (config.commentsPosition === 'right-panel' || config.commentsPosition === 'right') {
    return (
      <div className={`flex gap-6 ${className}`}>
        <div className="flex-1">{detailContent}</div>
        <div className="w-96 flex-shrink-0">{commentsPanel}</div>
      </div>
    );
  }

  // Bottom comments or no comments
  return (
    <div className={className}>
      {detailContent}
      {config.commentsPosition === 'bottom' && commentsPanel && <div className="mt-6">{commentsPanel}</div>}
    </div>
  );
}
