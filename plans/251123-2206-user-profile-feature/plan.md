# User Profile Feature - Implementation Plan

## Summary

Implement user profile feature for Beqeek platform covering:

1. Display real user avatar in header (replacing hardcoded `/avatars/01.png`)
2. Create user profile page with edit capabilities
3. Avatar upload functionality using temp files API

## Key Insights

- **Two user types**: Global User (system-wide) vs Workspace User (workspace-scoped)
- **Current user data** available via `myWorkspaceUser` field in workspace response
- **Avatar upload flow**: Upload to temp → get path → patch user profile with `avatarUpload` field
- **Auth store** only stores `userId`, no user profile data - need separate fetch

## APIs Identified

| Endpoint                                           | Method | Purpose                                                    |
| -------------------------------------------------- | ------ | ---------------------------------------------------------- |
| `/api/user/me/get/workspaces/{workspaceId}`        | POST   | Get workspace with `myWorkspaceUser` data                  |
| `/api/user/patch/me`                               | POST   | Update global user profile (email, fullName, avatarUpload) |
| `/api/file/post/temp-files`                        | POST   | Upload temp files, returns `data.paths[]`                  |
| `/api/workspace/{workspaceId}/workspace/get/users` | POST   | Get workspace users list                                   |

## Implementation Phases

| Phase | Title                                                        | Status      | Est. Effort |
| ----- | ------------------------------------------------------------ | ----------- | ----------- |
| 1     | [Header Avatar Display](./phase-01-header-avatar-display.md) | ✅ complete | 2h          |
| 2     | [User Profile Page](./phase-02-user-profile-page.md)         | ✅ complete | 4h          |
| 3     | [Avatar Upload](./phase-03-avatar-upload.md)                 | ✅ complete | 3h          |

## Architecture Decision

**Location**: `apps/web/src/features/workspace-users/`

- Extend existing feature rather than creating new `user-profile/` feature
- Reuse `ApiWorkspaceUser` type and workspace user fetching patterns

## Files to Create/Modify

### New Files

- `workspace-users/pages/user-profile-page.tsx`
- `workspace-users/hooks/use-current-workspace-user.ts`
- `workspace-users/hooks/use-update-user-profile.ts`
- `workspace-users/hooks/use-upload-avatar.ts`
- `workspace-users/components/avatar-upload.tsx`
- `workspace-users/components/profile-form.tsx`
- `routes/$locale/workspaces/$workspaceId/profile.tsx`

### Modified Files

- `components/app-layout.tsx` - Use real avatar data
- `shared/route-paths.ts` - Add profile route
- `workspace-users/index.ts` - Export new hooks/components

## Resolved Questions

1. ✅ Profile page scope: **Workspace-scoped** (`/workspaces/$workspaceId/profile`)
2. ✅ Backend update support: **Only global user** - workspace user fields are read-only
3. ✅ Avatar limits: Backend supports file size limits (to be confirmed during impl)
