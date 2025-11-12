/**
 * CommentPreview component
 * Renders HTML content safely with proper styling
 */

import DOMPurify from 'isomorphic-dompurify';
import { useMemo } from 'react';

export interface CommentPreviewProps {
  source: string;
  className?: string;
}

export function CommentPreview({ source, className }: CommentPreviewProps) {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(source, {
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
  }, [source]);

  return <div className={`comment-preview ${className || ''}`} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
