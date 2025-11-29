/**
 * SmtpEmailForm - SMTP email sending configuration
 *
 * Configures email recipient, subject, and body.
 */

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { FormField } from '../form-field';

interface SmtpEmailFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function SmtpEmailForm({ data, onUpdate }: SmtpEmailFormProps) {
  const name = (data.name as string) || 'send_email';
  const connector = (data.connector as string) || '';
  const to = (data.to as string) || '';
  const toName = (data.toName as string) || '';
  const cc = (data.cc as string) || '';
  const bcc = (data.bcc as string) || '';
  const subject = (data.subject as string) || '';
  const body = (data.body as string) || '';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="email-name" description="Unique identifier for this step" required>
        <Input
          id="email-name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="send_email"
        />
      </FormField>

      <FormField label="SMTP Connector" htmlFor="email-connector" description="Connector ID for SMTP configuration">
        <Input
          id="email-connector"
          value={connector}
          onChange={(e) => onUpdate({ connector: e.target.value })}
          placeholder="Enter SMTP connector ID"
          className="font-mono"
        />
      </FormField>

      <FormField label="To" htmlFor="email-to" description="Recipient email address, e.g. $[trigger.email]" required>
        <Input
          id="email-to"
          value={to}
          onChange={(e) => onUpdate({ to: e.target.value })}
          placeholder="recipient@example.com"
        />
      </FormField>

      <FormField label="To Name" htmlFor="email-to-name" description="Recipient display name">
        <Input
          id="email-to-name"
          value={toName}
          onChange={(e) => onUpdate({ toName: e.target.value })}
          placeholder="Recipient Name"
        />
      </FormField>

      <FormField label="CC" htmlFor="email-cc" description="Carbon copy recipients (comma separated)">
        <Input
          id="email-cc"
          value={cc}
          onChange={(e) => onUpdate({ cc: e.target.value })}
          placeholder="cc1@example.com, cc2@example.com"
        />
      </FormField>

      <FormField label="BCC" htmlFor="email-bcc" description="Blind carbon copy recipients">
        <Input
          id="email-bcc"
          value={bcc}
          onChange={(e) => onUpdate({ bcc: e.target.value })}
          placeholder="bcc@example.com"
        />
      </FormField>

      <FormField label="Subject" htmlFor="email-subject" description="Email subject line" required>
        <Input
          id="email-subject"
          value={subject}
          onChange={(e) => onUpdate({ subject: e.target.value })}
          placeholder="Your order confirmation"
        />
      </FormField>

      <FormField label="Body" htmlFor="email-body" description="Email content (supports HTML)" required>
        <Textarea
          id="email-body"
          value={body}
          onChange={(e) => onUpdate({ body: e.target.value })}
          placeholder="Hello $[trigger.name],\n\nThank you for your order..."
          className="min-h-[150px]"
        />
      </FormField>
    </div>
  );
}
