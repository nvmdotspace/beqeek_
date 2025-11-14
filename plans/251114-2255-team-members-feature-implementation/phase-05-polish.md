# Phase 5: Polish & Integration

## Context

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: Phase 1-4 (all core features implemented)
**Related Docs**:

- [Design System](../../docs/design-system.md)
- [Design Review Checklist](../../docs/design-review-checklist.md)
- [Accessibility Guidelines](../../docs/design-system.md#accessibility)

## Overview

**Date**: 2025-11-14
**Description**: Final polish, validation, accessibility, mobile optimization
**Priority**: P1 (Quality assurance)
**Estimated Time**: 3-4 hours
**Implementation Status**: Not Started
**Review Status**: Not Started

## Key Insights

1. **Form validation**: Client-side validation with clear error messages
2. **Loading states**: Skeleton loaders, spinners, disable states
3. **Empty states**: Helpful messaging and CTAs
4. **Mobile responsive**: Grid → stack, table → cards on mobile
5. **Accessibility**: Keyboard nav, ARIA labels, screen reader support
6. **i18n completion**: All text translated (vi + en)
7. **Toast notifications**: Success/error feedback (Phase 6 enhancement)

## Requirements

### Functional

- All forms validate before submission
- Loading states during API calls
- Error messages user-friendly
- Empty states with helpful text
- Success confirmations (console.log placeholders)
- Mobile navigation works
- Keyboard shortcuts accessible

### Non-Functional

- WCAG 2.1 AA compliance
- Mobile-first responsive (320px+)
- Performance (lazy loading, code splitting)
- i18n complete (no hardcoded text)
- Design tokens used (no hardcoded colors)
- TypeScript strict mode passes

## Architecture

### Validation Strategy

```
Form Submission
  ↓ Client-side validation (instant feedback)
  ↓ API call (server-side validation)
  ↓ Error handling
    ├─> Show field-specific errors
    └─> Show toast notification
  ↓ Success
    ├─> Close modal
    ├─> Invalidate queries
    └─> Show toast notification
```

### Responsive Breakpoints

```
Mobile:  < 640px  (1 column, stacked tables)
Tablet:  640-1024px (2 columns)
Desktop: > 1024px (3 columns, full tables)
```

## Related Code Files

**Modified:**

- All component files from Phase 2-4 (add validation, loading states)
- `messages/vi.json` (complete translations)
- `messages/en.json` (complete translations)

**New (Optional):**

- `apps/web/src/features/team/components/toast-notifications.tsx` (future enhancement)
- `apps/web/src/features/team/utils/validation.ts` (centralized validation)

## Implementation Steps

### 1. Complete Form Validation (60 min)

**Update all form modals** (TeamFormModal, RoleFormModal, MemberFormModal):

**Validation Rules:**

```typescript
// Team Form
- teamName: required, 1-100 chars, trim whitespace
- teamDescription: optional, max 500 chars

// Role Form
- roleName: required, 1-100 chars
- roleCode: optional, max 50 chars, alphanumeric/underscore only
- roleDescription: optional, max 500 chars

// Member Form
- username: required, 3-50 chars, alphanumeric/underscore only
- teamId: required
- roleId: required
- email: optional, valid email format
- fullName: optional, 1-200 chars
- password: required if new user, min 8 chars
```

**Add validation utility** (optional):

```typescript
// apps/web/src/features/team/utils/validation.ts
export const teamValidation = {
  teamName: (value: string) => {
    if (!value.trim()) return 'Team name is required';
    if (value.length > 100) return 'Team name must be less than 100 characters';
    return null;
  },
  teamDescription: (value: string) => {
    if (value.length > 500) return 'Description must be less than 500 characters';
    return null;
  },
};

export const roleValidation = {
  roleName: (value: string) => {
    if (!value.trim()) return 'Role name is required';
    if (value.length > 100) return 'Role name must be less than 100 characters';
    return null;
  },
  roleCode: (value: string) => {
    if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Role code can only contain letters, numbers, and underscores';
    }
    if (value.length > 50) return 'Role code must be less than 50 characters';
    return null;
  },
};

export const memberValidation = {
  username: (value: string) => {
    if (!value.trim()) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 50) return 'Username must be less than 50 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  },
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },
  password: (value: string, isNewUser: boolean) => {
    if (isNewUser && !value) return 'Password is required for new users';
    if (value && value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },
};
```

### 2. Enhance Loading States (45 min)

**Add skeleton loaders:**

```typescript
// TeamList loading state
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {[...Array(6)].map((_, i) => (
    <Card key={i} className="animate-pulse">
      <div className="p-6 space-y-3">
        <div className="h-6 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </Card>
  ))}
</div>

// RoleList loading state
<Card>
  <div className="p-6 space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
    ))}
  </div>
</Card>

// MemberList loading state (similar pattern)
```

**Add button loading states:**

```typescript
<Button disabled={isPending}>
  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isPending ? 'Processing...' : 'Submit'}
</Button>
```

### 3. Improve Empty States (30 min)

**Enhance empty state messaging:**

```typescript
// EmptyTeamList
<Card>
  <CardContent className="flex flex-col items-center justify-center py-16">
    <div className="rounded-full bg-primary/10 p-6 mb-4">
      <Users className="h-12 w-12 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      Teams help you organize workspace members and assign roles.
      Create your first team to get started.
    </p>
    <Button onClick={onCreateTeam}>
      <Plus className="h-4 w-4 mr-2" />
      Create Your First Team
    </Button>
  </CardContent>
</Card>

// Similar enhancements for EmptyRoleList, EmptyMemberList
```

### 4. Mobile Responsive Improvements (45 min)

**Responsive grid layouts:**

```typescript
// Teams grid - already responsive from Phase 2
<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive table headers (hide on mobile)
<TableHead className="hidden md:table-cell">Description</TableHead>
<TableHead className="hidden lg:table-cell">Created At</TableHead>

// Mobile-friendly buttons
<div className="flex flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">Edit</Button>
  <Button className="w-full sm:w-auto">Delete</Button>
</div>

// Responsive dialog widths
<DialogContent className="max-w-md sm:max-w-lg">
```

**Touch-friendly targets:**

- Minimum button size: 44x44px (WCAG guideline)
- Adequate spacing between interactive elements
- Increase padding on mobile

### 5. Accessibility Audit (60 min)

**Keyboard navigation:**

```typescript
// Ensure all interactive elements are keyboard accessible
- Tab navigation through forms
- Enter to submit forms
- Escape to close modals
- Arrow keys in select dropdowns

// Add keyboard shortcuts (optional)
<Button
  onClick={handleCreate}
  onKeyDown={(e) => {
    if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCreate();
    }
  }}
>
  Create Team <kbd className="ml-2 text-xs">Ctrl+N</kbd>
</Button>
```

**ARIA labels:**

```typescript
// Screen reader announcements
<Button aria-label="Edit team Engineering">
  <Edit className="h-4 w-4" />
</Button>

<Dialog aria-describedby="dialog-description">
  <DialogTitle id="dialog-title">Create Team</DialogTitle>
  <DialogDescription id="dialog-description">
    Enter team details below
  </DialogDescription>
</Dialog>

// Form field associations
<Label htmlFor="teamName">Team Name</Label>
<Input
  id="teamName"
  aria-required="true"
  aria-invalid={!!errors.teamName}
  aria-describedby={errors.teamName ? 'teamName-error' : undefined}
/>
{errors.teamName && (
  <p id="teamName-error" className="text-sm text-destructive">
    {errors.teamName}
  </p>
)}
```

**Focus management:**

```typescript
// Auto-focus first input when modal opens
const firstInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (open) {
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }
}, [open]);

<Input ref={firstInputRef} ... />
```

### 6. Complete i18n Messages (30 min)

**Add all missing message keys:**

```json
// messages/vi.json
{
  // Validation errors
  "validation_required": "Trường này là bắt buộc",
  "validation_email_invalid": "Email không hợp lệ",
  "validation_min_length": "Tối thiểu {min} ký tự",
  "validation_max_length": "Tối đa {max} ký tự",
  "validation_alphanumeric": "Chỉ cho phép chữ, số và gạch dưới",

  // Loading states
  "loading_teams": "Đang tải đội nhóm...",
  "loading_roles": "Đang tải vai trò...",
  "loading_members": "Đang tải thành viên...",

  // Empty states
  "empty_teams_title": "Chưa có đội nhóm nào",
  "empty_teams_description": "Tạo đội nhóm để tổ chức thành viên và phân công vai trò",
  "empty_roles_title": "Chưa có vai trò nào",
  "empty_roles_description": "Tạo vai trò để xác định quyền hạn và trách nhiệm",
  "empty_members_title": "Chưa có thành viên nào",
  "empty_members_description": "Thêm thành viên đầu tiên để bắt đầu",

  // Success messages (placeholders for toast)
  "success_team_created": "Đã tạo đội nhóm thành công",
  "success_team_updated": "Đã cập nhật đội nhóm thành công",
  "success_team_deleted": "Đã xóa đội nhóm thành công",
  "success_role_created": "Đã tạo vai trò thành công",
  "success_role_updated": "Đã cập nhật vai trò thành công",
  "success_role_deleted": "Đã xóa vai trò thành công",
  "success_member_invited": "Đã mời thành viên thành công",
  "success_member_created": "Đã tạo thành viên thành công",

  // Error messages
  "error_generic": "Đã xảy ra lỗi. Vui lòng thử lại",
  "error_network": "Lỗi kết nối. Vui lòng kiểm tra internet",
  "error_unauthorized": "Bạn không có quyền thực hiện hành động này"
}
```

**Add English equivalents in** `messages/en.json`.

### 7. Design System Compliance Check (20 min)

**Verify all components use design tokens:**

```typescript
// ✅ Correct
className = 'bg-background text-foreground border-border';

// ❌ Wrong
className = 'bg-white text-gray-900 border-gray-200';

// ✅ Correct spacing
className = 'p-6 space-y-4';

// ❌ Wrong spacing
className = 'p-24px margin-16px';

// ✅ Correct colors
className = 'text-destructive hover:bg-destructive/90';

// ❌ Wrong colors
className = 'text-red-600 hover:bg-red-100';
```

**Verify responsive utilities:**

```typescript
// Mobile-first approach
className="flex flex-col md:flex-row lg:gap-6"

// Breakpoint consistency
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

## Todo List

- [ ] Add validation to all forms (TeamForm, RoleForm, MemberForm)
- [ ] Create validation utility functions
- [ ] Enhance skeleton loading states
- [ ] Improve empty states with CTAs
- [ ] Verify responsive grid layouts (mobile, tablet, desktop)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement focus management in modals
- [ ] Complete i18n messages (vi + en)
- [ ] Verify design token usage (no hardcoded colors)
- [ ] Test touch targets on mobile (44x44px minimum)
- [ ] Run accessibility audit (lighthouse, axe)
- [ ] Test screen reader compatibility
- [ ] Verify all loading states work correctly
- [ ] Test error handling (network errors, validation errors)

## Success Criteria

- [ ] All forms validate before submission
- [ ] Validation errors user-friendly and specific
- [ ] Loading states visible during all async operations
- [ ] Empty states helpful and actionable
- [ ] Responsive on all screen sizes (320px+)
- [ ] Keyboard navigation works throughout
- [ ] All text uses i18n (no hardcoded strings)
- [ ] Design tokens used consistently
- [ ] WCAG 2.1 AA compliant (lighthouse score 90+)
- [ ] No TypeScript errors or warnings
- [ ] No console errors in production

## Risk Assessment

**Low Risk:**

- Straightforward polish work
- No new features, only improvements

**Mitigation:**

- Use lighthouse and axe for accessibility checks
- Test on real mobile devices
- Follow existing patterns in codebase

## Security Considerations

- Input sanitization (handled by validation)
- No sensitive data in error messages
- HTTPS enforced for password transmission

## Next Steps

After Phase 5:
→ **Optional**: Add toast notifications (Sonner or similar)
→ **Optional**: Add bulk operations (delete multiple teams)
→ **Optional**: Add member search/filtering
→ **Ready for Production**: Feature complete and polished
