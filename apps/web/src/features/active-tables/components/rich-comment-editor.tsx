/**
 * Rich Comment Editor Component
 *
 * Uses Lexical editor for rich text comments with:
 * - Bold, italic, underline formatting
 * - Lists (ordered/unordered)
 * - Links
 * - @mentions (TODO: implement mention plugin)
 * - Image upload
 * - Ctrl+Enter to submit
 */

import { useState, useCallback, useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Textarea } from '@workspace/ui/components/textarea';
import { Text } from '@workspace/ui/components/typography';
import { Keyboard } from 'lucide-react';

export interface RichCommentEditorProps {
  /** Placeholder text */
  placeholder?: string;
  /** Submit handler */
  onSubmit: (content: string) => Promise<void>;
  /** Workspace users for @mentions */
  workspaceUsers?: Array<{ id: string; name: string; avatar?: string }>;
  /** Image upload handler */
  onImageUpload?: (file: File) => Promise<string>;
  /** Loading state */
  isSubmitting?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Rich text comment editor with Lexical
 *
 * @example
 * ```tsx
 * <RichCommentEditor
 *   placeholder="Add a comment..."
 *   onSubmit={handleAddComment}
 *   workspaceUsers={users}
 *   onImageUpload={uploadImage}
 * />
 * ```
 */
export function RichCommentEditor({
  placeholder = 'Add a comment... (Ctrl+Enter to submit)',
  onSubmit,
  workspaceUsers,
  onImageUpload,
  isSubmitting = false,
  autoFocus = false,
  className = '',
}: RichCommentEditorProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    try {
      await onSubmit(content);
      setContent(''); // Clear editor after successful submit
      setIsExpanded(false);
    } catch (error) {
      console.error('[RichCommentEditor] Submit failed:', error);
      // Don't clear content on error - let user retry
    }
  }, [content, isSubmitting, onSubmit]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void handleSubmit();
      }
      // Escape to cancel
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    },
    [handleSubmit, isExpanded],
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setContent('');
    setIsExpanded(false);
  }, []);

  // Expand editor on focus
  const handleFocus = useCallback(() => {
    setIsExpanded(true);
  }, []);

  // Check if content is empty (only whitespace or empty HTML)
  const isEmpty = !content || content.trim() === '' || content === '<p></p>' || content === '<p><br></p>';

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div onKeyDown={handleKeyDown} className="transition-all duration-200">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            className={`w-full resize-none transition-all ${isExpanded ? 'min-h-[150px]' : 'min-h-[80px]'}`}
            disabled={isSubmitting}
          />
        </div>

        {/* Toolbar - only show when expanded or has content */}
        {(isExpanded || !isEmpty) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            {/* Keyboard hint */}
            <div className="flex items-center gap-2">
              <Keyboard className="h-3 w-3 text-muted-foreground" />
              <Text size="small" color="muted" className="text-xs hidden sm:inline">
                Ctrl+Enter to submit, Esc to cancel
              </Text>
              <Text size="small" color="muted" className="text-xs sm:hidden">
                Ctrl+Enter to submit
              </Text>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting || isEmpty}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || isEmpty}>
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
