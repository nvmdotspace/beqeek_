# User Select Dropdown Debugging Guide

## Problem: Dropdown Shows No Options Even Though API Returns Data

This guide helps debug the user select dropdown when the API returns 3 users but nothing appears in the dropdown.

---

## Debug Logging Added

Comprehensive console logging has been added at every step of the data flow to help identify where the data is being lost.

### 🔍 Where to Look

Open **Browser Console** (F12) and look for these log groups:

1. **`[useGetWorkspaceUsers]`** - API layer
2. **`[field-input.tsx]`** - Data fetching layer
3. **`[user-field.tsx]`** - Mapping layer
4. **`[UserSelect]`** - Component layer

---

## Data Flow with Logging Points

```
┌─────────────────────────────────────────────────────────┐
│ 1. API Call                                             │
│    [useGetWorkspaceUsers] Making API request            │
│    → Check: workspaceId, requestBody                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. API Response                                         │
│    [useGetWorkspaceUsers] API response                  │
│    → Check: response.data structure                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. API Users (Before Mapping)                           │
│    [useGetWorkspaceUsers] API users (before mapping)    │
│    → Check: Array of users with fullName, email         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Mapped Users                                         │
│    [useGetWorkspaceUsers] Mapped users                  │
│    → Check: Array of users with name (not fullName)     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Field Input Receipt                                  │
│    [field-input.tsx] useGetWorkspaceUsers result        │
│    → Check: workspaceUsersData array, count             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6. User Field Mapping                                   │
│    [user-field.tsx] Raw workspaceUsers                  │
│    [user-field.tsx] Mapping user (for each user)        │
│    → Check: Each user object structure                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Final Mapped Users                                   │
│    [user-field.tsx] Final mappedUsers                   │
│    → Check: Array with id, name, email, avatar, status  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 8. UserSelect Component Props                           │
│    [UserSelect] Component rendered with props           │
│    → Check: users array, usersCount                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 9. Filtered Users                                       │
│    [UserSelect] Filtering users                         │
│    → Check: filteredCount should match usersCount       │
└─────────────────────────────────────────────────────────┘
```

---

## Common Issues and Solutions

### Issue 1: API Not Being Called

**Symptoms**:

- No `[useGetWorkspaceUsers] Making API request` log

**Possible Causes**:

1. Field type is not a user field
2. React Query `enabled` is false
3. Component not mounted

**Check**:

```javascript
// Look for this log:
[field-input.tsx] useGetWorkspaceUsers result: {
  isUserField: false  // ❌ Should be true!
}
```

**Solution**:

- Verify field type is `SELECT_ONE_WORKSPACE_USER` or `SELECT_LIST_WORKSPACE_USER`
- Check `isUserField()` function logic

---

### Issue 2: API Returns Empty Array

**Symptoms**:

- `[useGetWorkspaceUsers] API users (before mapping): []`

**Possible Causes**:

1. No users in workspace
2. Wrong workspace ID
3. API filtering too restrictive

**Check**:

```javascript
// Look for this log:
[useGetWorkspaceUsers] Making API request: {
  workspaceId: "xxx",  // ✅ Verify this is correct
  requestBody: {
    queries: {
      fields: "id,fullName",
      filtering: {},
      limit: 100
    }
  }
}
```

**Solution**:

- Verify workspace has users
- Check API response in Network tab
- Test API directly with curl

---

### Issue 3: Mapping Fails (fullName → name)

**Symptoms**:

- `[useGetWorkspaceUsers] API users (before mapping)` shows users
- `[useGetWorkspaceUsers] Mapped users` shows users with empty `name` field

**Possible Causes**:

1. API returns `fullName` but mapping expects different field
2. Mapping function broken

**Check**:

```javascript
// API users should have fullName:
[useGetWorkspaceUsers] API users (before mapping): [
  { id: "123", fullName: "John Doe", email: "john@example.com" }
]

// Mapped users should have name:
[useGetWorkspaceUsers] Mapped users: [
  { id: "123", name: "John Doe", email: "john@example.com" }  // ✅
]
```

**Solution**:

- Check `mapApiUserToWorkspaceUser()` function
- Verify API response structure

---

### Issue 4: Data Lost Between Hook and Component

**Symptoms**:

- `[field-input.tsx] workspaceUsersData` shows 3 users
- `[user-field.tsx] Raw workspaceUsers` shows 0 users or undefined

**Possible Causes**:

1. Props not passed correctly to FieldRenderer
2. Component rendering before data loads
3. React Query cache issue

**Check**:

```javascript
// field-input.tsx should show data:
[field-input.tsx] useGetWorkspaceUsers result: {
  workspaceUsersData: [{ id: "123", name: "John Doe", ... }],
  usersCount: 3  // ✅
}

// user-field.tsx should receive same data:
[user-field.tsx] Raw workspaceUsers: [{ id: "123", name: "John Doe", ... }]
[user-field.tsx] workspaceUsers count: 3  // ✅
```

**Solution**:

- Check if `workspaceUsers` prop is passed to FieldRenderer
- Verify FieldRenderer passes it to UserField

---

### Issue 5: Empty `name` After Re-Mapping in user-field.tsx

**Symptoms**:

- `[user-field.tsx] Raw workspaceUsers` shows users with `name` field
- `[user-field.tsx] Mapped to` shows empty `name`

**Possible Causes**:

1. Mapping tries to use `user.fullName` which doesn't exist anymore
2. Incorrect field access

**Check**:

```javascript
// Before mapping:
[user-field.tsx] Mapping user: { id: "123", name: "John Doe", email: "..." }

// After mapping:
[user-field.tsx] Mapped to: { id: "123", name: "", email: "..." }  // ❌ Empty!
```

**Solution**:

- Verify line 113 in user-field.tsx uses `user.name` (not `user.fullName`)
- Current code should be: `name: user.name || ''`

---

### Issue 6: UserSelect Receives Empty Users Array

**Symptoms**:

- `[user-field.tsx] Final mappedUsers` shows 3 users
- `[UserSelect] Component rendered with props` shows `usersCount: 0`

**Possible Causes**:

1. Props not passed correctly
2. Component unmounted/remounted
3. State initialization issue

**Check**:

```javascript
// user-field.tsx should pass users:
[user-field.tsx] Final mappedUsers: [
  { id: "123", name: "John Doe", ... },
  { id: "456", name: "Jane Smith", ... },
  { id: "789", name: "Bob Johnson", ... }
]
[user-field.tsx] mappedUsers count: 3

// UserSelect should receive them:
[UserSelect] Component rendered with props: {
  usersCount: 3,  // ✅ Should match!
  users: [...]
}
```

**Solution**:

- Check line 127 in user-field.tsx passes `users={mappedUsers}`
- Verify UserSelect props destructuring

---

### Issue 7: Filtering Removes All Users

**Symptoms**:

- `[UserSelect] Filtering users` shows `totalUsers: 3`
- `[UserSelect] Filtered results` shows `filteredCount: 0`

**Possible Causes**:

1. User objects missing `name` or `email` fields
2. Search query not empty by default
3. Filter logic broken

**Check**:

```javascript
// Should not filter when no search query:
[UserSelect] Filtering users: {
  totalUsers: 3,
  searchQuery: "",  // ✅ Empty
  hasQuery: false   // ✅ False
}

// Should return all users:
[UserSelect] No search query, returning all users: [
  { id: "123", name: "John Doe", ... },
  { id: "456", name: "Jane Smith", ... },
  { id: "789", name: "Bob Johnson", ... }
]
```

**Solution**:

- Verify `searchQuery` is empty on initial render
- Check filter logic in `filteredUsers` useMemo
- Ensure users have `name` and `email` fields

---

## Step-by-Step Debugging Process

### Step 1: Open Browser Console

1. Open your app in Chrome/Firefox
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Clear console (🚫 icon)

### Step 2: Open Create Record Dialog

1. Navigate to a table with user fields
2. Click "Create Record" button
3. Wait for form to load

### Step 3: Analyze Console Logs

Look for the log sequence in order:

```
✅ Expected Log Sequence:
├─ [useGetWorkspaceUsers] Making API request
├─ [useGetWorkspaceUsers] API response
├─ [useGetWorkspaceUsers] API users (before mapping)
├─ [useGetWorkspaceUsers] Mapped users
├─ [field-input.tsx] useGetWorkspaceUsers result
├─ [user-field.tsx] Raw workspaceUsers
├─ [user-field.tsx] Mapping user (x3 times)
├─ [user-field.tsx] Mapped to (x3 times)
├─ [user-field.tsx] Final mappedUsers
├─ [UserSelect] Component rendered with props
└─ [UserSelect] Filtering users
```

### Step 4: Identify Where Data Is Lost

Compare user counts at each step:

```javascript
API response:        3 users ✅
Mapped users:        3 users ✅
field-input:         3 users ✅
user-field raw:      3 users ✅
user-field mapped:   3 users ✅
UserSelect props:    0 users ❌ <- Data lost here!
```

### Step 5: Inspect User Objects

Expand the logged arrays and check structure:

```javascript
// ✅ Good user object:
{
  id: "123",
  name: "John Doe",      // ✅ Has name
  email: "john@...",     // ✅ Has email
  avatar: "...",
  status: "active"
}

// ❌ Bad user object:
{
  id: "123",
  name: "",              // ❌ Empty name
  email: "",             // ❌ Empty email
  avatar: "",
  status: "active"
}
```

---

## Quick Diagnostics

Run these checks in console:

```javascript
// 1. Check if field is user type
field.type === 'SELECT_ONE_WORKSPACE_USER' || field.type === 'SELECT_LIST_WORKSPACE_USER';

// 2. Check React Query cache
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__.cache;

// 3. Check if component mounted
document.querySelector('[data-field-name="assignee"]');

// 4. Force re-fetch
queryClient.invalidateQueries(['workspace-users']);
```

---

## Expected API Response Format

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "732878539089166353",
        "fullName": "John Doe",
        "email": "john@example.com",
        "avatar": "https://...",
        "thumbnailAvatar": "https://..."
      },
      {
        "id": "732878539089166354",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "avatar": null,
        "thumbnailAvatar": null
      },
      {
        "id": "732878539089166355",
        "fullName": "Bob Johnson",
        "email": "bob@example.com",
        "avatar": "https://...",
        "thumbnailAvatar": "https://..."
      }
    ],
    "total": 3
  }
}
```

---

## Testing Checklist

- [ ] Verify API returns 3 users (Network tab)
- [ ] Check `[useGetWorkspaceUsers] API response` shows 3 users
- [ ] Verify `[useGetWorkspaceUsers] Mapped users` has 3 users with `name` field
- [ ] Check `[field-input.tsx] workspaceUsersData` is array of 3
- [ ] Verify `[user-field.tsx] Raw workspaceUsers` shows 3 users
- [ ] Check each `[user-field.tsx] Mapped to` has non-empty `name`
- [ ] Verify `[user-field.tsx] Final mappedUsers count` is 3
- [ ] Check `[UserSelect] usersCount` is 3
- [ ] Verify `[UserSelect] Filtering users totalUsers` is 3
- [ ] Check dropdown renders 3 user options

---

## Removing Debug Logging (After Fixing)

Once the issue is identified and fixed, remove debug logging:

1. Remove console.log statements from:
   - `use-get-workspace-users.ts` (lines 130-150)
   - `field-input.tsx` (lines 43-52)
   - `user-field.tsx` (lines 112-130)
   - `user-select.tsx` (lines 61-70, 80-106)

2. Rebuild packages:
   ```bash
   pnpm --filter @workspace/active-tables-core build
   pnpm --filter web build
   ```

---

## Contact Info

If debugging logs reveal unexpected behavior, share:

1. Full console log output
2. Network tab showing API response
3. Field configuration (field.type, field.name)
4. Workspace ID

This will help identify the root cause quickly.
