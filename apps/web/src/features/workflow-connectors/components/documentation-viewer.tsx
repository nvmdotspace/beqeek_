/**
 * Documentation Viewer Component
 *
 * Renders markdown documentation for connectors
 */

import { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { FileText } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface DocumentationViewerProps {
  /** Markdown content */
  documentation?: string;
  /** Additional className */
  className?: string;
}

export const DocumentationViewer = memo(({ documentation, className }: DocumentationViewerProps) => {
  if (!documentation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {m.connectors_docs_title()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{m.connectors_docs_empty()}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {m.connectors_docs_title()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'prose prose-sm max-w-none dark:prose-invert',
            // Headings
            'prose-headings:text-foreground prose-headings:font-semibold',
            'prose-h1:text-xl prose-h1:border-b prose-h1:pb-2 prose-h1:mb-4',
            'prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3',
            'prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2',
            // Paragraphs
            'prose-p:text-foreground prose-p:leading-relaxed',
            // Links
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            // Lists
            'prose-ul:my-2 prose-ol:my-2',
            'prose-li:text-foreground prose-li:my-1',
            // Code
            'prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono',
            'prose-code:before:content-none prose-code:after:content-none',
            'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
            // Tables (GFM)
            'prose-table:text-sm',
            'prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium',
            'prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border',
            // Blockquotes
            'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic',
            // Strong/Bold
            'prose-strong:text-foreground prose-strong:font-semibold',
            // HR
            'prose-hr:border-border prose-hr:my-6',
          )}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{documentation}</Markdown>
        </div>
      </CardContent>
    </Card>
  );
});

DocumentationViewer.displayName = 'DocumentationViewer';
