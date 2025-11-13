/**
 * @workspace/comments - Component exports
 */

export { CommentSection } from './CommentSection.js';
export type { CommentSectionProps } from './CommentSection.js';

export { CommentCard } from './CommentCard.js';
export type { CommentCardProps } from './CommentCard.js';

export { CommentPreview } from './CommentPreview.js';
export type { CommentPreviewProps } from './CommentPreview.js';

export { EmojiReactions } from './EmojiReactions.js';
export type { EmojiReactionsProps } from './EmojiReactions.js';

export { CommentEditor } from './editor/CommentEditor.js';
export type { CommentEditorProps } from './editor/CommentEditor.js';

export { CommentToolbar } from './editor/CommentToolbar.js';
export type { CommentToolbarProps } from './editor/CommentToolbar.js';

// Plugins
export { ImagesPlugin } from './editor/plugins/ImagesPlugin.js';
export { MentionsPlugin } from './editor/plugins/MentionsPlugin.js';
export type { MentionsPluginProps, MentionUser } from './editor/plugins/MentionsPlugin.js';

// Nodes
export { ImageNode, $createImageNode, $isImageNode } from './editor/nodes/ImageNode.js';
export { MentionNode, $createMentionNode, $isMentionNode } from './editor/nodes/MentionNode.js';
export { CommentEditorNodes } from './editor/nodes/index.js';
