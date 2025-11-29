/**
 * TriggerWebhookForm - Webhook trigger configuration
 *
 * Displays webhook URL (read-only) for external integrations.
 * Auto-generates webhook ID on creation, provides copy snippets.
 */

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible';
import { Copy, Check, RefreshCw, ChevronDown, Code, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormField } from '../form-field';

interface TriggerWebhookFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type SnippetType = 'curl' | 'javascript' | 'python';

export function TriggerWebhookForm({ data, onUpdate }: TriggerWebhookFormProps) {
  const webhookId = (data.webhookId as string) || '';
  const name = (data.name as string) || '';
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<SnippetType | null>(null);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);

  // Auto-generate webhook ID if not present
  useEffect(() => {
    if (!webhookId) {
      onUpdate({ webhookId: generateUUID() });
    }
  }, [webhookId, onUpdate]);

  // Construct full webhook URL
  const webhookUrl = webhookId ? `https://app.beqeek.com/api/webhook/${webhookId}` : '';

  // Check if configuration is complete
  const isConfigured = !!(name && webhookId);

  const handleCopy = useCallback(async () => {
    if (webhookUrl) {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [webhookUrl]);

  const handleRegenerate = useCallback(() => {
    onUpdate({ webhookId: generateUUID() });
  }, [onUpdate]);

  // Code snippets
  const snippets: Record<SnippetType, string> = {
    curl: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {"key": "value"}}'`,
    javascript: `fetch("${webhookUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: { key: "value" } })
});`,
    python: `import requests

requests.post(
    "${webhookUrl}",
    json={"data": {"key": "value"}}
)`,
  };

  const handleCopySnippet = useCallback(
    async (type: SnippetType) => {
      await navigator.clipboard.writeText(snippets[type]);
      setCopiedSnippet(type);
      setTimeout(() => setCopiedSnippet(null), 2000);
    },
    [snippets],
  );

  return (
    <div className="space-y-4">
      {/* Configuration Status */}
      <div className="flex items-center gap-2">
        {isConfigured ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Configured
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Needs configuration
          </Badge>
        )}
      </div>

      <FormField
        label="Name"
        htmlFor="trigger-name"
        description="Unique identifier for this trigger"
        required
        error={!name ? 'Name is required' : undefined}
      >
        <Input
          id="trigger-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="my_webhook_trigger"
          aria-invalid={!name}
          className={!name ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
      </FormField>

      <FormField
        label="Webhook ID"
        htmlFor="trigger-webhook-id"
        description="Auto-generated unique identifier for the webhook endpoint"
      >
        <div className="flex gap-2">
          <Input
            id="trigger-webhook-id"
            value={webhookId}
            onChange={(e) => onUpdate({ webhookId: e.target.value })}
            placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRegenerate}
            aria-label="Regenerate webhook ID"
            title="Generate new ID"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </FormField>

      <FormField
        label="Webhook URL"
        htmlFor="trigger-webhook-url"
        description="Send POST requests to this URL to trigger the workflow"
      >
        <div className="flex gap-2">
          <Input
            id="trigger-webhook-url"
            value={webhookUrl || 'Generating...'}
            readOnly
            className="font-mono text-sm bg-muted"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!webhookUrl}
            aria-label="Copy webhook URL"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </FormField>

      {/* Collapsible Code Snippets */}
      <Collapsible open={isSnippetsOpen} onOpenChange={setIsSnippetsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="text-sm font-medium">Code Snippets</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isSnippetsOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {/* cURL */}
          <div className="rounded-md border bg-muted/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted">
              <span className="text-xs font-medium">cURL</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => handleCopySnippet('curl')}
              >
                {copiedSnippet === 'curl' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto">{snippets.curl}</pre>
          </div>

          {/* JavaScript */}
          <div className="rounded-md border bg-muted/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted">
              <span className="text-xs font-medium">JavaScript</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => handleCopySnippet('javascript')}
              >
                {copiedSnippet === 'javascript' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto">{snippets.javascript}</pre>
          </div>

          {/* Python */}
          <div className="rounded-md border bg-muted/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted">
              <span className="text-xs font-medium">Python</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => handleCopySnippet('python')}
              >
                {copiedSnippet === 'python' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto">{snippets.python}</pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
