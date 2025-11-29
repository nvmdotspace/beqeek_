/**
 * Connector Config Form Component
 *
 * Dynamic form that renders config fields based on connector type
 */

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { CONNECTOR_CONFIGS, type ConnectorType } from '@workspace/beqeek-shared/workflow-connectors';

interface ConnectorConfigFormProps {
  /** Connector type */
  connectorType: ConnectorType;
  /** Current config values */
  config: Record<string, unknown>;
  /** Whether connector uses OAuth */
  isOAuth: boolean;
  /** Submit handler */
  onSubmit: (config: Record<string, unknown>) => void;
  /** OAuth connect handler */
  onOAuthConnect?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Generate Zod schema from connector config definition
 */
function generateSchema(connectorType: ConnectorType) {
  const configDef = CONNECTOR_CONFIGS.find((c) => c.connectorType === connectorType);
  if (!configDef) return z.object({});

  const shape: Record<string, z.ZodTypeAny> = {};

  configDef.configFields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'number':
        fieldSchema = z.coerce.number();
        break;
      case 'checkbox':
        fieldSchema = z.boolean().optional();
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (field.type === 'number') {
        shape[field.name] = fieldSchema;
      } else if (field.type === 'checkbox') {
        shape[field.name] = fieldSchema;
      } else {
        shape[field.name] = (fieldSchema as z.ZodString).min(1, `${field.label} ${m.connectors_config_required()}`);
      }
    } else {
      shape[field.name] = fieldSchema.optional();
    }
  });

  return z.object(shape);
}

export function ConnectorConfigForm({
  connectorType,
  config,
  isOAuth,
  onSubmit,
  onOAuthConnect,
  isLoading = false,
}: ConnectorConfigFormProps) {
  const configDef = CONNECTOR_CONFIGS.find((c) => c.connectorType === connectorType);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const toggleFieldVisibility = (fieldName: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const schema = generateSchema(connectorType);

  const form = useForm({
    defaultValues: config,
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  if (!configDef) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{m.connectors_config_notFound()}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{m.connectors_config_title()}</CardTitle>
          {isOAuth && onOAuthConnect && (
            <Button type="button" variant="outline" size="sm" onClick={onOAuthConnect} disabled={isLoading}>
              {m.connectors_config_oauthConnect()}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {configDef.configFields.map((field) => (
            <form.Field key={field.name} name={field.name}>
              {(fieldApi) => {
                const isReadonly = field.readonly || false;
                const value = fieldApi.state.value ?? '';

                return (
                  <div className="space-y-2">
                    {field.type === 'checkbox' ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`field-${field.name}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => fieldApi.handleChange(Boolean(checked))}
                          disabled={isReadonly || isLoading}
                        />
                        <Label
                          htmlFor={`field-${field.name}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                      </div>
                    ) : (
                      <>
                        <Label htmlFor={`field-${field.name}`}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <div className="relative">
                          <Input
                            id={`field-${field.name}`}
                            type={
                              field.secret || field.type === 'password'
                                ? visibleFields[field.name]
                                  ? 'text'
                                  : 'password'
                                : field.type === 'number'
                                  ? 'number'
                                  : 'text'
                            }
                            value={
                              isReadonly && field.secret && !visibleFields[field.name] ? '••••••••••••' : String(value)
                            }
                            onChange={(e) => {
                              const val = field.type === 'number' ? Number(e.target.value) : e.target.value;
                              fieldApi.handleChange(val);
                            }}
                            onBlur={fieldApi.handleBlur}
                            disabled={isReadonly || isLoading}
                            readOnly={isReadonly}
                            className={field.secret || field.type === 'password' ? 'pr-10' : ''}
                          />
                          {(field.secret || field.type === 'password') && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleFieldVisibility(field.name)}
                              tabIndex={-1}
                            >
                              {visibleFields[field.name] ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
                      </>
                    )}

                    {fieldApi.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{fieldApi.state.meta.errors[0]}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          ))}

          <div className="flex justify-end pt-4">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
                  {isLoading ? m.connectors_config_saving() : m.connectors_config_save()}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
