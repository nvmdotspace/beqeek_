/**
 * Documentation Viewer Component
 *
 * Renders markdown documentation for connectors
 */

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { FileText } from 'lucide-react';

interface DocumentationViewerProps {
  /** Markdown content */
  documentation?: string;
}

export function DocumentationViewer({ documentation }: DocumentationViewerProps) {
  if (!documentation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tài liệu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Không có tài liệu hướng dẫn cho connector này.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tài liệu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simple markdown rendering - for Phase 3 we'll use basic text display */}
        {/* In future, can integrate react-markdown or similar library */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-muted p-4 rounded-md">
            {documentation}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
