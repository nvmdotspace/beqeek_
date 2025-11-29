/**
 * Config Panel Component
 *
 * Left panel showing form configuration options.
 * Displays form ID (read-only), submit button text, and field list.
 */

import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Copy, Check } from 'lucide-react';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';

import { useFormBuilderStore } from '../stores/form-builder-store';
import { FieldList } from './field-list';

import type { FormInstance } from '../types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
    <div className="border-r bg-muted/30 overflow-y-auto">
      <Box padding="space-300" className="px-6">
        <Stack space="space-300">
          {/* Form ID */}
          <Stack space="space-050">
            <Label htmlFor="formId">Form ID</Label>
            <Inline space="space-050">
              <Input id="formId" value={form.id} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={copyFormId} title="Copy Form ID">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Inline>
          </Stack>

          {/* Form Type */}
          <Stack space="space-050">
            <Label htmlFor="formType">{m.workflowForms_configPanel_formType()}</Label>
            <Input id="formType" value={form.formType} readOnly />
          </Stack>

          {/* Submit Button Text */}
          <Stack space="space-050">
            <Label htmlFor="submitText">{m.workflowForms_configPanel_submitButton()}</Label>
            <Input
              id="submitText"
              value={submitButtonText}
              onChange={(e) => setSubmitButtonText(e.target.value)}
              placeholder={m.workflowForms_configPanel_submitButtonPlaceholder()}
            />
          </Stack>

          {/* Field List */}
          <Stack space="space-050">
            <Label>{m.workflowForms_configPanel_fieldList()}</Label>
            <FieldList />
          </Stack>
        </Stack>
      </Box>
    </div>
  );
}
