/**
 * CommentPreview component
 * Renders HTML content safely with proper styling
 * Parses Slack-like mentions: <@userId|name> -> @name with styling
 */

import DOMPurify from 'isomorphic-dompurify';
import { useMemo } from 'react';

export interface CommentPreviewProps {
  source: string;
  className?: string;
}

/**
 * Convert Slack-like mentions to display format.
 * Handles both Lexical mentions and plain text mentions.
 */
function processMentions(html: string): string {
  // Convert all &lt;@userId|name&gt; to @name display format
  // This works for both:
  // 1. Inside Lexical spans (content needs to be converted to display format)
  // 2. Plain text mentions (legacy content)
  return html.replace(/&lt;@([^|]+)\|([^&]+)&gt;/g, '@$2');
}

export function CommentPreview({ source, className }: CommentPreviewProps) {
  const sanitizedHtml = useMemo(() => {
    const sanitized = DOMPurify.sanitize(source, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'code',
        'pre',
        'a',
        'img',
        'video',
        'iframe',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'span',
        'div',
      ],
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'width',
        'height',
        'class',
        'style',
        'controls',
        'aria-label',
        'data-lexical-mention',
        'data-mention-name',
        'data-user-id',
        'allow',
        'allowfullscreen',
      ],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });

    // Process mentions after sanitization
    return processMentions(sanitized);
  }, [source]);

  return <div className={`comment-preview ${className || ''}`} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
