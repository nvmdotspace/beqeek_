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
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and contact information</CardDescription>
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
                Identity
              </Heading>
              <Separator />

              {/* Username (read-only) */}
              <Stack space="space-100">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user.globalUser?.username || ''} disabled className="bg-muted" />
                <Text size="small" color="muted">
                  Username cannot be changed
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
                        <span>Full Name</span>
                        <Text as="span" color="destructive">
                          *
                        </Text>
                      </Inline>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
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
                Contact
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
                        <span>Email</span>
                        <Text as="span" color="destructive">
                          *
                        </Text>
                      </Inline>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
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
                Save Changes
              </Button>
            </Inline>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
