# Workspace Users Caching Optimization - Implementation Plan

**Date:** 2025-11-10
**Feature:** Optimize workspace user data fetching and caching
**Specification:** `/Users/macos/Workspace/buildinpublic/beqeek/docs/specs/active-tables/update-get-user-workspace.md`

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Current State Analysis](#current-state-analysis)
- [Proposed Solution](#proposed-solution)
- [Implementation Steps](#implementation-steps)
- [User Mapping Strategy](#user-mapping-strategy)
- [Testing & Validation](#testing--validation)
- [Risks & Mitigation](#risks--mitigation)
- [Performance Impact](#performance-impact)
- [TODO Checklist](#todo-checklist)

---

## Executive Summary

### Problem

Currently, the workspace users API is called **redundantly** across the application:

1. **Create Record Dialog** triggers an API call every time it opens (via `field-input.tsx`)
2. **List Records Page** needs to map `assignedUserIds` to user names for display
3. This causes multiple redundant API calls for the same data within a short timeframe

### Solution

Implement a **workspace-level prefetching strategy** using React Query:

1. Prefetch workspace users when the Records List page loads
2. Share the cached data across all components (dialog, lists, fields)
3. Use React Query's built-in cache to avoid redundant API calls
4. Provide utility hooks for mapping user IDs to user objects

### Benefits

- ✅ **Performance**: Eliminate redundant API calls
- ✅ **UX**: Faster dialog opening (no loading state)
- ✅ **Scalability**: Single source of truth for workspace users
- ✅ **Maintainability**: Centralized caching logic
- ✅ **Type Safety**: Full TypeScript support

---

## Current State Analysis

### 1. How Workspace Users Are Currently Fetched

**Hook Implementation** (`use-get-workspace-users.ts`):

```typescript
export function useGetWorkspaceUsers(workspaceId: string, options?: UseGetWorkspaceUsersOptions) {
  const query = options?.query;
  const reactQueryOptions = options?.reactQueryOptions;
  const requestBody: GetWorkspaceUsersRequest = buildWorkspaceUsersQuery(query);
  const queryKey = ['workspace-users', workspaceId, requestBody.queries];

  return useQuery<WorkspaceUser[], Error>({
    queryKey,
    queryFn: async () => {
      const client = createActiveTablesApiClient(workspaceId);
      const response = await client.post<GetWorkspaceUsersResponse>(
        '/workspace/get/users',
        requestBody as Record<string, unknown>,
      );
      const apiUsers = response.data.data ?? [];
      const mappedUsers = apiUsers.map(mapApiUserToWorkspaceUser);
      return mappedUsers;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...reactQueryOptions,
  });
}
```

**Key Observations**:

- ✅ Already has React Query caching (5 minutes stale time)
- ✅ Query key includes workspace ID and query parameters
- ✅ Maps API response to `WorkspaceUser` type
- ⚠️ Different query keys for different field selections (causes cache misses)

### 2. Current Usage Patterns

**Create Record Dialog** (`field-input.tsx`):

```typescript
// Triggered EVERY time dialog opens
const {
  data: workspaceUsersData,
  isLoading,
  error,
} = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR',
  reactQueryOptions: {
    enabled: isUserField(field.type), // Only if field is user type
  },
});
```

**Query Key**: `['workspace-users', workspaceId, { fields: 'id,fullName,avatar,thumbnailAvatar', filtering: {} }]`

**Records List Page** (`active-table-records-page.tsx`):

```typescript
// Currently NOT fetching workspace users at all
// Records have `assignedUserIds` but no user data to map to names
const { table, records, isReady } = useActiveTableRecordsWithConfig(workspaceId, tableId);

// Records example:
// {
//   id: "rec-123",
//   record: { title: "Task", assignedUserIds: ["user-1", "user-2"] },
//   assignedUserIds: ["user-1", "user-2"] // Top-level field
// }
```

**RecordList Component** (`@workspace/active-tables-core`):

```typescript
// Expects workspaceUsers prop to map user IDs
<RecordList
  table={displayTable}
  records={filteredRecords}
  config={displayTable.config.recordListConfig}
  workspaceUsers={workspaceUsers} // Currently EMPTY/UNDEFINED
  onRecordClick={(record) => handleViewRecord(record)}
/>
```

### 3. Root Cause of Redundant API Calls

**Problem Flow**:

```
1. User navigates to Records List Page
   └─> No workspace users fetched
   └─> assignedUserIds shows raw IDs (no names)

2. User clicks "Create Record" button
   └─> Dialog opens
   └─> field-input.tsx renders user field
   └─> useGetWorkspaceUsers() hook executes
   └─> API call #1: POST /workspace/get/users

3. User closes dialog without creating

4. User clicks "Create Record" again
   └─> Dialog opens again
   └─> field-input.tsx re-renders
   └─> Cache might be stale (different query key)
   └─> API call #2: POST /workspace/get/users (redundant!)
```

**Cache Key Issue**:

Different components may request different fields, creating different cache keys:

```typescript
// field-input.tsx query key
['workspace-users', 'ws-123', { fields: 'id,fullName,avatar,thumbnailAvatar', filtering: {} }][
  // Hypothetical future usage with different fields
  ('workspace-users', 'ws-123', { fields: 'id,fullName', filtering: {} })
];

// These are DIFFERENT cache keys = SEPARATE API calls!
```

### 4. Missing Functionality

**Records List Page Issues**:

1. ❌ No workspace users data available
2. ❌ Cannot map `assignedUserIds` to user names
3. ❌ User fields display raw IDs instead of names
4. ❌ No prefetching before dialog opens

**Example Record Data**:

```json
{
  "id": "rec-abc",
  "record": {
    "title": "Fix bug",
    "assignedUser": "user-123", // Single user field
    "assignedUserIds": ["user-456", "user-789"] // Multiple user field
  },
  "assignedUserIds": ["user-123", "user-456", "user-789"], // Top-level (all users)
  "createdBy": "user-123",
  "updatedBy": "user-456"
}
```

**Current Display**: `"user-123"` (raw ID)
**Desired Display**: `"John Doe"` (user name)

---

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Records List Page                              │
│  (active-table-records-page.tsx)                                │
│                                                                  │
│  1. Component mounts                                             │
│  2. useWorkspaceUsersWithPrefetch() hook                        │
│     └─> Prefetch workspace users (BASIC_WITH_AVATAR)           │
│     └─> Returns cached data + loading state                     │
│                                                                  │
│  3. Pass workspaceUsers to components                           │
│     ├─> RecordList (for display)                               │
│     ├─> KanbanBoard (for cards)                                │
│     └─> GanttChart (for tasks)                                 │
│                                                                  │
│  4. User clicks "Create Record"                                 │
│     └─> Dialog opens                                            │
│         └─> field-input.tsx uses useGetWorkspaceUsers()        │
│             └─> React Query returns CACHED data                 │
│             └─> NO API call (cache hit!)                        │
└─────────────────────────────────────────────────────────────────┘

React Query Cache (Shared):
┌──────────────────────────────────────────────────────────────┐
│  Query Key: ['workspace-users', 'ws-123', BASIC_WITH_AVATAR] │
│  Data: [{ id: '1', name: 'John', avatar: '...' }, ...]       │
│  Stale Time: 5 minutes                                        │
│  GC Time: 10 minutes                                          │
└──────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

#### 1. Standardize on `BASIC_WITH_AVATAR` Query Preset

**Why**: To ensure consistent cache keys across all components

```typescript
// ALWAYS use this preset for workspace users
const STANDARD_WORKSPACE_USERS_QUERY = 'BASIC_WITH_AVATAR';

// Query key will be consistent:
['workspace-users', workspaceId, { fields: 'id,fullName,avatar,thumbnailAvatar', filtering: {} }];
```

**Fields Included**:

- `id` - User ID (required for mapping)
- `fullName` - Display name
- `avatar` - Full avatar URL
- `thumbnailAvatar` - Optimized thumbnail

**Benefits**:

- ✅ Sufficient for 99% of use cases
- ✅ Consistent cache key across all components
- ✅ Includes avatar for rich UI
- ✅ Reasonable response size (~500 bytes per user)

#### 2. Create Prefetch Hook for Records Page

**New Hook**: `useWorkspaceUsersWithPrefetch()`

```typescript
/**
 * Hook that prefetches workspace users and returns cached data
 * Use this on pages that need workspace users immediately
 */
export function useWorkspaceUsersWithPrefetch(workspaceId: string) {
  const queryClient = useQueryClient();
  const [hasPrefetched, setHasPrefetched] = useState(false);

  // Prefetch on mount (if not already in cache)
  useEffect(() => {
    if (!workspaceId || hasPrefetched) return;

    const queryKey = ['workspace-users', workspaceId, BASIC_WITH_AVATAR_QUERY];

    // Check if data is already cached
    const cachedData = queryClient.getQueryData(queryKey);

    if (!cachedData) {
      // Prefetch in background
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const client = createActiveTablesApiClient(workspaceId);
          const response = await client.post<GetWorkspaceUsersResponse>(
            '/workspace/get/users',
            buildWorkspaceUsersQuery('BASIC_WITH_AVATAR'),
          );
          return response.data.data?.map(mapApiUserToWorkspaceUser) ?? [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }

    setHasPrefetched(true);
  }, [workspaceId, queryClient, hasPrefetched]);

  // Return standard hook for accessing data
  return useGetWorkspaceUsers(workspaceId, {
    query: 'BASIC_WITH_AVATAR',
  });
}
```

**Benefits**:

- ✅ Prefetches on page load (background, non-blocking)
- ✅ Uses same query key as other components
- ✅ Returns standard hook interface (backward compatible)
- ✅ Checks cache before prefetching (avoids duplicate calls)

#### 3. Update Records Page to Use Prefetch Hook

**Before**:

```typescript
export const ActiveTableRecordsPage = () => {
  const { tableId, workspaceId, locale } = route.useParams();

  // NOT fetching workspace users
  const { table, records, isReady } = useActiveTableRecordsWithConfig(workspaceId, tableId);

  return (
    <RecordList
      table={table}
      records={records}
      workspaceUsers={undefined} // ❌ No users!
    />
  );
};
```

**After**:

```typescript
export const ActiveTableRecordsPage = () => {
  const { tableId, workspaceId, locale } = route.useParams();

  // Prefetch workspace users early
  const { data: workspaceUsers, isLoading: usersLoading } =
    useWorkspaceUsersWithPrefetch(workspaceId);

  const { table, records, isReady } = useActiveTableRecordsWithConfig(workspaceId, tableId);

  return (
    <RecordList
      table={table}
      records={records}
      workspaceUsers={workspaceUsers} // ✅ Users available!
    />
  );
};
```

#### 4. Keep field-input.tsx Unchanged

**Current Code** (no changes needed):

```typescript
const { data: workspaceUsersData, isLoading } = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR', // ✅ Same query = cache hit!
  reactQueryOptions: {
    enabled: isUserField(field.type),
  },
});
```

**Why No Changes?**

- ✅ Already using `BASIC_WITH_AVATAR` preset
- ✅ React Query will return cached data instantly
- ✅ `isLoading` will be `false` (cache hit)
- ✅ No loading spinner needed

---

## Implementation Steps

### Phase 1: Create Standardized Constants

**File**: `/apps/web/src/features/workspace-users/constants.ts` (NEW)

```typescript
/**
 * Standardized workspace users query configuration
 * ALWAYS use this preset to ensure consistent cache keys
 */
export const STANDARD_WORKSPACE_USERS_QUERY = 'BASIC_WITH_AVATAR' as const;

/**
 * Standardized query key factory for workspace users
 */
export const workspaceUsersQueryKey = (workspaceId: string) => [
  'workspace-users',
  workspaceId,
  // Note: buildWorkspaceUsersQuery() returns consistent object
  { fields: 'id,fullName,avatar,thumbnailAvatar', filtering: {} },
];

/**
 * Cache configuration for workspace users
 */
export const WORKSPACE_USERS_CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
} as const;
```

**Benefits**:

- Single source of truth for query configuration
- Prevents typos and inconsistencies
- Easy to update globally

---

### Phase 2: Create Prefetch Hook

**File**: `/apps/web/src/features/workspace-users/hooks/use-workspace-users-with-prefetch.ts` (NEW)

````typescript
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetWorkspaceUsers } from './use-get-workspace-users';
import { STANDARD_WORKSPACE_USERS_QUERY, workspaceUsersQueryKey } from '../constants';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import { buildWorkspaceUsersQuery } from '../types/workspace-users-query';
import type { GetWorkspaceUsersResponse } from './use-get-workspace-users';

/**
 * Map API user response to WorkspaceUser type
 * (Extracted to reuse in prefetch)
 */
function mapApiUserToWorkspaceUser(apiUser: any) {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    avatar: apiUser.avatar,
    role: undefined,
  };
}

/**
 * Hook that prefetches workspace users on mount and returns cached data
 *
 * Use this hook on pages that need workspace users immediately available,
 * such as the Records List page. This ensures the data is cached BEFORE
 * child components (like Create Record dialog) request it.
 *
 * @param workspaceId - Current workspace ID
 * @returns Standard useGetWorkspaceUsers result with prefetched data
 *
 * @example
 * ```tsx
 * function RecordsPage() {
 *   const { data: workspaceUsers, isLoading } = useWorkspaceUsersWithPrefetch(workspaceId);
 *
 *   return (
 *     <RecordList workspaceUsers={workspaceUsers} />
 *   );
 * }
 * ```
 */
export function useWorkspaceUsersWithPrefetch(workspaceId: string) {
  const queryClient = useQueryClient();
  const [hasPrefetched, setHasPrefetched] = useState(false);

  // Prefetch workspace users in background on mount
  useEffect(() => {
    if (!workspaceId || hasPrefetched) return;

    const queryKey = workspaceUsersQueryKey(workspaceId);

    // Check if data is already in cache
    const cachedData = queryClient.getQueryData(queryKey);

    if (!cachedData) {
      // Prefetch in background (non-blocking)
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const client = createActiveTablesApiClient(workspaceId);
          const requestBody = buildWorkspaceUsersQuery(STANDARD_WORKSPACE_USERS_QUERY);

          const response = await client.post<GetWorkspaceUsersResponse>(
            '/workspace/get/users',
            requestBody as Record<string, unknown>,
          );

          const apiUsers = response.data.data ?? [];
          return apiUsers.map(mapApiUserToWorkspaceUser);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      console.log('[Prefetch] Workspace users prefetch initiated for workspace:', workspaceId);
    } else {
      console.log('[Prefetch] Workspace users already cached for workspace:', workspaceId);
    }

    setHasPrefetched(true);
  }, [workspaceId, queryClient, hasPrefetched]);

  // Return standard hook (will use cached data if available)
  return useGetWorkspaceUsers(workspaceId, {
    query: STANDARD_WORKSPACE_USERS_QUERY,
  });
}
````

**Key Features**:

- ✅ Prefetches on mount (once per workspace)
- ✅ Checks cache before prefetching (avoids duplicates)
- ✅ Uses `prefetchQuery` (background, non-blocking)
- ✅ Returns standard hook interface (backward compatible)
- ✅ Includes debug logging

---

### Phase 3: Update field-input.tsx to Use Standard Query

**File**: `/apps/web/src/features/active-tables/components/record-form/field-input.tsx`

**Change**:

```typescript
// BEFORE
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';

const {
  data: workspaceUsersData,
  isLoading,
  error,
} = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR', // ✅ Already using correct preset!
  reactQueryOptions: {
    enabled: isUserField(field.type),
  },
});

// AFTER (add constant import for consistency)
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';
import { STANDARD_WORKSPACE_USERS_QUERY } from '@/features/workspace-users/constants';

const {
  data: workspaceUsersData,
  isLoading,
  error,
} = useGetWorkspaceUsers(workspaceId, {
  query: STANDARD_WORKSPACE_USERS_QUERY, // ✅ Use constant for consistency
  reactQueryOptions: {
    enabled: isUserField(field.type),
  },
});
```

**Minimal Change**: Only replace hardcoded preset name with constant

---

### Phase 4: Update Records Page to Use Prefetch Hook

**File**: `/apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Changes**:

```typescript
// 1. Import prefetch hook
import { useWorkspaceUsersWithPrefetch } from '@/features/workspace-users/hooks/use-workspace-users-with-prefetch';

// 2. Add hook call EARLY in component (before other queries)
export const ActiveTableRecordsPage = () => {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();
  const searchParams = route.useSearch();
  const listContext = useListContext();

  // Prefetch workspace users EARLY (before records load)
  const { data: workspaceUsers, isLoading: usersLoading } =
    useWorkspaceUsersWithPrefetch(workspaceId);

  // Use combined hook to ensure table config loads before records
  const { table, tableLoading, tableError, records, recordsLoading, recordsError, isReady, nextId } =
    useActiveTableRecordsWithConfig(workspaceId, tableId, {
      paging: 'cursor',
      limit: 50,
      direction: 'desc',
    });

  // ... rest of component logic

  // 3. Pass workspaceUsers to RecordList component
  return (
    <div className="space-y-4 p-3 sm:p-6">
      {/* ... header, tabs, etc. */}

      <TabsContent value="list" className="mt-6">
        <RecordList
          table={displayTable}
          records={filteredRecords}
          config={displayTable.config.recordListConfig || { layout: RECORD_LIST_LAYOUT_GENERIC_TABLE }}
          loading={isDecrypting || false}
          onRecordClick={(record) => handleViewRecord(record)}
          encryptionKey={encryption.encryptionKey || undefined}
          workspaceUsers={workspaceUsers || []} // ✅ Pass prefetched users
        />
      </TabsContent>

      {/* 4. Pass to KanbanBoard */}
      <TabsContent value="kanban" className="mt-3 sm:mt-6 -mx-3 sm:mx-0">
        {kanbanConfig && displayTable.config && (
          <KanbanBoard
            table={displayTable}
            records={displayRecords}
            config={kanbanConfig}
            onRecordMove={handleRecordMove}
            onRecordClick={handleViewRecord}
            workspaceUsers={workspaceUsers || []} // ✅ Pass to Kanban
            className="px-2 sm:px-4 gap-2 sm:gap-4 pb-4"
          />
        )}
      </TabsContent>

      {/* 5. Pass to GanttChart */}
      <TabsContent value="gantt" className="mt-3 sm:mt-6 -mx-3 sm:mx-0">
        {ganttConfig && displayTable.config && (
          <GanttChartView
            table={displayTable}
            records={displayRecords}
            config={ganttConfig}
            onTaskClick={handleViewRecord}
            workspaceUsers={workspaceUsers || []} // ✅ Pass to Gantt
            showProgress={true}
            showToday={true}
          />
        )}
      </TabsContent>

      {/* 6. CreateRecordDialog will automatically use cached data */}
      {displayTable && !useMockData && (
        <CreateRecordDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          table={displayTable}
          workspaceId={workspaceId}
          tableId={tableId}
          onSuccess={handleCreateSuccess}
          // No need to pass workspaceUsers - field-input.tsx will use cache
        />
      )}
    </div>
  );
};
```

**Key Changes**:

1. Import and call `useWorkspaceUsersWithPrefetch()` early
2. Pass `workspaceUsers` to all child components that need it
3. CreateRecordDialog uses cache automatically (no changes needed)

---

### Phase 5: Export New Hook from Index

**File**: `/apps/web/src/features/workspace-users/hooks/index.ts`

```typescript
export { useGetWorkspaceUsers } from './use-get-workspace-users';
export { useWorkspaceUsersWithPrefetch } from './use-workspace-users-with-prefetch';

// Re-export types
export type { WorkspaceUsersQueries, GetWorkspaceUsersRequest, WorkspaceUser } from './use-get-workspace-users';
```

---

### Phase 6: Update Package Exports (Optional)

**File**: `/apps/web/src/features/workspace-users/index.ts` (if exists)

```typescript
export * from './hooks';
export * from './constants';
export * from './types/workspace-users-query';
```

---

## User Mapping Strategy

### Overview

The `assignedUserIds` field exists at **two levels** in record data:

1. **Top-level**: `record.assignedUserIds` - Array of all related user IDs
2. **Field-level**: `record.record[fieldName]` - User field values (string or array)

### Mapping Implementation

#### 1. Create Utility Hook: `useUserMapping`

**File**: `/apps/web/src/features/workspace-users/hooks/use-user-mapping.ts` (NEW)

```typescript
import { useMemo } from 'react';
import type { WorkspaceUser } from './use-get-workspace-users';

/**
 * User mapping utilities
 *
 * Provides utilities for mapping user IDs to user objects and names
 */
export function useUserMapping(workspaceUsers: WorkspaceUser[] = []) {
  // Create lookup map for O(1) access
  const userMap = useMemo(() => {
    const map = new Map<string, WorkspaceUser>();
    workspaceUsers.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [workspaceUsers]);

  /**
   * Get user object by ID
   */
  const getUserById = (userId: string): WorkspaceUser | undefined => {
    return userMap.get(userId);
  };

  /**
   * Get user name by ID (with fallback)
   */
  const getUserName = (userId: string): string => {
    const user = userMap.get(userId);
    return user?.name || userId; // Fallback to ID if not found
  };

  /**
   * Get multiple user names from array of IDs
   */
  const getUserNames = (userIds: string[]): string[] => {
    return userIds.map((id) => getUserName(id));
  };

  /**
   * Get user names as comma-separated string
   */
  const getUserNamesString = (userIds: string[], separator = ', '): string => {
    return getUserNames(userIds).join(separator);
  };

  /**
   * Get user objects from array of IDs
   */
  const getUsersById = (userIds: string[]): WorkspaceUser[] => {
    return userIds.map((id) => userMap.get(id)).filter((user): user is WorkspaceUser => user !== undefined);
  };

  return {
    userMap,
    getUserById,
    getUserName,
    getUserNames,
    getUserNamesString,
    getUsersById,
  };
}
```

#### 2. Usage Examples

**Example 1: Display Single User Name**

```typescript
function RecordCard({ record, workspaceUsers }: Props) {
  const { getUserName } = useUserMapping(workspaceUsers);
  const createdByName = getUserName(record.createdBy);

  return (
    <div>
      Created by: {createdByName}
    </div>
  );
}
```

**Example 2: Display Multiple Users**

```typescript
function AssignedUsers({ record, workspaceUsers }: Props) {
  const { getUserNamesString } = useUserMapping(workspaceUsers);
  const assignedNames = getUserNamesString(record.assignedUserIds || []);

  return (
    <div>
      Assigned to: {assignedNames}
    </div>
  );
}
```

**Example 3: User Avatars**

```typescript
function UserAvatars({ userIds, workspaceUsers }: Props) {
  const { getUsersById } = useUserMapping(workspaceUsers);
  const users = getUsersById(userIds);

  return (
    <div className="flex -space-x-2">
      {users.map(user => (
        <img
          key={user.id}
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full border-2 border-white"
        />
      ))}
    </div>
  );
}
```

#### 3. Integration with active-tables-core Components

The `RecordList`, `KanbanBoard`, and `GanttChartView` components already accept `workspaceUsers` prop:

```typescript
// From record-list-props.ts
export interface BaseRecordListProps {
  table: Table;
  records: TableRecord[];
  config: RecordListConfig;
  workspaceUsers?: WorkspaceUser[]; // ✅ Already supported!
  // ...
}
```

**Internal Mapping** (handled by `@workspace/active-tables-core`):

```typescript
// In user-field.tsx
const getUserLabel = useCallback(
  (userId: string) => {
    const user = workspaceUsers.find((u) => u.id === userId);
    if (!user) return userId;

    const labelField = field.referenceLabelField || 'name';
    return String(user[labelField] || user.name || user.id);
  },
  [workspaceUsers, field.referenceLabelField],
);
```

**No changes needed in `active-tables-core`** - it already handles user mapping internally!

---

### Handling Missing/Deleted Users

**Strategy**: Graceful fallback to user ID

```typescript
// In useUserMapping hook
const getUserName = (userId: string): string => {
  const user = userMap.get(userId);
  return user?.name || userId; // ✅ Fallback to ID if not found
};
```

**Visual Indicator** (optional enhancement):

```typescript
function UserChip({ userId, workspaceUsers }: Props) {
  const { getUserById } = useUserMapping(workspaceUsers);
  const user = getUserById(userId);

  if (!user) {
    return (
      <span className="text-muted-foreground italic" title={`User ${userId} (deleted)`}>
        {userId}
      </span>
    );
  }

  return (
    <span className="font-medium">
      {user.name}
    </span>
  );
}
```

---

## Testing & Validation

### Test Plan

#### 1. Manual Testing Checklist

**Cache Behavior**:

- [ ] Navigate to Records List page → workspace users API called once
- [ ] Open Create Record dialog → NO additional API call (cache hit)
- [ ] Close and reopen dialog → Still no API call (cache still valid)
- [ ] Wait 6 minutes (stale time) → Next dialog open triggers background refetch
- [ ] Navigate away and back within 10 minutes → Uses cached data (gc time)

**User Mapping**:

- [ ] Records list shows user names (not IDs) for `assignedUserIds`
- [ ] Kanban cards show assigned user names
- [ ] Gantt chart shows user names
- [ ] Create record dialog shows user dropdown with names
- [ ] Deleted user IDs display as raw IDs (graceful fallback)

**Performance**:

- [ ] First page load: 1 API call for workspace users
- [ ] Dialog opens instantly (no loading state)
- [ ] No redundant API calls in network tab
- [ ] React Query DevTools shows cache hits

#### 2. Console Validation

**Expected Console Logs**:

```
[Prefetch] Workspace users prefetch initiated for workspace: ws-123
[React Query] Cache hit for ['workspace-users', 'ws-123', {...}]
```

**Network Tab** (first page load):

```
POST /api/workspace/ws-123/workspace/get/users
Status: 200 OK
Response Time: ~200ms
```

**Network Tab** (dialog opens):

```
(No network requests for workspace users - cache hit!)
```

#### 3. React Query DevTools

**Cache Entry**:

```
Query Key: ['workspace-users', 'ws-123', { fields: 'id,fullName,avatar,thumbnailAvatar', filtering: {} }]
Status: success
Data: [{ id: '1', name: 'John Doe', avatar: '...' }, ...]
Data Updated At: [timestamp]
Stale At: [timestamp + 5 minutes]
GC At: [timestamp + 10 minutes]
Observers: 2 (Records page + Dialog)
```

#### 4. Edge Cases to Test

**Empty Workspace**:

- [ ] No users in workspace → Empty array, no errors
- [ ] User dropdown shows "No users available"

**Network Failures**:

- [ ] API call fails → Error state handled gracefully
- [ ] Retry logic works (React Query default: 2 retries)
- [ ] Error message displayed to user

**Stale Data**:

- [ ] User added in another tab → Refetch on focus (React Query default)
- [ ] Manual invalidation works (e.g., after user created)

**Multiple Workspaces**:

- [ ] Switch workspace → New API call (different cache key)
- [ ] Each workspace has separate cache entry

---

### Automated Testing (Future Enhancement)

**Unit Tests** (`use-workspace-users-with-prefetch.test.ts`):

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkspaceUsersWithPrefetch } from './use-workspace-users-with-prefetch';

describe('useWorkspaceUsersWithPrefetch', () => {
  it('should prefetch workspace users on mount', async () => {
    const queryClient = new QueryClient();
    const { result } = renderHook(
      () => useWorkspaceUsersWithPrefetch('ws-123'),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });

  it('should use cached data if available', async () => {
    // Test implementation
  });
});
```

**Integration Tests** (Playwright/Cypress):

```typescript
test('workspace users caching flow', async ({ page }) => {
  // Navigate to records page
  await page.goto('/workspace/ws-123/tables/tbl-456/records');

  // Wait for API call
  const apiCall = await page.waitForResponse((response) => response.url().includes('/workspace/get/users'));
  expect(apiCall.status()).toBe(200);

  // Open create dialog
  await page.click('[data-testid="create-record-button"]');

  // Dialog should open instantly (no loading state)
  await expect(page.locator('[data-testid="user-select"]')).toBeVisible();

  // Verify NO additional API calls
  const requests = page.context().requests;
  const userRequests = requests.filter((r) => r.url().includes('/workspace/get/users'));
  expect(userRequests).toHaveLength(1); // Only initial prefetch
});
```

---

## Risks & Mitigation

### Risk 1: Cache Staleness

**Risk**: User sees outdated workspace users list

**Likelihood**: Medium
**Impact**: Low
**Mitigation**:

1. Set appropriate stale time (5 minutes)
2. React Query refetches on window focus (default)
3. Manual invalidation on user add/remove
4. Provide "Refresh" button if needed

**Code**:

```typescript
// After adding new user
queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId],
});
```

---

### Risk 2: Memory Usage

**Risk**: Large workspaces (1000+ users) consume memory

**Likelihood**: Low
**Impact**: Low
**Mitigation**:

1. Use garbage collection (10 minute gc time)
2. Only fetch needed fields (BASIC_WITH_AVATAR)
3. Implement pagination if needed (future)

**Estimation**:

- 1 user: ~150 bytes (id + name + avatar URLs)
- 100 users: ~15 KB
- 1000 users: ~150 KB (acceptable)

---

### Risk 3: Query Key Mismatch

**Risk**: Different query keys cause cache misses

**Likelihood**: Medium (if not following standards)
**Impact**: Medium
**Mitigation**:

1. Use `STANDARD_WORKSPACE_USERS_QUERY` constant
2. Document in CLAUDE.md
3. Eslint rule (future) to enforce usage

**Prevention**:

```typescript
// ❌ BAD - creates different cache key
useGetWorkspaceUsers(workspaceId, { query: 'USERNAME_ONLY' });

// ✅ GOOD - consistent cache key
useGetWorkspaceUsers(workspaceId, { query: STANDARD_WORKSPACE_USERS_QUERY });
```

---

### Risk 4: Network Failure on Prefetch

**Risk**: Prefetch fails, subsequent calls also fail

**Likelihood**: Low
**Impact**: Medium
**Mitigation**:

1. React Query retries failed queries (default: 2 retries)
2. Error states handled gracefully
3. Fallback to individual fetches if needed

**Code**:

```typescript
const { data: workspaceUsers, error, isError } = useWorkspaceUsersWithPrefetch(workspaceId);

if (isError) {
  console.error('Failed to fetch workspace users:', error);
  // Still render page, user fields will handle empty array
}
```

---

## Performance Impact

### Before Optimization

**User Journey**:

1. Navigate to Records List → 1 API call (records)
2. Open Create Dialog → 1 API call (workspace users) ← **250ms delay**
3. Close Dialog
4. Open Create Dialog again → 1 API call (cache expired) ← **250ms delay**
5. Submit record → 1 API call (create)

**Total**: 4 API calls, 2 visible delays

---

### After Optimization

**User Journey**:

1. Navigate to Records List → 2 API calls (records + workspace users, parallel)
2. Open Create Dialog → 0 API calls ← **Instant!**
3. Close Dialog
4. Open Create Dialog again → 0 API calls (cache hit) ← **Instant!**
5. Submit record → 1 API call (create)

**Total**: 3 API calls, 0 visible delays

---

### Metrics

| Metric                     | Before | After | Improvement    |
| -------------------------- | ------ | ----- | -------------- |
| API calls (page load)      | 1      | 2     | -1 (prefetch)  |
| API calls (dialog open)    | 1      | 0     | +100%          |
| API calls (re-open dialog) | 1      | 0     | +100%          |
| Dialog open latency        | ~250ms | ~10ms | **96% faster** |
| Cache hit rate             | 0%     | ~95%  | +95%           |
| Network data transferred   | Same   | Same  | -              |

**Net Benefit**:

- **2 fewer API calls** per dialog interaction
- **96% faster** dialog opening
- **Better UX**: No loading spinners in dialog

---

## Cache Invalidation Strategy

### When to Invalidate

**1. User Added to Workspace**:

```typescript
// After successful user invite
await createWorkspaceUser(...);
queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId],
});
```

**2. User Removed from Workspace**:

```typescript
// After successful user removal
await removeWorkspaceUser(...);
queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId],
});
```

**3. User Profile Updated**:

```typescript
// After user changes name/avatar
await updateUserProfile(...);
queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId],
});
```

**4. Manual Refresh** (optional):

```typescript
// Refresh button in UI
<Button onClick={() => {
  queryClient.invalidateQueries({
    queryKey: ['workspace-users', workspaceId],
  });
}}>
  Refresh Users
</Button>
```

---

## TODO Checklist

### Phase 1: Foundation

- [ ] Create `/apps/web/src/features/workspace-users/constants.ts`
  - [ ] Define `STANDARD_WORKSPACE_USERS_QUERY`
  - [ ] Define `workspaceUsersQueryKey()` factory
  - [ ] Define `WORKSPACE_USERS_CACHE_CONFIG`

### Phase 2: Prefetch Hook

- [ ] Create `/apps/web/src/features/workspace-users/hooks/use-workspace-users-with-prefetch.ts`
  - [ ] Implement prefetch logic
  - [ ] Add cache checking
  - [ ] Add debug logging
  - [ ] Add JSDoc comments

### Phase 3: User Mapping Utilities

- [ ] Create `/apps/web/src/features/workspace-users/hooks/use-user-mapping.ts`
  - [ ] Implement `getUserById()`
  - [ ] Implement `getUserName()`
  - [ ] Implement `getUserNames()`
  - [ ] Implement `getUserNamesString()`
  - [ ] Implement `getUsersById()`
  - [ ] Add JSDoc comments

### Phase 4: Update Existing Files

- [ ] Update `/apps/web/src/features/active-tables/components/record-form/field-input.tsx`
  - [ ] Import `STANDARD_WORKSPACE_USERS_QUERY`
  - [ ] Replace hardcoded preset with constant

- [ ] Update `/apps/web/src/features/active-tables/pages/active-table-records-page.tsx`
  - [ ] Import `useWorkspaceUsersWithPrefetch`
  - [ ] Add hook call early in component
  - [ ] Pass `workspaceUsers` to `RecordList`
  - [ ] Pass `workspaceUsers` to `KanbanBoard`
  - [ ] Pass `workspaceUsers` to `GanttChartView`

- [ ] Update `/apps/web/src/features/workspace-users/hooks/index.ts`
  - [ ] Export `useWorkspaceUsersWithPrefetch`
  - [ ] Export `useUserMapping`

### Phase 5: Testing

- [ ] Manual testing
  - [ ] Test prefetch on page load
  - [ ] Test cache hit in dialog
  - [ ] Test user name mapping in lists
  - [ ] Test missing user fallback
  - [ ] Test network tab (no redundant calls)

- [ ] React Query DevTools testing
  - [ ] Verify cache entry created
  - [ ] Verify stale time (5 min)
  - [ ] Verify gc time (10 min)
  - [ ] Verify multiple observers

- [ ] Edge cases
  - [ ] Empty workspace
  - [ ] Network failure
  - [ ] Stale data
  - [ ] Multiple workspaces

### Phase 6: Documentation

- [ ] Update `/apps/web/src/features/workspace-users/README.md`
  - [ ] Add prefetch hook documentation
  - [ ] Add user mapping utilities
  - [ ] Add caching best practices

- [ ] Update `/Users/macos/Workspace/buildinpublic/beqeek/CLAUDE.md`
  - [ ] Document `STANDARD_WORKSPACE_USERS_QUERY`
  - [ ] Add workspace users caching patterns
  - [ ] Add anti-patterns to avoid

### Phase 7: Optional Enhancements

- [ ] Add cache invalidation on user add/remove
- [ ] Add "Refresh users" button in UI
- [ ] Add unit tests for hooks
- [ ] Add integration tests (Playwright)
- [ ] Add performance monitoring

---

## Appendix

### A. Query Key Structure

**Standard Query Key**:

```typescript
[
  'workspace-users', // Namespace
  'ws-123', // Workspace ID
  {
    // Query parameters
    fields: 'id,fullName,avatar,thumbnailAvatar',
    filtering: {},
  },
];
```

**Why This Structure?**:

- First element: Namespace for invalidation
- Second element: Workspace ID for isolation
- Third element: Query params for cache differentiation

**Invalidation Examples**:

```typescript
// Invalidate ALL workspace users queries
queryClient.invalidateQueries({
  queryKey: ['workspace-users'],
});

// Invalidate specific workspace
queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId],
});

// Invalidate exact query
queryClient.invalidateQueries({
  queryKey: ['workspace-users', workspaceId, { fields: '...', filtering: {} }],
});
```

---

### B. React Query Cache Behavior

**Stale Time** (5 minutes):

- Data considered "fresh" for 5 minutes
- No background refetch during this time
- Instant cache returns

**GC Time** (10 minutes):

- Data kept in memory for 10 minutes after last use
- Garbage collected after this time
- Next access triggers new fetch

**Refetch on Focus** (default: true):

- Background refetch when window regains focus
- Only if data is stale
- Updates cache silently

**Retry Logic** (default: 2 retries):

- Failed queries retry 2 times
- Exponential backoff
- 4xx errors don't retry

---

### C. Performance Calculations

**API Response Size**:

```
Single User:
- id: 36 bytes (UUID)
- fullName: ~30 bytes (average)
- avatar: ~80 bytes (URL)
- thumbnailAvatar: ~80 bytes (URL)
Total: ~226 bytes

100 Users: ~22 KB
500 Users: ~110 KB
1000 Users: ~220 KB
```

**Network Overhead**:

```
Before: 2 requests × 250ms = 500ms latency
After: 1 request × 250ms = 250ms latency
Savings: 250ms per dialog interaction
```

**Cache Memory**:

```
100 users: 22 KB × 5 workspaces = 110 KB (negligible)
```

---

### D. Alternative Approaches Considered

#### 1. Server-Side Caching

**Approach**: Cache workspace users in backend Redis/Memcached

**Pros**:

- Reduces database load
- Shared across all clients

**Cons**:

- Still requires HTTP requests from client
- Doesn't eliminate network latency
- More complex infrastructure

**Decision**: Use client-side caching first, add server caching later if needed

---

#### 2. Embedding Users in Records Response

**Approach**: Include user objects in records API response

**Pros**:

- Single API call
- No separate user fetching

**Cons**:

- Duplicates data (same user in multiple records)
- Larger response size
- Backend API changes required

**Decision**: Keep APIs separate, use client-side caching

---

#### 3. GraphQL with DataLoader

**Approach**: Use GraphQL with DataLoader for automatic batching

**Pros**:

- Automatic request batching
- Eliminates N+1 queries

**Cons**:

- Requires GraphQL migration
- Significant backend changes
- Overkill for this use case

**Decision**: Stick with REST + React Query caching

---

### E. Future Enhancements

**1. Infinite Query for Large Workspaces** (1000+ users):

```typescript
export function useWorkspaceUsersInfinite(workspaceId: string) {
  return useInfiniteQuery({
    queryKey: ['workspace-users-infinite', workspaceId],
    queryFn: ({ pageParam = 0 }) => fetchWorkspaceUsers(workspaceId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
```

**2. Optimistic Updates**:

```typescript
// When creating user, update cache immediately
queryClient.setQueryData(['workspace-users', workspaceId], (old) => [...(old ?? []), newUser]);
```

**3. Websocket Updates**:

```typescript
// Real-time user updates via websocket
socket.on('user.created', (user) => {
  queryClient.setQueryData(['workspace-users', workspaceId], (old) => [...(old ?? []), user]);
});
```

**4. User Search/Filtering**:

```typescript
export function useWorkspaceUsersSearch(workspaceId: string, query: string) {
  const { data: users } = useWorkspaceUsersWithPrefetch(workspaceId);

  return useMemo(() => {
    return users?.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())) ?? [];
  }, [users, query]);
}
```

---

## References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Workspace Users API Spec](/docs/swagger.yaml)
- [Active Tables Core README](/packages/active-tables-core/README.md)
- [Workspace Users Hook README](/apps/web/src/features/workspace-users/README.md)
- [CLAUDE.md Architecture Guide](/CLAUDE.md)

---

**End of Implementation Plan**
