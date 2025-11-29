/**
 * ApiCallForm - HTTP API request configuration
 *
 * Configures method, URL, headers, and payload.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';
import { ValueBuilder } from '../../../value-builder';

interface ApiCallFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function ApiCallForm({ data, onUpdate }: ApiCallFormProps) {
  // IR converter stores: data.label (name) and data.config.* (config fields)
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'api_call';
  const method = (config.method as string) || 'GET';
  const url = (config.url as string) || '';
  const requestType = (config.requestType as string) || 'json';
  const responseFormat = (config.responseFormat as string) || 'json';
  const headers = typeof config.headers === 'string' ? config.headers : JSON.stringify(config.headers || {}, null, 2);
  const payload = typeof config.payload === 'string' ? config.payload : JSON.stringify(config.payload || {}, null, 2);

  const showPayload = method !== 'GET' && method !== 'DELETE';

  // Helper to update config fields while preserving structure
  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="api-name" description="Unique identifier for this step" required>
        <Input
          id="api-name"
          value={name}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="api_call"
        />
      </FormField>

      <FormField label="Method" htmlFor="api-method" description="HTTP request method" required>
        <Select value={method} onValueChange={(value) => updateConfig({ method: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="URL" htmlFor="api-url" description="Full endpoint URL" required>
        <Input
          id="api-url"
          value={url}
          onChange={(e) => updateConfig({ url: e.target.value })}
          placeholder="https://api.example.com/endpoint"
        />
      </FormField>

      <FormField label="Request Type" htmlFor="api-request-type" description="Content-Type for request body">
        <Select value={requestType} onValueChange={(value) => updateConfig({ requestType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="form_params">Form Data</SelectItem>
            <SelectItem value="multipart">Multipart</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Response Format" htmlFor="api-response-format" description="Expected response format">
        <Select value={responseFormat} onValueChange={(value) => updateConfig({ responseFormat: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="base64">Base64</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Headers" htmlFor="api-headers" description="Optional request headers">
        <ValueBuilder value={headers} onChange={(value) => updateConfig({ headers: value })} mode="object" />
      </FormField>

      {showPayload && (
        <FormField label="Payload" htmlFor="api-payload" description="Request body data">
          <ValueBuilder value={payload} onChange={(value) => updateConfig({ payload: value })} mode="any" />
        </FormField>
      )}
    </div>
  );
}
