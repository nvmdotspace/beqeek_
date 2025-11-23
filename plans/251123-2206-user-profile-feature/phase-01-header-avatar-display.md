# Phase 1: Header Avatar Display

## Context

- [app-layout.tsx](/apps/web/src/components/app-layout.tsx) - Current header implementation
- [workspace-api.ts](/apps/web/src/features/workspace/api/workspace-api.ts) - Workspace fetch with myWorkspaceUser

## Overview

| Field    | Value       |
| -------- | ----------- |
| Date     | 2025-11-23  |
| Priority | High        |
| Status   | ✅ Complete |
| Effort   | 2 hours     |

Replace hardcoded avatar in header with real user data from workspace context.

## Key Insights

1. **Current State**: Header uses hardcoded `/avatars/01.png` and `userId?.[0]?.toUpperCase()` for fallback
2. **Data Source**: `myWorkspaceUser` field already fetched via workspace API
3. **User Fields Available**: `id`, `fullName`, `email`, `avatar`, `thumbnailAvatar`
4. **No extra API call needed** - workspace data already cached by React Query

## Requirements

### Functional

- [ ] Display real user avatar from `myWorkspaceUser.thumbnailAvatar` or `myWorkspaceUser.avatar`
- [ ] Show user's full name instead of "User" placeholder
- [ ] Fallback to initials if no avatar URL
- [ ] Handle loading and error states gracefully

### Non-Functional

- [ ] Use existing workspace cache (no additional API calls)
- [ ] Maintain responsive design (mobile/desktop)
- [ ] Follow design tokens (no hardcoded colors)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AppLayout                              │
├─────────────────────────────────────────────────────────────┤
│  Header                                                      │
│  ├── SidebarToggle                                          │
│  ├── ThemeToggle                                            │
│  ├── SettingsDropdown                                       │
│  └── UserMenu ← NEW: useCurrentWorkspaceUser()              │
│       ├── Avatar (thumbnailAvatar || avatar || initials)    │
│       └── DropdownMenuContent                               │
│            ├── User Info (fullName, email)                  │
│            ├── Profile Link ← Phase 2                       │
│            └── Logout                                       │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

| File                                                      | Purpose                 |
| --------------------------------------------------------- | ----------------------- |
| `apps/web/src/components/app-layout.tsx`                  | Main layout with header |
| `apps/web/src/features/workspace/hooks/use-workspaces.ts` | Existing workspace hook |
| `apps/web/src/shared/api/types.ts`                        | User type definition    |
| `packages/ui/src/components/avatar.tsx`                   | Avatar component        |

## Implementation Steps

### Step 1: Create useCurrentWorkspaceUser hook

```typescript
// apps/web/src/features/workspace-users/hooks/use-current-workspace-user.ts
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getWorkspace } from '@/features/workspace/api/workspace-api';

export function useCurrentWorkspaceUser() {
  const { workspaceId } = useParams({ strict: false });

  const { data, isLoading, error } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId,
    select: (response) => response.data?.myWorkspaceUser,
    staleTime: 5 * 60 * 1000,
  });

  return { user: data, isLoading, error };
}
```

### Step 2: Create initials utility

```typescript
// apps/web/src/features/workspace-users/utils/user-initials.ts
export function getUserInitials(fullName?: string | null): string {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
```

### Step 3: Update app-layout.tsx

```tsx
// Replace lines 121-150 in app-layout.tsx
const { user: currentUser, isLoading: userLoading } = useCurrentWorkspaceUser();

// In Avatar component:
<Avatar className="h-8 w-8">
  <AvatarImage
    src={currentUser?.thumbnailAvatar || currentUser?.avatar}
    alt={currentUser?.fullName || ''}
  />
  <AvatarFallback>
    {getUserInitials(currentUser?.fullName)}
  </AvatarFallback>
</Avatar>

// In DropdownMenuContent:
<div className="flex items-center justify-start gap-2 p-2">
  <div className="flex flex-col space-y-1 leading-none">
    <p className="font-medium">{currentUser?.fullName || 'User'}</p>
    {currentUser?.email && (
      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
    )}
  </div>
</div>
```

### Step 4: Export hook from feature index

```typescript
// apps/web/src/features/workspace-users/index.ts
export { useCurrentWorkspaceUser } from './hooks/use-current-workspace-user';
```

## Todo List

- [ ] Create `use-current-workspace-user.ts` hook
- [ ] Create `user-initials.ts` utility
- [ ] Update `app-layout.tsx` to use real user data
- [ ] Export new hook from `workspace-users/index.ts`
- [ ] Test avatar display with real user
- [ ] Test fallback initials display
- [ ] Verify no extra API calls made

## Success Criteria

- [ ] Real avatar displays in header when user has avatar
- [ ] Initials display when no avatar URL
- [ ] Full name shows in dropdown menu
- [ ] Email shows in dropdown menu (if available)
- [ ] No additional API requests (uses cached workspace data)
- [ ] Works on both mobile and desktop

## Risk Assessment

| Risk                                           | Likelihood | Impact | Mitigation                    |
| ---------------------------------------------- | ---------- | ------ | ----------------------------- |
| Workspace not in context (on /workspaces page) | Medium     | Low    | Graceful fallback to initials |
| Avatar URL broken/404                          | Low        | Low    | AvatarFallback handles this   |
| Cache miss causing delay                       | Low        | Low    | Show loading skeleton         |

## Security Considerations

- Avatar URLs are public (no auth needed)
- No sensitive data exposed in header
- User email only shown to authenticated user

## Next Steps

→ Phase 2: Create user profile page with edit form
