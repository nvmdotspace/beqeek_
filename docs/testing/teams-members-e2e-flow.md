# Teams & Members Feature - End-to-End Test User Flow

**Feature**: Teams & Members Management
**Date**: 2025-11-14
**Status**: Production Ready
**Related Plan**: [plans/251114-2255-team-members-feature-implementation](../../plans/251114-2255-team-members-feature-implementation/plan.md)

## Overview

This document outlines the complete end-to-end user flows for testing the Teams & Members feature, including all CRUD operations, validation scenarios, and edge cases.

---

## Test Prerequisites

### Environment Setup

- **Base URL**: `http://localhost:4173` (or your dev server)
- **Authentication**: Valid user session with workspace access
- **Test Workspace**: Active workspace with workspaceId
- **Locales**: Test in both Vietnamese (vi) and English (en)

### Test Data Requirements

- **Existing User**: Username of a user already in the system (for invite flow)
- **New User**: Random username that doesn't exist (for create flow)
- **Valid Email**: For optional email field validation
- **Strong Password**: Minimum 6 characters for new user creation

---

## Flow 1: Team Management

### 1.1 Create New Team (Happy Path)

**Route**: `/$locale/workspaces/$workspaceId/team`

**Steps**:

1. Navigate to Teams page
2. Click "Tạo đội nhóm mới" / "Create Team" button
3. Fill form:
   - Team Name: "Engineering Team" (required, max 100 chars)
   - Description: "Software development team" (optional, max 500 chars)
4. Click "Tạo đội nhóm" / "Create Team"

**Expected Results**:

- ✅ Modal closes
- ✅ New team appears in grid
- ✅ Team card shows name, description, role count (0 roles)
- ✅ Console log: "Create team success" (placeholder for toast)

**Validation Tests**:

- Empty team name → Shows "Tên đội nhóm không được để trống" / "Team name is required"
- Team name > 100 chars → Shows length error
- Description > 500 chars → Shows length error

---

### 1.2 Edit Existing Team

**Steps**:

1. On Teams page, click "Chỉnh sửa" / "Edit" on a team card
2. Modify form:
   - Update Team Name: "Engineering Team (Updated)"
   - Update Description: "Full-stack development team"
3. Click "Cập nhật đội nhóm" / "Update Team"

**Expected Results**:

- ✅ Modal closes
- ✅ Team card reflects updated name and description
- ✅ Console log: "Update team success"

---

### 1.3 Navigate to Team Detail

**Steps**:

1. Click anywhere on team card (except Edit/Delete buttons)
   - OR click ChevronRight icon
2. URL changes to: `/$locale/workspaces/$workspaceId/team/$teamId`

**Expected Results**:

- ✅ Navigates to Team Detail page
- ✅ Shows team name in header
- ✅ Shows "Vai trò" / "Roles" section
- ✅ Shows "Thành viên" / "Members" section
- ✅ Back button visible

---

### 1.4 Delete Team

**Steps**:

1. On Teams page, click "Xóa" / "Delete" on a team card
2. Confirmation dialog appears with warning message
3. Click "Xóa đội nhóm" / "Delete Team" to confirm

**Expected Results**:

- ✅ Dialog closes
- ✅ Team card removed from grid
- ✅ Console log: "Delete team success"

**Warning Message**:

- Vietnamese: "Bạn có chắc chắn muốn xóa {teamName}? Hành động này không thể hoàn tác. Tất cả vai trò và phân công thành viên của đội này sẽ bị xóa."
- English: "Are you sure you want to delete {teamName}? This action cannot be undone. All roles and member assignments for this team will be removed."

---

### 1.5 Empty State (No Teams)

**Scenario**: Workspace has no teams

**Expected UI**:

- Users icon (12x12) in muted color
- Heading: "Chưa có đội nhóm nào" / "No teams yet"
- Description: "Tạo đội nhóm đầu tiên để tổ chức thành viên workspace và phân công vai trò." / "Create your first team to organize workspace members and assign roles."

---

### 1.6 Loading State

**Trigger**: When fetching teams from API

**Expected UI**:

- Grid of 3 skeleton cards (animate-pulse)
- Each skeleton: height 48, rounded borders, gray background

---

## Flow 2: Role Management

### 2.1 Create New Role (Happy Path)

**Route**: `/$locale/workspaces/$workspaceId/team/$teamId`

**Steps**:

1. On Team Detail page, in Roles section
2. Click "Tạo vai trò mới" / "Create Role" button
3. Fill form:
   - Role Name: "Senior Developer" (required, max 100 chars)
   - Role Code: "SR_DEV" (optional, max 50 chars, alphanumeric + underscore)
   - Description: "Lead development tasks" (optional, max 500 chars)
4. Click "Tạo vai trò" / "Create Role"

**Expected Results**:

- ✅ Modal closes
- ✅ New role appears in table
- ✅ Shows role name, code, description
- ✅ Console log: "Create role success"

**Validation Tests**:

- Empty role name → Shows "Tên vai trò không được để trống" / "Role name is required"
- Role name > 100 chars → Shows length error
- Role code with special chars (e.g., "SR-DEV") → Shows "Mã vai trò chỉ cho phép chữ, số và gạch dưới" / "Role code can only contain letters, numbers, and underscores"
- Role code > 50 chars → Shows length error

---

### 2.2 Edit Existing Role

**Steps**:

1. In Roles table, click "Chỉnh sửa" / "Edit" button
2. Modify form fields
3. Click "Cập nhật vai trò" / "Update Role"

**Expected Results**:

- ✅ Modal closes
- ✅ Table row reflects updated data
- ✅ Console log: "Update role success"

---

### 2.3 Delete Role

**Steps**:

1. In Roles table, click "Xóa" / "Delete" button
2. Confirmation dialog appears
3. Click "Xóa vai trò" / "Delete Role" to confirm

**Expected Results**:

- ✅ Dialog closes
- ✅ Role removed from table
- ✅ Console log: "Delete role success"

**Warning Message**:

- Vietnamese: "Bạn có chắc chắn muốn xóa {roleName}? Vai trò này sẽ bị xóa khỏi tất cả thành viên đội."
- English: "Are you sure you want to delete {roleName}? This will remove this role from all team members."

---

### 2.4 Default Role Badge

**Scenario**: Role with `isDefault: true`

**Expected UI**:

- Badge next to role name in table
- Text: "Mặc định" / "Default"
- Badge variant: secondary
- Badge className: text-xs

---

### 2.5 Empty State (No Roles)

**Expected UI**:

- Shield icon (12x12) in muted color
- Heading: "Chưa có vai trò nào" / "No roles yet"
- Description: "Tạo vai trò để định nghĩa quyền hạn và trách nhiệm cho thành viên đội." / "Create roles to define permissions and responsibilities for team members."

---

### 2.6 Responsive Table

**Mobile (< 768px)**:

- Only shows Role Name and Actions columns
- Code column hidden
- Description shown below role name in mobile view

**Tablet (768-1024px)**:

- Shows Role Name, Code, Actions
- Description column hidden

**Desktop (> 1024px)**:

- Shows all columns: Name, Code, Description, Actions

---

## Flow 3: Member Management - Invite Existing User

### 3.1 Invite Existing User (Happy Path)

**Route**: `/$locale/workspaces/$workspaceId/team/$teamId`

**Steps**:

1. In Members section, click "Thêm thành viên" / "Add Member"
2. Enter existing username (e.g., "john_doe")
3. Wait for username lookup (shows Loader2 spinner)
4. Green checkmark appears (CheckCircle2 icon)
5. Message shows: "Người dùng đã tồn tại - sẽ mời vào workspace" / "User exists - will invite to workspace"
6. Select Team from dropdown (pre-filled if on team detail page)
7. Select Role from dropdown
8. Click "Mời thành viên" / "Invite Member"

**Expected Results**:

- ✅ Modal closes
- ✅ Member appears in members table
- ✅ Shows avatar, name, username, email, team, role
- ✅ Console log: "Invite user success"

**API Call**:

```
POST /api/workspace/{workspaceId}/set/workspace_users
Body: {
  constraints: {
    workspaceId: string,
    workspaceTeamId: string,
    workspaceTeamRoleId: string
  },
  data: {
    username: string
  }
}
```

---

## Flow 4: Member Management - Create New User

### 4.1 Create New User (Happy Path)

**Steps**:

1. In Members section, click "Thêm thành viên" / "Add Member"
2. Enter non-existing username (e.g., "jane_smith_new")
3. Wait for username lookup
4. Orange X appears (XCircle icon)
5. Message shows: "Người dùng mới - sẽ tạo tài khoản mới" / "New user - will create new account"
6. **Password field appears** (conditional rendering)
7. Fill additional fields:
   - Password: "SecurePass123" (required, min 6 chars)
   - Email: "jane@example.com" (optional, valid format)
   - Full Name: "Jane Smith" (optional, max 200 chars)
8. Select Team and Role
9. Click "Tạo và thêm" / "Create & Add"

**Expected Results**:

- ✅ Modal closes
- ✅ New user created and added to members table
- ✅ Shows user info with avatar (fallback initials if no avatar)
- ✅ Console log: "Create user success"

**API Call**:

```
POST /api/workspace/{workspaceId}/create/workspace_users
Body: {
  constraints: {
    workspaceId: string,
    workspaceTeamId: string,
    workspaceTeamRoleId: string
  },
  data: {
    username: string,
    password: string,
    email?: string,
    fullName?: string
  }
}
```

---

### 4.2 Username Lookup States

**Test Scenarios**:

1. **Typing (< 2 chars)**:
   - No API call
   - No indicator shown

2. **Loading (≥ 2 chars)**:
   - Shows Loader2 spinner (animated)
   - Position: absolute right-3

3. **User Exists**:
   - Green CheckCircle2 icon
   - Helper text: "Người dùng đã tồn tại - sẽ mời vào workspace"
   - Password field HIDDEN

4. **User Not Found**:
   - Orange XCircle icon
   - Helper text: "Người dùng mới - sẽ tạo tài khoản mới"
   - Password field VISIBLE
   - Email and Full Name fields VISIBLE

---

### 4.3 Validation Tests - Member Form

**Username Validation**:

- Empty → "Tên đăng nhập không được để trống" / "Username is required"
- < 2 chars → "Tên đăng nhập phải có ít nhất 2 ký tự" / "Username must be at least 2 characters"
- > 50 chars → "Tên đăng nhập không được quá 50 ký tự" / "Username must be less than 50 characters"
- Special chars (e.g., "john-doe") → "Tên đăng nhập chỉ cho phép chữ, số và gạch dưới" / "Username can only contain letters, numbers, and underscores"

**Password Validation** (only for new users):

- Empty → "Mật khẩu không được để trống" / "Password is required"
- < 6 chars → "Mật khẩu phải có ít nhất 6 ký tự" / "Password must be at least 6 characters"

**Email Validation** (optional):

- Invalid format (e.g., "invalid.email") → "Email không hợp lệ" / "Invalid email format"
- Valid formats: "user@example.com", "user+tag@domain.co.uk"

**Team Validation**:

- Not selected → "Vui lòng chọn đội nhóm" / "Please select a team"

**Role Validation**:

- Not selected → "Vui lòng chọn vai trò" / "Please select a role"
- Team has no roles → Dropdown disabled, message: "Đội này chưa có vai trò. Tạo vai trò trước khi thêm thành viên." / "This team has no roles. Create a role before adding members."

---

### 4.4 Dynamic Role Loading

**Behavior**: Roles dropdown depends on selected team

**Steps**:

1. Open Add Member modal
2. Select Team A → Roles dropdown loads roles for Team A
3. Select a role
4. Change to Team B → Selected role resets, roles dropdown loads Team B's roles

**Implementation**:

```typescript
useEffect(() => {
  setSelectedRoleId(''); // Reset role when team changes
}, [selectedTeamId]);

const { data: roles = [] } = useGetRoles(workspaceId, selectedTeamId, { query: 'FULL' });
```

---

### 4.5 Member List Display

**Table Columns**:

**Mobile (< 768px)**:

- Name (with avatar)
- Role

**Tablet (768-1024px)**:

- Name (with avatar)
- Username (with email below)
- Role

**Desktop (> 1024px)**:

- Name (with avatar)
- Username (with email below)
- Teams (badges, max 3 + "+N" indicator)
- Role

**Avatar Fallback**:

- If no avatar: Shows initials (first 2 chars of fullName, uppercase)
- Example: "John Doe" → "JO"

**Multiple Memberships**:

- User can have multiple team-role pairs
- Each membership shows as separate badge/row

---

### 4.6 Empty State (No Members)

**Workspace View** (no teamId filter):

- Heading: "Chưa có thành viên nào" / "No members yet"
- Description: "Thêm thành viên vào workspace để bắt đầu cộng tác." / "Add members to your workspace to start collaborating."

**Team View** (with teamId filter):

- Heading: "Đội này chưa có thành viên nào" / "This team has no members yet"
- Description: "Thêm thành viên vào đội này để phân công công việc." / "Add members to this team to assign work."

---

## Flow 5: Navigation & Integration

### 5.1 Navigation Flow

**Complete User Journey**:

```
1. Login → Workspace Selection
   ↓
2. Workspace Dashboard
   ↓
3. Click "Đội nhóm" / "Teams" in sidebar
   ↓
4. Teams List Page (/$locale/workspaces/$workspaceId/team)
   ↓
5. Click team card → Team Detail Page (/$locale/workspaces/$workspaceId/team/$teamId)
   ↓
6. Manage roles and members
   ↓
7. Click "← Back" button → Returns to Teams List
```

**URL Structure**:

- Teams List: `/$locale/workspaces/$workspaceId/team`
- Team Detail: `/$locale/workspaces/$workspaceId/team/$teamId`

**Route Params** (type-safe via getRouteApi):

- `locale`: "vi" | "en"
- `workspaceId`: string
- `teamId`: string (only in detail view)

---

### 5.2 Locale Switching

**Test Steps**:

1. Change language in app settings
2. Navigate to Teams page
3. Verify all text updates to selected locale

**Expected Behavior**:

- All UI text uses `m.message_key()` from Paraglide
- No hardcoded strings in Vietnamese or English
- Form placeholders, buttons, errors all translate

---

### 5.3 Query Invalidation

**After Mutations** (create/update/delete):

- Teams list automatically refreshes
- Role list automatically refreshes
- Members list automatically refreshes

**Implementation** (React Query):

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'teams'] });
  queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'team', teamId, 'roles'] });
  queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'users'] });
};
```

---

## Flow 6: Accessibility Testing

### 6.1 Keyboard Navigation

**Test with keyboard only** (no mouse):

1. **Tab Navigation**:
   - Tab through all interactive elements
   - Focus visible on buttons, inputs, dropdowns
   - Skip to main content works

2. **Form Submission**:
   - Focus on first input when modal opens
   - Tab between fields
   - Enter to submit form
   - Escape to close modal

3. **Dropdowns**:
   - Arrow keys to navigate options
   - Enter to select
   - Escape to close

**Expected Results**:

- ✅ All interactive elements keyboard accessible
- ✅ Focus visible (ring-ring design token)
- ✅ Logical tab order
- ✅ No keyboard traps

---

### 6.2 Screen Reader Testing

**ARIA Attributes to Verify**:

1. **Form Fields**:

```html
<Label htmlFor="teamName">Team Name</Label>
<Input
  id="teamName"
  aria-required="true"
  aria-invalid={!!errors.teamName}
  aria-describedby={errors.teamName ? 'teamName-error' : undefined}
/>
<p id="teamName-error" className="text-sm text-destructive">
  {errors.teamName}
</p>
```

2. **Buttons**:

```html
<button aria-label="Edit team Engineering">
  <Edit className="h-4 w-4" />
</button>
```

3. **Dialogs**:

```html
<dialog aria-describedby="dialog-description">
  <DialogTitle id="dialog-title">Create Team</DialogTitle>
  <DialogDescription id="dialog-description"> Enter team details below </DialogDescription>
</dialog>
```

**Screen Reader Test**:

- Use NVDA (Windows) or VoiceOver (Mac)
- Navigate through forms
- Verify all labels announced
- Verify error messages announced

---

### 6.3 Color Contrast

**Design Token Verification**:

- All text uses design tokens (text-foreground, text-muted-foreground)
- All backgrounds use design tokens (bg-background, bg-card)
- All borders use design tokens (border-input, border-border)
- Error text uses text-destructive token

**WCAG 2.1 AA Compliance**:

- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Design tokens ensure automatic compliance

---

## Flow 7: Error Handling

### 7.1 Network Errors

**Scenario**: API request fails (network timeout, 500 error)

**Expected Behavior**:

- Console error logged
- Error state set in form
- User sees: "Không thể [action]. Vui lòng thử lại." / "Failed to [action]. Please try again."
- Modal remains open
- Form data preserved (user can retry)

**Test**:

- Disconnect internet
- Try to create team
- Verify error handling

---

### 7.2 Validation Errors (Server-Side)

**Scenario**: Backend rejects request with validation error

**Expected Behavior**:

- Parse error response
- Show field-specific errors
- Focus on first error field

---

### 7.3 Unauthorized Access

**Scenario**: User lacks permission for action

**Expected Behavior**:

- API returns 401/403
- User redirected to login (if 401)
- Error message shown (if 403)

---

## Flow 8: Edge Cases

### 8.1 Long Text Overflow

**Test Data**:

- Team Name: 100 characters
- Description: 500 characters
- Role Code: 50 characters

**Expected Behavior**:

- Text truncates with ellipsis in card/table views
- Full text visible in modal forms
- No layout breaks

---

### 8.2 Special Characters

**Test Data**:

- Team Name: "Đội Kỹ Thuật (2024)" (Vietnamese diacritics, parentheses)
- Username: "user_123" (underscore, numbers)
- Role Code: "SR_DEV_2024" (underscores, numbers)

**Expected Behavior**:

- Vietnamese characters render correctly
- Allowed special chars accepted
- Disallowed special chars rejected with validation error

---

### 8.3 Concurrent Operations

**Scenario**: Multiple users editing same team

**Expected Behavior**:

- Last write wins (optimistic UI)
- Query invalidation refreshes data
- No race conditions

---

### 8.4 Empty Roles in Team

**Scenario**: User tries to add member to team with no roles

**Expected Behavior**:

- Role dropdown disabled
- Helper text shown: "Đội này chưa có vai trò. Tạo vai trò trước khi thêm thành viên." / "This team has no roles. Create a role before adding members."
- Submit button disabled

---

## Flow 9: Performance Testing

### 9.1 Large Datasets

**Test Data**:

- 50+ teams in workspace
- 20+ roles per team
- 100+ members in workspace

**Expected Performance**:

- Initial load < 3 seconds
- Smooth scrolling in lists/tables
- No lag when typing in forms
- Code splitting keeps bundle sizes small

**Bundle Sizes**:

- teams-page: 7.52 kB (gzipped: 2.62 kB)
- team-detail-page: 20.84 kB (gzipped: 5.59 kB)

---

### 9.2 Caching

**React Query Cache Settings**:

- staleTime: 5 minutes
- cacheTime: 10 minutes

**Test**:

1. Navigate to Teams page (API call)
2. Navigate away
3. Return within 5 minutes → No API call (cached)
4. Return after 5 minutes → Background refetch

---

## Flow 10: Mobile Testing

### 10.1 Touch Targets

**WCAG Guideline**: Minimum 44x44px

**Test**:

- Tap all buttons on mobile device
- Verify comfortable tap area
- No accidental taps

---

### 10.2 Responsive Breakpoints

**Test Sizes**:

- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1920px (Full HD)

**Expected Layouts**:

- **320-640px**: 1 column, stacked cards, simplified tables
- **640-1024px**: 2 columns, some table columns hidden
- **1024px+**: 3 columns, all table columns visible

---

### 10.3 Virtual Keyboard

**Test on Mobile**:

1. Open Add Member modal
2. Tap username input
3. Virtual keyboard appears

**Expected Behavior**:

- Modal scrolls to keep input visible
- No content hidden behind keyboard
- Submit button accessible

---

## Test Checklist

### Pre-Testing

- [ ] Dev server running (`pnpm dev`)
- [ ] Test user authenticated
- [ ] Test workspace created
- [ ] Database clean state (or known state)

### Feature Testing

- [ ] Flow 1: Team CRUD operations
- [ ] Flow 2: Role CRUD operations
- [ ] Flow 3: Invite existing user
- [ ] Flow 4: Create new user
- [ ] Flow 5: Navigation between pages
- [ ] Flow 6: Keyboard accessibility
- [ ] Flow 7: Error scenarios
- [ ] Flow 8: Edge cases
- [ ] Flow 9: Performance with large data
- [ ] Flow 10: Mobile responsiveness

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Locale Testing

- [ ] All flows in Vietnamese (vi)
- [ ] All flows in English (en)
- [ ] Locale switching mid-flow

### Accessibility Testing

- [ ] Keyboard-only navigation
- [ ] Screen reader (NVDA/VoiceOver)
- [ ] Color contrast (Lighthouse)
- [ ] Touch targets on mobile

---

## Automated Test Ideas

### Unit Tests (Vitest + React Testing Library)

```typescript
// Form validation
describe('TeamFormModal', () => {
  it('shows error when team name is empty', () => {
    // Test validation.teamName()
  });

  it('shows error when team name exceeds 100 chars', () => {
    // Test validation
  });
});

// Username lookup
describe('useLookupUsername', () => {
  it('returns user data when user exists', () => {
    // Mock API returning 200
  });

  it('returns null when user not found', () => {
    // Mock API returning 404
  });
});
```

### Integration Tests (Playwright)

```typescript
// E2E team creation
test('create new team successfully', async ({ page }) => {
  await page.goto('/vi/workspaces/123/team');
  await page.click('text=Tạo đội nhóm mới');
  await page.fill('#teamName', 'Test Team');
  await page.fill('#teamDescription', 'Test Description');
  await page.click('button:has-text("Tạo đội nhóm")');
  await expect(page.locator('text=Test Team')).toBeVisible();
});

// E2E member invitation
test('invite existing user to team', async ({ page }) => {
  await page.goto('/vi/workspaces/123/team/456');
  await page.click('text=Thêm thành viên');
  await page.fill('#username', 'existing_user');
  await expect(page.locator('[data-testid="check-icon"]')).toBeVisible();
  await page.selectOption('#team', '456');
  await page.selectOption('#role', '789');
  await page.click('button:has-text("Mời thành viên")');
  await expect(page.locator('text=existing_user')).toBeVisible();
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Role dropdown empty even though roles exist
**Cause**: Team not selected first
**Solution**: Ensure team selected before roles loaded

**Issue**: Password field not appearing for new user
**Cause**: Username lookup still in progress
**Solution**: Wait for XCircle icon before expecting password field

**Issue**: Form validation errors in wrong language
**Cause**: i18n message keys not found
**Solution**: Verify message keys exist in both vi.json and en.json

**Issue**: Members not showing in team view
**Cause**: Filter by teamId not working
**Solution**: Check workspaceMemberships data structure from API

---

## Related Documentation

- [Implementation Plan](../../plans/251114-2255-team-members-feature-implementation/plan.md)
- [Design System](../design-system.md)
- [API Documentation](../swagger.yaml)
- [Accessibility Guidelines](../design-system.md#accessibility)

---

## Changelog

**2025-11-14**: Initial documentation created after Phase 5 completion
