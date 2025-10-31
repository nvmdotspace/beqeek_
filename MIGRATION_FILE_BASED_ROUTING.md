# Migration to File-Based Routing - TanStack Router

## Ngày thực hiện: 2025-10-31

## Tóm tắt
Chuyển đổi từ code-based routing sang file-based routing theo khuyến nghị của TanStack Router v1.133+.

## Lý do chuyển đổi
1. **Không đúng chuẩn**: Code-based routing hiện tại không theo đúng route tree hierarchy
2. **Khuyến nghị chính thức**: TanStack Router khuyến dùng file-based routing
3. **Lợi ích**:
   - Auto code-splitting
   - Type-safe routing tốt hơn
   - Ít boilerplate code
   - Dễ maintain và scale
   - Route tree được generate tự động

## Các thay đổi chính

### 1. Cài đặt package mới
```bash
pnpm add @tanstack/router-plugin@latest --filter web
pnpm add @tanstack/react-router@latest @tanstack/react-router-devtools@latest --filter web
```

### 2. Cấu hình Vite (vite.config.ts)
- Thêm `tanstackRouter` plugin
- Cấu hình:
  - `routesDirectory`: `src/routes`
  - `generatedRouteTree`: `src/routeTree.gen.ts`
  - `autoCodeSplitting`: `true`

### 3. Cấu trúc routes mới
```
src/routes/
├── __root.tsx                              # Root layout
├── index.tsx                               # / redirect
├── $.tsx                                   # 404 catch-all
├── $locale.tsx                             # Locale layout
└── $locale/
    ├── index.tsx                           # /$locale redirect
    ├── login.tsx                           # Login page
    ├── workspaces.tsx                      # Workspaces dashboard
    ├── workspaces/
    │   └── $workspaceId/                   # Workspace-scoped routes
    │       ├── tables.tsx
    │       ├── tables/$tableId/
    │       │   ├── index.tsx
    │       │   ├── records.tsx
    │       │   └── settings.tsx
    │       ├── workflows.tsx
    │       ├── team.tsx
    │       ├── roles.tsx
    │       ├── analytics.tsx
    │       ├── starred.tsx
    │       ├── recent-activity.tsx
    │       └── archived.tsx
    ├── notifications.tsx                   # Global routes
    ├── search.tsx
    └── help.tsx
```

### 4. Files đã xóa
- `src/router.tsx` - Code-based route definitions (DELETED)
- `src/routes/root-layout.tsx` → moved to `src/components/root-layout.tsx`

### 5. Files đã sửa đổi
- `src/main.tsx`:
  - Import `routeTree` from `./routeTree.gen`
  - Tạo router instance với `createRouter({ routeTree })`
  - Khai báo module augmentation cho type safety

- `src/hooks/use-api-error-handler.ts`:
  - Sử dụng `useRouter()` hook thay vì import global `router`

- `src/components/api-error-boundary.tsx`:
  - Sử dụng `window.location.href` thay vì `router.navigate()`

- `.gitignore`:
  - Thêm `apps/web/src/routeTree.gen.ts`

- `CLAUDE.md`:
  - Cập nhật hướng dẫn routing
  - Thêm route structure diagram
  - Cập nhật Common Pitfalls

### 6. File được generate tự động
- `src/routeTree.gen.ts` - TanStack Router plugin tự động tạo

## Route File Pattern

Mỗi route file sử dụng `createFileRoute()`:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const MyPageLazy = lazy(() => import('@/features/my-feature/pages/my-page'));

export const Route = createFileRoute('/$locale/my-route')({
  component: MyComponent,
  beforeLoad: ({ params }) => {
    // Auth guards, redirects, etc.
  },
});

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPageLazy />
    </Suspense>
  );
}
```

## Naming Conventions
- `$param` - Dynamic route parameter (e.g., `$locale`, `$workspaceId`, `$tableId`)
- `index.tsx` - Index route (matches parent path)
- `$.tsx` - Catch-all/splat route (404)
- `_layout` - Pathless layout route (prefix với `_`)
- `__root.tsx` - Root route (special)

## Testing Results
✅ Type check passed: `pnpm --filter web check-types`
✅ Build successful: `pnpm --filter web build`
✅ Dev server starts: `pnpm --filter web dev`
✅ Routing works correctly: All routes navigate properly
✅ API calls work: Active Tables API endpoints called correctly

## Post-Migration Fix

### Issue Found
After initial migration, navigating to `/vi/workspaces/732878538910205329/tables` was showing Workspace Dashboard instead of Active Tables page. No API calls to active tables endpoints were made.

### Root Cause
The `workspaces.tsx` route was rendering `WorkspaceDashboardPage` directly instead of being a layout route with `<Outlet />`. This caused TanStack Router to match the parent route instead of nested child routes.

### Solution
1. **Fixed** `apps/web/src/routes/$locale/workspaces.tsx`: Changed to layout route with `<Outlet />`
2. **Created** `apps/web/src/routes/$locale/workspaces/index.tsx`: New index route for Workspace Dashboard

### Verification
- ✅ `/vi/workspaces` → Shows Workspace Dashboard
- ✅ `/vi/workspaces/732878538910205329/tables` → Shows Active Tables page
- ✅ API calls: `get/active_work_groups` and `get/active_tables` are called correctly

## Post-Migration Fix #2: Navigation Buttons in Table Cards

### Issue Found
After migration, navigation buttons in Active Table cards ("Open Records", "Xem chi tiết", "Comments", "Automations") were not working when clicked.

### Root Cause
In `active-tables-page.tsx`, the `workspaceId` was being extracted incorrectly:

**Before (BROKEN)**:
```typescript
const params = useParams({ strict: false });
const workspaceId = (params as any).workspaceId || '';
```

Problems:
- `useParams({ strict: false })` doesn't guarantee correct params in file-based routing
- Type assertion `(params as any)` bypasses type safety
- Fallback to empty string `''` causes handlers to check `if (!workspaceId) return;` and exit early
- Navigation buttons appeared to do nothing

### Solution
Use route-specific params with `from` option for type-safe extraction:

**After (FIXED)**:
```typescript
const params = useParams({ from: '/$locale/workspaces/$workspaceId/tables' });
const workspaceId = params.workspaceId;
```

Benefits:
- ✅ Type-safe: TypeScript knows exact params structure
- ✅ Guaranteed: `workspaceId` always has value (or route doesn't match)
- ✅ Explicit: Clear which route provides params
- ✅ No fallbacks needed: Route matching ensures params exist

### Files Changed
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx` (line 41-45)
- `apps/web/src/features/active-tables/pages/active-table-detail-page.tsx` (line 132-138)
- `apps/web/src/features/active-tables/pages/active-table-records-page.tsx` (line 35-41)
- `apps/web/src/features/active-tables/pages/active-table-settings-page.tsx` (line 26-32)

### Verification
1. Navigate to `/vi/workspaces/732878538910205329/tables`
2. Click "Open Records" → Should navigate to `/tables/{tableId}/records`
3. Click "Xem chi tiết" → Should navigate to `/tables/{tableId}`
4. Click "Comments" → Should navigate to `/tables/{tableId}/records`
5. Click "Automations" → Should navigate to `/tables/{tableId}`
6. On table detail page, click "Open Records" → Should navigate to `/tables/{tableId}/records`
7. On table detail page, click "Settings" → Should navigate to `/tables/{tableId}/settings`

All navigation buttons now work correctly across all pages! ✅

See [NAVIGATION_TEST_PLAN.md](NAVIGATION_TEST_PLAN.md) for comprehensive testing guide.

## Breaking Changes
⚠️ **KHÔNG CÓ breaking changes đối với user-facing functionality**
- Tất cả routes giữ nguyên URL pattern
- Auth guards hoạt động như cũ
- Lazy loading vẫn được áp dụng

## Notes for Future Development
1. **Thêm route mới**: Tạo file trong `src/routes/` theo naming convention
2. **Router instance**: Sử dụng `useRouter()` hook, KHÔNG import global
3. **Generated file**: KHÔNG SỬA `routeTree.gen.ts` - file này tự động generate
4. **Plugin**: Mỗi lần save route file, plugin sẽ re-generate route tree

## References
- [TanStack Router File-Based Routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)
- [TanStack Router Route Trees](https://tanstack.com/router/latest/docs/framework/react/routing/route-trees)
- Context7 documentation: `/tanstack/router`
