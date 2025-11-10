# Workspace Users Feature

Type-safe hooks and utilities for fetching and managing workspace users with flexible field selection and filtering.

## Overview

This feature provides a type-safe API client for the workspace users endpoint with:

- ✅ **Flexible field selection** - Request only the fields you need
- ✅ **Predefined query presets** - Common use cases ready to use
- ✅ **Type-safe filtering** - Filter by workspace team roles
- ✅ **Pagination support** - Limit and offset for large datasets
- ✅ **React Query integration** - Automatic caching and background updates
- ✅ **Zero `any` types** - Full TypeScript type safety

## API Endpoint

```
POST /api/workspace/{workspaceId}/workspace/get/users
```

## Quick Start

### Basic Usage (Minimal Fields)

```tsx
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks';

function CreateRecordForm() {
  // Use CREATE_RECORD_FORM preset - only fetches id and fullName
  const { data: users, isLoading } = useGetWorkspaceUsers(workspaceId, {
    query: 'CREATE_RECORD_FORM',
  });

  return (
    <select>
      {users?.map((user) => (
        <option key={user.id} value={user.id}>
          {user.fullName}
        </option>
      ))}
    </select>
  );
}
```

### Request Body (Generated Automatically)

```json
{
  "queries": {
    "fields": "id,fullName",
    "filtering": {},
    "limit": 100,
    "offset": 0
  }
}
```

## Query Presets

Pre-configured queries for common use cases:

### `CREATE_RECORD_FORM` (Recommended for dropdowns)

Minimal fields for form dropdowns and selects:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM',
});
```

**Fields**: `id`, `fullName`
**Limit**: 100 users
**Use case**: Record creation forms, user selects

---

### `BASIC_WITH_AVATAR`

Basic user info with avatar for user cards:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR',
});
```

**Fields**: `id`, `fullName`, `avatar`, `thumbnailAvatar`
**Use case**: User lists, user cards, avatars

---

### `FULL_DETAILS`

Complete user information including memberships:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'FULL_DETAILS',
});
```

**Fields**: `id`, `fullName`, `avatar`, `thumbnailAvatar`, `globalUser{username}`, `workspaceMemberships{...}`, `createdAt`
**Use case**: Admin panels, user management, detailed views

---

### `USERNAME_ONLY`

Minimal data for mentions and autocomplete:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'USERNAME_ONLY',
});
```

**Fields**: `id`, `fullName`, `globalUser{username}`
**Limit**: 50 users
**Use case**: @mentions, autocomplete, user search

## Custom Queries

### Field Selection

Request specific fields only:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: {
    fields: 'id,fullName,avatar,email',
    limit: 20,
  },
});
```

### Filtering by Team Role

Filter users by workspace team:

```tsx
const { data: teamMembers } = useGetWorkspaceUsers(workspaceId, {
  query: {
    fields: 'id,fullName,avatar',
    filtering: {
      workspaceTeamRole: {
        workspaceTeamId: 123,
      },
    },
  },
});
```

### Pagination

Fetch users in pages:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: {
    fields: 'id,fullName',
    limit: 10,
    offset: 20, // Skip first 20 users
  },
});
```

### Sorting

Sort users by field:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: {
    fields: 'id,fullName,createdAt',
    sorting: {
      field: 'createdAt',
      direction: 'desc',
    },
  },
});
```

## Advanced Usage

### Conditional Fetching

Only fetch when needed:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM',
  reactQueryOptions: {
    enabled: isUserField(field.type), // Only fetch for user fields
  },
});
```

### Custom Cache Time

Override default cache duration:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR',
  reactQueryOptions: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
});
```

### Error Handling

```tsx
const {
  data: users,
  error,
  isError,
} = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM',
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

## Type Definitions

### `WorkspaceUser`

```ts
interface WorkspaceUser {
  id: string;
  fullName: string;
  avatar?: string;
  thumbnailAvatar?: string;
  email?: string;
  username?: string;
  globalUser?: {
    username: string;
    email?: string;
  };
  workspaceMemberships?: Array<{
    userId: string;
    workspaceTeamRoleId: string;
    workspaceTeamId: string;
    invitedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}
```

### `WorkspaceUsersQueries`

```ts
interface WorkspaceUsersQueries {
  fields?: string; // Comma-separated field list
  filtering?: WorkspaceUsersFiltering;
  limit?: number;
  offset?: number;
  sorting?: WorkspaceUsersSorting;
}
```

## Performance Optimization

### 1. Use Minimal Field Selection

**❌ Bad** - Fetches all fields (slower, larger response):

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId);
```

**✅ Good** - Only fetches needed fields:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM', // Only id,fullName
});
```

### 2. Leverage React Query Cache

```tsx
// First component - fetches data
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM',
});

// Second component - uses cached data (no API call)
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM', // Same query key = cached
});
```

### 3. Set Appropriate Limits

```tsx
// For dropdowns - reasonable limit
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: {
    fields: 'id,fullName',
    limit: 100, // Most workspaces have < 100 users
  },
});
```

## Testing

### Mock Data

```ts
import { WorkspaceUser } from '@/features/workspace-users/hooks';

const mockUsers: WorkspaceUser[] = [
  {
    id: '1',
    fullName: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
  },
];
```

### Mock Hook

```tsx
jest.mock('@/features/workspace-users/hooks', () => ({
  useGetWorkspaceUsers: jest.fn(() => ({
    data: mockUsers,
    isLoading: false,
    error: null,
  })),
}));
```

## Migration Guide

### From Direct Fetch Calls

**Before** (manual fetch):

```tsx
const response = await fetch(`/api/workspace/${workspaceId}/workspace/get/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});
const result = await response.json();
const users = result.data?.users || [];
```

**After** (using hook):

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM',
});
```

**Benefits**:

- ✅ Automatic authorization headers
- ✅ Token refresh handling
- ✅ Centralized error handling
- ✅ React Query caching
- ✅ Type safety
- ✅ Field selection optimization

## Examples

See `field-input.tsx` for real-world usage in the Create Record form:

```tsx
// apps/web/src/features/active-tables/components/record-form/field-input.tsx

const { data: workspaceUsersData } = useGetWorkspaceUsers(workspaceId, {
  query: 'CREATE_RECORD_FORM', // Minimal fields for dropdown
  reactQueryOptions: {
    enabled: isUserField(field.type), // Conditional fetch
  },
});
```

## API Reference

### `useGetWorkspaceUsers(workspaceId, options?)`

**Parameters**:

- `workspaceId: string` - Current workspace ID
- `options?: UseGetWorkspaceUsersOptions` - Query and React Query options

**Returns**: `UseQueryResult<WorkspaceUser[], Error>`

**Query Key**: `['workspace-users', workspaceId, queries]`

**Default Cache**: 5 minutes

## Troubleshooting

### Users not loading

Check if field is a user reference field:

```tsx
import { FIELD_TYPE_SELECT_ONE_WORKSPACE_USER, FIELD_TYPE_SELECT_LIST_WORKSPACE_USER } from '@workspace/beqeek-shared';

const isUserField = [FIELD_TYPE_SELECT_ONE_WORKSPACE_USER, FIELD_TYPE_SELECT_LIST_WORKSPACE_USER].includes(field.type);
```

### Stale data

Invalidate cache manually:

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId],
});
```

### Missing fields

Verify field selection in query:

```tsx
const { data: users } = useGetWorkspaceUsers(workspaceId, {
  query: {
    fields: 'id,fullName,avatar', // Explicitly list fields needed
  },
});
```

## Related Documentation

- [Active Tables Core](/packages/active-tables-core/README.md)
- [API Documentation](/docs/swagger.yaml)
- [Field Renderer Props](/packages/active-tables-core/src/components/fields/field-renderer-props.ts)
