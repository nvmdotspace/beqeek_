import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Text, Heading } from '@workspace/ui/components/typography';
import { Separator } from '@workspace/ui/components/separator';
import { Loader2 } from 'lucide-react';

import type { User } from '@/shared/api/types';
import { useUpdateUserProfile } from '../hooks/use-update-user-profile';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email address'),
});

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { mutate, isPending } = useUpdateUserProfile();

  const form = useForm({
    defaultValues: {
      fullName: user.fullName || '',
      email: user.email || '',
    },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.userProfile_form_personalInfo()}</CardTitle>
        <CardDescription>{m.userProfile_form_personalInfoDesc()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="max-w-2xl"
        >
          <Stack space="space-400">
            {/* Identity Section */}
            <Stack space="space-300">
              <Heading level={3} className="text-base font-medium">
                {m.userProfile_form_identitySection()}
              </Heading>
              <Separator />

              {/* Username (read-only) */}
              <Stack space="space-100">
                <Label htmlFor="username">{m.userProfile_form_usernameLabel()}</Label>
                <Input id="username" value={user.globalUser?.username || ''} disabled className="bg-muted" />
                <Text size="small" color="muted">
                  {m.userProfile_form_usernameHint()}
                </Text>
              </Stack>

              {/* Full Name */}
              <form.Field
                name="fullName"
                validators={{
                  onChange: profileSchema.shape.fullName,
                }}
              >
                {(field) => (
                  <Stack space="space-100">
                    <Label htmlFor="fullName">
                      <Inline space="space-050" align="center">
                        <span>{m.userProfile_form_fullNameLabel()}</span>
                        <Text as="span" color="destructive">
                          *
                        </Text>
                      </Inline>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder={m.userProfile_form_fullNamePlaceholder()}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isPending}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text size="small" color="destructive">
                        {field.state.meta.errors.join(', ')}
                      </Text>
                    )}
                  </Stack>
                )}
              </form.Field>
            </Stack>

            {/* Contact Section */}
            <Stack space="space-300">
              <Heading level={3} className="text-base font-medium">
                {m.userProfile_form_contactSection()}
              </Heading>
              <Separator />

              {/* Email */}
              <form.Field
                name="email"
                validators={{
                  onChange: profileSchema.shape.email,
                }}
              >
                {(field) => (
                  <Stack space="space-100">
                    <Label htmlFor="email">
                      <Inline space="space-050" align="center">
                        <span>{m.userProfile_form_emailLabel()}</span>
                        <Text as="span" color="destructive">
                          *
                        </Text>
                      </Inline>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={m.userProfile_form_emailPlaceholder()}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isPending}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text size="small" color="destructive">
                        {field.state.meta.errors.join(', ')}
                      </Text>
                    )}
                  </Stack>
                )}
              </form.Field>
            </Stack>

            {/* Submit Button */}
            <Inline justify="start">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {m.userProfile_form_saveChanges()}
              </Button>
            </Inline>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
