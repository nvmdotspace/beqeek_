/**
 * EmojiReactions - Emoji reaction selector for comments
 * Allows users to react to comments with emoji
 */

import { ACTIONS, type ACTIONS_TYPE } from '../types/comment.js';
import { cn } from '@workspace/ui/lib/utils';

export interface EmojiReactionsProps {
  /** Currently selected reaction types */
  value?: ACTIONS_TYPE[];
  /** Callback when emoji is selected */
  onSelect: (selectedReactions: ACTIONS_TYPE[], changedReaction: ACTIONS_TYPE) => void;
  /** Callback when emoji is unselected */
  onUnSelect: (selectedReactions: ACTIONS_TYPE[], changedReaction: ACTIONS_TYPE) => void;
  /** Additional className */
  className?: string;
}

/**
 * EmojiReactions component
 * Displays emoji reaction buttons with active state
 */
export function EmojiReactions({ value = [], onSelect, onUnSelect, className }: EmojiReactionsProps) {
  const handleEmojiClick = (reactionId: ACTIONS_TYPE) => {
    if (value.includes(reactionId)) {
      // Unselect
      const newValue = value.filter((id) => id !== reactionId);
      onUnSelect(newValue, reactionId);
    } else {
      // Select
      const newValue = [...value, reactionId];
      onSelect(newValue, reactionId);
    }
  };

  return (
    <div className={cn('inline-flex gap-1', className)}>
      {ACTIONS.map((action) => {
        const isSelected = value.includes(action.id);
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleEmojiClick(action.id)}
            className={cn(
              'p-1 h-7 w-7 flex justify-center items-center rounded-lg cursor-pointer transition-colors',
              isSelected ? 'bg-primary/20 hover:bg-primary/30' : 'hover:bg-accent',
            )}
            title={action.id}
          >
            {action.emoji}
          </button>
        );
      })}
    </div>
  );
}
