import { useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';

/**
 * CommentEditor - Rich text editor for creating/editing comments
 *
 * Features:
 * - Textarea with auto-resize
 * - Submit and cancel actions
 * - Placeholder text
 * - Keyboard shortcuts (Ctrl+Enter to submit)
 */

export interface CommentEditorProps {
  /**
   * Current value of the editor
   */
  value: string;

  /**
   * Callback when value changes
   */
  onChange: (value: string) => void;

  /**
   * Callback when submit is clicked or Ctrl+Enter pressed
   */
  onSubmit: () => void;

  /**
   * Optional callback when cancel is clicked
   */
  onCancel?: () => void;

  /**
   * Placeholder text
   * @default "Write a comment..."
   */
  placeholder?: string;

  /**
   * Whether the editor is in edit mode
   * @default false
   */
  isEditing?: boolean;

  /**
   * Whether submit is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Submit button text
   * @default "Post"
   */
  submitText?: string;

  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;
}

export function CommentEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  isEditing = false,
  disabled = false,
  autoFocus = false,
  submitText = 'Post',
  cancelText = 'Cancel',
}: CommentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }

    // Escape to cancel (only in edit mode)
    if (event.key === 'Escape' && isEditing && onCancel) {
      event.preventDefault();
      onCancel();
    }
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[100px] resize-none pr-12"
          aria-label={isEditing ? 'Edit comment' : 'New comment'}
        />
        {value.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {value.length} chars
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">Ctrl</span>+<span className="text-xs">Enter</span>
          </kbd>
          <span className="ml-1">to submit</span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={disabled}
            >
              <X className="mr-1.5 h-4 w-4" />
              {cancelText}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            <Send className="mr-1.5 h-4 w-4" />
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}
