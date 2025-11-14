/**
 * Config Panel Component
 *
 * Left panel showing form configuration options.
 * Displays form ID (read-only), submit button text, and field list.
 */

import { useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Copy, Check } from 'lucide-react';

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldList } from './field-list';

import type { FormInstance } from '../types';
import { useState } from 'react';

interface ConfigPanelProps {
  form: FormInstance;
}

export function ConfigPanel({ form }: ConfigPanelProps) {
  const { submitButtonText, setSubmitButtonText } = useFormBuilderStore();
  const [copied, setCopied] = useState(false);

  const copyFormId = async () => {
    try {
      await navigator.clipboard.writeText(form.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy form ID:', error);
    }
  };

  // Initialize submit button text from form config
  useEffect(() => {
    if (form.config?.submitButton?.text) {
      setSubmitButtonText(form.config.submitButton.text);
    }
  }, [form.config?.submitButton?.text, setSubmitButtonText]);

  return (
    <div className="border-r bg-muted/30 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Form ID */}
        <div className="space-y-2">
          <Label htmlFor="formId">Form ID</Label>
          <div className="flex gap-2">
            <Input
              id="formId"
              value={form.id}
              readOnly
              className="font-mono text-sm border border-input rounded-md bg-background text-foreground"
            />
            <Button variant="outline" size="icon" onClick={copyFormId} title="Copy Form ID">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Form Type */}
        <div className="space-y-2">
          <Label htmlFor="formType">Loại Form</Label>
          <Input
            id="formType"
            value={form.formType}
            readOnly
            className="border border-input rounded-md bg-background text-foreground"
          />
        </div>

        {/* Submit Button Text */}
        <div className="space-y-2">
          <Label htmlFor="submitText">Nút Gửi</Label>
          <Input
            id="submitText"
            value={submitButtonText}
            onChange={(e) => setSubmitButtonText(e.target.value)}
            placeholder="Nhập text cho nút gửi"
            className="border border-input rounded-md bg-background text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
          />
        </div>

        {/* Field List */}
        <div className="space-y-2">
          <Label>Danh sách Fields</Label>
          <FieldList />
        </div>
      </div>
    </div>
  );
}
