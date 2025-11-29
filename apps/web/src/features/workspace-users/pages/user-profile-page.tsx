import { getRouteApi } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Sun, Moon, Monitor, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Container, Box } from '@workspace/ui/components/primitives';
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Separator } from '@workspace/ui/components/separator';

import { useCurrentWorkspaceUser } from '../hooks/use-current-workspace-user';
import { ProfileForm } from '../components/profile-form';
import { AvatarUpload } from '../components/avatar-upload';
import { useThemeStore } from '@/stores/theme-store';
import { useLanguageStore } from '@/stores/language-store';
import { ROUTES } from '@/shared/route-paths';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.PROFILE);

export function UserProfilePage() {
  const { user, isLoading, error } = useCurrentWorkspaceUser();
  const { tab } = route.useSearch();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ProfileError error={error} />;
  }

  if (!user) {
    return <ProfileNotFound />;
  }

  return (
    <Container maxWidth="md" padding="gutter" className="py-[var(--space-400)]">
      <Stack space="space-400">
        {/* Breadcrumb / Header */}
        <Stack space="space-100">
          <Inline space="space-100" align="center" className="text-muted-foreground text-sm">
            <span>{m.userProfile_breadcrumb_settings()}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{m.userProfile_breadcrumb_profile()}</span>
          </Inline>
          <Heading level={1}>{m.userProfile_title()}</Heading>
        </Stack>

        {/* Profile Header Card */}
        <Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
          <Inline space="space-250" align="center">
            <AvatarUpload currentAvatar={user.thumbnailAvatar || user.avatar} fullName={user.fullName} size="lg" />
            <Stack space="space-050">
              <Heading level={2}>{user.fullName}</Heading>
              <Text color="muted">{user.email}</Text>
              {user.globalUser?.username && (
                <Text size="small" color="muted">
                  @{user.globalUser.username}
                </Text>
              )}
            </Stack>
          </Inline>
        </Box>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue={tab || 'profile'}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{m.userProfile_tab_profile()}</TabsTrigger>
            <TabsTrigger value="settings">{m.userProfile_tab_settings()}</TabsTrigger>
            <TabsTrigger value="billing">{m.userProfile_tab_billing()}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-[var(--space-300)]">
            <ProfileForm user={user} />
          </TabsContent>

          <TabsContent value="settings" className="mt-[var(--space-300)]">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="billing" className="mt-[var(--space-300)]">
            <BillingTab />
          </TabsContent>
        </Tabs>
      </Stack>
    </Container>
  );
}

function SettingsTab() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const locale = useLanguageStore((state) => state.locale);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <Stack space="space-300">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{m.userProfile_settings_appearanceTitle()}</CardTitle>
          <CardDescription>{m.userProfile_settings_appearanceDesc()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack space="space-150">
            <Label>{m.userProfile_settings_themeLabel()}</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              className="grid grid-cols-3 gap-[var(--space-200)]"
            >
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-[var(--space-200)] hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Sun className="mb-[var(--space-150)] h-6 w-6" />
                <Text size="small" weight="medium" as="span">
                  {m.userProfile_settings_themeLight()}
                </Text>
              </Label>
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-[var(--space-200)] hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Moon className="mb-[var(--space-150)] h-6 w-6" />
                <Text size="small" weight="medium" as="span">
                  {m.userProfile_settings_themeDark()}
                </Text>
              </Label>
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-[var(--space-200)] hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Monitor className="mb-[var(--space-150)] h-6 w-6" />
                <Text size="small" weight="medium" as="span">
                  {m.userProfile_settings_themeSystem()}
                </Text>
              </Label>
            </RadioGroup>
          </Stack>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{m.userProfile_settings_languageTitle()}</CardTitle>
          <CardDescription>{m.userProfile_settings_languageDesc()}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={locale} onValueChange={setLanguage} className="grid grid-cols-2 gap-[var(--space-200)]">
            <Label
              htmlFor="lang-vi"
              className="flex items-center gap-[var(--space-150)] rounded-md border-2 border-muted bg-popover p-[var(--space-200)] hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="vi" id="lang-vi" className="sr-only" />
              <Globe className="h-5 w-5" />
              <Text weight="medium" as="span">
                {m.userProfile_settings_langVietnamese()}
              </Text>
            </Label>
            <Label
              htmlFor="lang-en"
              className="flex items-center gap-[var(--space-150)] rounded-md border-2 border-muted bg-popover p-[var(--space-200)] hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="en" id="lang-en" className="sr-only" />
              <Globe className="h-5 w-5" />
              <Text weight="medium" as="span">
                {m.userProfile_settings_langEnglish()}
              </Text>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>{m.userProfile_settings_shortcutsTitle()}</CardTitle>
          <CardDescription>{m.userProfile_settings_shortcutsDesc()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.open('/keyboard-shortcuts', '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {m.userProfile_settings_viewShortcuts()}
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}

function BillingTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.userProfile_billing_title()}</CardTitle>
        <CardDescription>{m.userProfile_billing_desc()}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px] flex flex-col items-center justify-center text-center gap-2">
        <div className="p-4 rounded-full bg-muted">
          <Globe className="h-8 w-8 text-muted-foreground" />
        </div>
        <Heading level={3} className="text-base font-medium">
          {m.userProfile_billing_noSubscription()}
        </Heading>
        <Text color="muted">{m.userProfile_billing_underDevelopment()}</Text>
        <Button variant="outline" className="mt-2" disabled>
          {m.userProfile_billing_upgradePlan()}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Container maxWidth="md" padding="gutter" className="py-[var(--space-400)]">
      <Stack space="space-400">
        {/* Header card skeleton */}
        <Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
          <Inline space="space-250" align="center">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Stack space="space-100">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </Stack>
          </Inline>
        </Box>
        <Separator />
        {/* Tabs skeleton */}
        <Stack space="space-300">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </Stack>
      </Stack>
    </Container>
  );
}

function ProfileError({ error }: { error: Error }) {
  return (
    <Container maxWidth="md" padding="gutter" className="py-[var(--space-400)]">
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">{m.userProfile_error_title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text color="muted">{m.userProfile_error_loadFailed({ message: error.message })}</Text>
        </CardContent>
      </Card>
    </Container>
  );
}

function ProfileNotFound() {
  return (
    <Container maxWidth="md" padding="gutter" className="py-[var(--space-400)]">
      <Card>
        <CardHeader>
          <CardTitle>{m.userProfile_notFound_title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text color="muted">{m.userProfile_notFound_desc()}</Text>
        </CardContent>
      </Card>
    </Container>
  );
}
