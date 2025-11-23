# Phase 2: User Profile Page

## Context

- [app-layout.tsx](/apps/web/src/components/app-layout.tsx) - DropdownMenuContent features (line 131-149)
- [swagger.yaml](/docs/swagger.yaml) - `/api/user/patch/me` endpoint
- [active-table-settings-page.tsx](/apps/web/src/features/active-tables/pages/active-table-settings-page.tsx) - Reference pattern

## Overview

| Field    | Value       |
| -------- | ----------- |
| Date     | 2025-11-23  |
| Priority | High        |
| Status   | ✅ Complete |
| Effort   | 4 hours     |

Create user profile page matching dropdown menu features: Profile, Settings, Billing, Keyboard Shortcuts.

## Key Insights

1. **Dropdown menu items**: Profile, Settings, Billing, Keyboard Shortcuts, Log out
2. **Profile update API**: `POST /api/user/patch/me` accepts `{ data: { fullName, email, password, avatarUpload } }`
3. **Workspace-scoped**: Profile page at `/workspaces/$workspaceId/profile`
4. **Update scope**: Only global user editable via `/api/user/patch/me` - workspace user fields are read-only

## Requirements

### Functional

- [ ] Profile section: View/edit fullName, email, view username (read-only)
- [ ] Display avatar with edit capability (Phase 3)
- [ ] Settings section: Theme preference, language preference
- [ ] Link to keyboard shortcuts (existing functionality)
- [ ] Success/error toast on profile update

### Non-Functional

- [ ] Responsive layout (mobile-first)
- [ ] Use TanStack Form for form handling
- [ ] Use React Query mutations for API calls
- [ ] Follow design tokens

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   UserProfilePage                           │
├─────────────────────────────────────────────────────────────┤
│  ProfileHeader                                              │
│  ├── Avatar (large, with edit overlay → Phase 3)           │
│  ├── FullName                                              │
│  └── Email                                                 │
├─────────────────────────────────────────────────────────────┤
│  Tabs                                                       │
│  ├── Profile Tab                                           │
│  │   └── ProfileForm                                       │
│  │       ├── FullName input                                │
│  │       ├── Email input                                   │
│  │       ├── Username (read-only)                          │
│  │       └── Save button                                   │
│  ├── Settings Tab                                          │
│  │   └── SettingsForm                                      │
│  │       ├── Theme selector (uses existing ThemeToggle)    │
│  │       └── Language selector                             │
│  └── Billing Tab (placeholder)                             │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

| File                                                                        | Purpose                          |
| --------------------------------------------------------------------------- | -------------------------------- |
| `apps/web/src/features/workspace-users/hooks/use-current-workspace-user.ts` | From Phase 1                     |
| `apps/web/src/features/active-tables/pages/active-table-settings-page.tsx`  | Reference: settings page pattern |
| `apps/web/src/stores/language-store.ts`                                     | Language preference store        |
| `apps/web/src/components/theme-toggle.tsx`                                  | Theme toggle component           |
| `packages/ui/src/components/tabs.tsx`                                       | Tabs component                   |
| `packages/ui/src/components/input.tsx`                                      | Input component                  |

## Implementation Steps

### Step 1: Create API function

```typescript
// apps/web/src/features/workspace-users/api/user-profile-api.ts
import { apiRequest } from '@/shared/api/http-client';
import type { StandardResponse, User } from '@/shared/api/types';

export interface UpdateUserProfileData {
  fullName?: string;
  email?: string;
  password?: string;
  avatarUpload?: string; // temp file path from Phase 3
}

export const updateUserProfile = (data: UpdateUserProfileData) =>
  apiRequest<StandardResponse<User>>({
    url: '/api/user/patch/me',
    method: 'POST',
    data: { data },
  });
```

### Step 2: Create mutation hook

```typescript
// apps/web/src/features/workspace-users/hooks/use-update-user-profile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, type UpdateUserProfileData } from '../api/user-profile-api';
import { toast } from '@workspace/ui/components/sonner';

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileData) => updateUserProfile(data),
    onSuccess: () => {
      // Invalidate workspace queries to refresh myWorkspaceUser
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
```

### Step 3: Create profile form component

```typescript
// apps/web/src/features/workspace-users/components/profile-form.tsx
import { useForm } from '@tanstack/react-form';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import type { User } from '@/shared/api/types';
import { useUpdateUserProfile } from '../hooks/use-update-user-profile';

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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Form fields */}
    </form>
  );
}
```

### Step 4: Create profile page

```typescript
// apps/web/src/features/workspace-users/pages/user-profile-page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { useCurrentWorkspaceUser } from '../hooks/use-current-workspace-user';
import { ProfileForm } from '../components/profile-form';
import { getUserInitials } from '../utils/user-initials';

export function UserProfilePage() {
  const { user, isLoading, error } = useCurrentWorkspaceUser();

  if (isLoading) return <ProfileSkeleton />;
  if (error) return <ProfileError error={error} />;
  if (!user) return <ProfileNotFound />;

  return (
    <div className="container max-w-3xl py-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || user.thumbnailAvatar} />
          <AvatarFallback className="text-2xl">
            {getUserInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm user={user} />
        </TabsContent>
        {/* Other tabs */}
      </Tabs>
    </div>
  );
}
```

### Step 5: Create route file

```typescript
// apps/web/src/routes/$locale/workspaces/$workspaceId/profile.tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const UserProfilePageLazy = lazy(() =>
  import('@/features/workspace-users/pages/user-profile-page').then((m) => ({
    default: m.UserProfilePage,
  }))
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/profile')({
  beforeLoad: () => {
    if (!getIsAuthenticated()) {
      throw redirect({ to: '/$locale/login', params: { locale: 'vi' } });
    }
  },
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfilePageLazy />
    </Suspense>
  );
}
```

### Step 6: Update route-paths.ts

```typescript
// Add to ROUTES.WORKSPACE
PROFILE: '/$locale/workspaces/$workspaceId/profile' as const,
```

### Step 7: Link from header dropdown

```tsx
// In app-layout.tsx DropdownMenuContent
<DropdownMenuItem asChild>
  <Link to="/$locale/workspaces/$workspaceId/profile" params={{ locale, workspaceId }}>
    Profile
  </Link>
</DropdownMenuItem>
```

## Todo List

- [ ] Create `user-profile-api.ts` with update function
- [ ] Create `use-update-user-profile.ts` mutation hook
- [ ] Create `profile-form.tsx` component
- [ ] Create `user-profile-page.tsx` page
- [ ] Create route file at `routes/$locale/workspaces/$workspaceId/profile.tsx`
- [ ] Add route constant to `route-paths.ts`
- [ ] Update header dropdown to link to profile
- [ ] Add loading skeleton component
- [ ] Add error boundary
- [ ] Export components/hooks from index

## Success Criteria

- [ ] Profile page accessible from header dropdown
- [ ] User can view their profile info
- [ ] User can edit fullName and email
- [ ] Save triggers API call and shows toast
- [ ] Workspace cache invalidated on success
- [ ] Settings tab shows theme/language preferences
- [ ] Page responsive on mobile

## Risk Assessment

| Risk                         | Likelihood | Impact | Mitigation                   |
| ---------------------------- | ---------- | ------ | ---------------------------- |
| Email validation on backend  | Medium     | Low    | Add frontend validation      |
| Password change complexity   | Medium     | Medium | Defer to separate modal      |
| Cache staleness after update | Low        | Medium | Invalidate workspace queries |

## Security Considerations

- Password field should be optional and handled separately
- Email change may require verification (backend concern)
- No sensitive data in URL params

## Next Steps

→ Phase 3: Implement avatar upload functionality
