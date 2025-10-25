# Đề xuất Kiến trúc Monorepo cho BEQEEK Platform

## Tổng quan

Tài liệu này đề xuất kiến trúc monorepo cho nền tảng BEQEEK - một hệ thống Low-Code/No-Code quản lý doanh nghiệp tập trung vào thị trường Việt Nam với tính bảo mật cao (E2EE). Kiến trúc này được thiết kế để hỗ trợ phát triển, bảo trì và mở rộng hiệu quả cho các ứng dụng web và admin.

## Phân tích Hiện trạng

### Điểm mạnh của cấu trúc hiện tại
- **Tech Stack hiện đại**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: Sử dụng shadcn/ui với Radix UI primitives
- **State Management**: React Query cho data fetching
- **Responsive Design**: Mobile-first approach
- **Domain-oriented Components**: Tổ chức theo nghiệp vụ (leads, workspaces, auth)
- **Router**: TanStack Router cho navigation

### Vấn đề cần giải quyết
- **Monolithic Structure**: Khó tái sử dụng code giữa các ứng dụng
- **Scaling Issues**: Khó mở rộng khi thêm ứng dụng mới (admin, landing page)
- **Code Sharing**: Không có cơ chế chia sẻ business logic và UI components
- **Build Performance**: Build toàn bộ ứng dụng mỗi lần thay đổi nhỏ

## Kiến trúc Monorepo Đề xuất

### Cấu trúc Thư mục Tổng thể

```
beqeek-monorepo/
├── apps/                           # Các ứng dụng chính
│   ├── web/                        # Ứng dụng web chính (CRM)
│   ├── admin/                      # Ứng dụng quản trị hệ thống
│   └── landing/                    # Landing page & marketing site
├── packages/                       # Shared packages
│   ├── ui/                         # UI components library
│   ├── features/                   # Feature-based business logic
│   ├── shared/                     # Shared utilities & helpers
│   ├── config/                     # Shared configurations
│   └── types/                      # Shared TypeScript types
├── tools/                          # Development tools & configs
│   ├── eslint-config/              # ESLint configurations
│   ├── typescript-config/          # TypeScript configurations
│   └── vite-config/                # Vite configurations
├── docs/                           # Documentation
├── package.json                    # Root package.json
├── pnpm-workspace.yaml            # PNPM workspace config
├── turbo.json                      # Turborepo configuration
└── .gitignore
```

## Chi tiết Packages

### 1. packages/features/ - Feature-based Business Logic

Tổ chức theo feature-based architecture (best practice):

```
packages/features/
├── src/
│   ├── auth/                       # Authentication & Authorization
│   │   ├── api/
│   │   │   ├── authApi.ts          # API calls
│   │   │   └── endpoints.ts        # API endpoints
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Auth hooks
│   │   │   ├── useLogin.ts         # Login logic
│   │   │   └── useSession.ts       # Session management
│   │   ├── types/
│   │   │   └── index.ts            # Auth types
│   │   ├── utils/
│   │   │   ├── validation.ts       # Auth validation
│   │   │   └── storage.ts          # Token storage
│   │   └── index.ts                # Feature exports
│   ├── workspaces/                 # Workspace Management
│   │   ├── api/
│   │   │   ├── workspaceApi.ts
│   │   │   ├── teamApi.ts
│   │   │   └── roleApi.ts
│   │   ├── hooks/
│   │   │   ├── useWorkspaces.ts
│   │   │   ├── useTeams.ts
│   │   │   └── useRoles.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── permissions.ts
│   │   │   └── validation.ts
│   │   └── index.ts
│   ├── active-tables/              # Active Tables (Core Data)
│   │   ├── api/
│   │   │   ├── tableApi.ts
│   │   │   ├── schemaApi.ts
│   │   │   └── recordApi.ts
│   │   ├── hooks/
│   │   │   ├── useActiveTables.ts
│   │   │   ├── useTableSchema.ts
│   │   │   ├── useTableRecords.ts
│   │   │   └── useTableActions.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── schemaBuilder.ts
│   │   │   ├── dataValidation.ts
│   │   │   └── encryption.ts
│   │   └── index.ts
│   ├── workflows/                  # Workflow Automation
│   │   ├── api/
│   │   │   ├── workflowApi.ts
│   │   │   ├── eventApi.ts
│   │   │   └── templateApi.ts
│   │   ├── hooks/
│   │   │   ├── useWorkflows.ts
│   │   │   ├── useWorkflowBuilder.ts
│   │   │   └── useWorkflowEvents.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── workflowEngine.ts
│   │   │   └── eventProcessor.ts
│   │   └── index.ts
│   ├── leads/                      # Lead Management
│   │   ├── api/
│   │   │   ├── leadApi.ts
│   │   │   ├── activityApi.ts
│   │   │   └── commentApi.ts
│   │   ├── hooks/
│   │   │   ├── useLeads.ts
│   │   │   ├── useLeadActivities.ts
│   │   │   └── useLeadComments.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── leadStatus.ts
│   │   │   └── activityTracking.ts
│   │   └── index.ts
│   └── connectors/                 # External System Integration
│       ├── api/
│       │   ├── connectorApi.ts
│       │   └── integrationApi.ts
│       ├── hooks/
│       │   ├── useConnectors.ts
│       │   └── useIntegrations.ts
│       ├── types/
│       │   └── index.ts
│       ├── utils/
│       │   ├── connectorConfig.ts
│       │   └── dataMapping.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. packages/ui/ - UI Components Library

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── primitives/             # Base shadcn/ui components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Dialog/
│   │   │   └── ...
│   │   ├── composite/              # Composite business components
│   │   │   ├── DataTable/
│   │   │   ├── FormBuilder/
│   │   │   ├── KanbanBoard/
│   │   │   ├── WorkspaceSwitcher/
│   │   │   └── UserMenu/
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── PageHeader/
│   │   │   └── MobileNav/
│   │   └── feedback/               # Feedback components
│   │       ├── Toast/
│   │       ├── Loading/
│   │       ├── EmptyState/
│   │       └── ErrorBoundary/
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   ├── components.css          # Component-specific styles
│   │   └── themes/                 # Theme configurations
│   │       ├── light.css
│   │       ├── dark.css
│   │       └── variables.css
│   ├── icons/                      # Custom SVG icons
│   ├── hooks/                      # UI-specific hooks
│   │   ├── useTheme.ts
│   │   ├── useMobile.ts
│   │   └── useKeyboardShortcuts.ts
│   └── utils/
│       ├── cn.ts                   # Class name utility
│       └── theme.ts                # Theme utilities
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### 3. packages/shared/ - Shared Utilities

```
packages/shared/
├── src/
│   ├── utils/
│   │   ├── date.ts                 # Date utilities
│   │   ├── string.ts               # String utilities
│   │   ├── number.ts               # Number utilities
│   │   ├── array.ts                # Array utilities
│   │   └── object.ts               # Object utilities
│   ├── constants/
│   │   ├── app.ts                  # App constants
│   │   ├── api.ts                  # API constants
│   │   └── validation.ts           # Validation constants
│   ├── validators/
│   │   ├── schema.ts               # Zod schemas
│   │   └── rules.ts                # Validation rules
│   └── helpers/
│       ├── storage.ts              # Local/Session storage helpers
│       ├── url.ts                  # URL utilities
│       └── crypto.ts               # Cryptography helpers
├── package.json
└── tsconfig.json
```

### 4. packages/types/ - Shared TypeScript Types

```
packages/types/
├── src/
│   ├── api/                        # API response/request types
│   │   ├── auth.ts
│   │   ├── workspace.ts
│   │   ├── active-table.ts
│   │   ├── workflow.ts
│   │   └── common.ts
│   ├── entities/                   # Domain entity types
│   │   ├── User.ts
│   │   ├── Workspace.ts
│   │   ├── ActiveTable.ts
│   │   └── Workflow.ts
│   ├── ui/                         # UI component types
│   │   ├── components.ts
│   │   └── props.ts
│   └── utils/                      # Utility types
│       ├── common.ts
│       └── helpers.ts
├── package.json
└── tsconfig.json
```

### 5. packages/config/ - Shared Configurations

```
packages/config/
├── src/
│   ├── env/
│   │   ├── development.ts
│   │   ├── production.ts
│   │   └── staging.ts
│   ├── api/
│   │   ├── endpoints.ts
│   │   └── client.ts
│   └── app/
│       ├── routes.ts
│       ├── features.ts
│       └── constants.ts
├── package.json
└── tsconfig.json
```

## Cấu trúc Applications

### 1. apps/web/ - Main CRM Application

```
apps/web/
├── src/
│   ├── pages/                      # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── workspaces/
│   │   │   ├── WorkspaceListPage.tsx
│   │   │   ├── WorkspaceDetailPage.tsx
│   │   │   └── WorkspaceSettingsPage.tsx
│   │   ├── active-tables/
│   │   │   ├── ActiveTableListPage.tsx
│   │   │   ├── ActiveTableDetailPage.tsx
│   │   │   └── TableRecordsPage.tsx
│   │   ├── workflows/
│   │   │   ├── WorkflowListPage.tsx
│   │   │   └── WorkflowBuilderPage.tsx
│   │   └── leads/
│   │       ├── LeadListPage.tsx
│   │       └── LeadDetailPage.tsx
│   ├── layouts/                    # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── PublicLayout.tsx
│   ├── routing/                    # Routing configuration
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.ts
│   ├── providers/                  # Context providers
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── hooks/                      # App-specific hooks
│   │   └── useAppNavigation.ts
│   └── utils/                      # App-specific utilities
│       └── navigation.ts
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 2. apps/admin/ - Admin Dashboard

```
apps/admin/
├── src/
│   ├── pages/
│   │   ├── system/
│   │   │   ├── UsersPage.tsx
│   │   │   ├── WorkspacesPage.tsx
│   │   │   └── SystemSettingsPage.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   └── monitoring/
│   │       ├── LogsPage.tsx
│   │       └── PerformancePage.tsx
│   ├── layouts/
│   │   └── AdminLayout.tsx
│   ├── routing/
│   │   ├── AdminRouter.tsx
│   │   └── routes.ts
│   └── providers/
│       └── AdminProviders.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 3. apps/landing/ - Landing Page & Marketing

```
apps/landing/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── FeaturesPage.tsx
│   │   ├── PricingPage.tsx
│   │   └── ContactPage.tsx
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── FeatureSection.tsx
│   │   └── PricingCard.tsx
│   ├── layouts/
│   │   └── LandingLayout.tsx
│   └── routing/
│       ├── LandingRouter.tsx
│       └── routes.ts
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Cấu hình Monorepo

### 1. pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

### 2. turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 3. Root package.json

```json
{
  "name": "beqeek-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "clean": "turbo run clean",
    "dev:web": "turbo run dev --filter=web",
    "dev:admin": "turbo run dev --filter=admin",
    "dev:landing": "turbo run dev --filter=landing",
    "build:web": "turbo run build --filter=web",
    "build:admin": "turbo run build --filter=admin",
    "build:landing": "turbo run build --filter=landing"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "@beqeek/eslint-config": "workspace:*",
    "@beqeek/typescript-config": "workspace:*"
  },
  "packageManager": "pnpm@8.6.0"
}
```

## Lợi ích của Kiến trúc

### 1. Feature-Oriented Structure
- **Feature-based Organization**: Tổ chức code theo tính năng, dễ hiểu và bảo trì
- **Clear Boundaries**: Ranh giới rõ ràng giữa các feature
- **Scalable**: Dễ thêm feature mới khi mở rộng tính năng

### 2. Code Reusability
- **Shared Components**: UI components tái sử dụng giữa các ứng dụng
- **Business Logic**: Logic nghiệp vụ chia sẻ, tránh duplicate code
- **Type Safety**: TypeScript types đồng nhất across applications

### 3. Development Experience
- **Fast Builds**: Turborepo caching và parallel execution
- **Hot Reload**: Vite HMR cho development experience tốt
- **Type Checking**: Incremental type checking với TypeScript project references
- **Linting**: Consistent code style với shared ESLint config

### 4. Team Collaboration
- **Clear Ownership**: Mỗi package có owner rõ ràng
- **Independent Development**: Teams có thể làm việc độc lập trên các packages
- **Consistent Standards**: Shared configurations đảm bảo consistency

### 5. Deployment & CI/CD
- **Selective Builds**: Chỉ build những gì thay đổi
- **Independent Deployments**: Deploy từng ứng dụng độc lập
- **Efficient Caching**: Turborepo cache tối ưu CI/CD pipeline

## Chiến lược Migration

### Phase 1: Setup Monorepo Structure (Tuần 1-2)
1. **Tạo cấu trúc thư mục** monorepo
2. **Cấu hình PNPM workspace** và Turborepo
3. **Setup shared configurations** (ESLint, TypeScript, Vite)
4. **Migrate existing app** vào `apps/web/`

### Phase 2: Extract Shared Packages (Tuần 3-4)
1. **Extract UI components** vào `packages/ui/`
2. **Extract feature logic** vào `packages/features/`
3. **Extract shared utilities** vào `packages/shared/`
4. **Extract TypeScript types** vào `packages/types/`

### Phase 3: Optimize & Test (Tuần 5-6)
1. **Optimize build performance** với Turborepo
2. **Setup testing infrastructure**
3. **Implement CI/CD pipeline**
4. **Performance testing** và optimization

### Phase 4: Scale & Expand (Tuần 7-8)
1. **Develop admin application** (`apps/admin/`)
2. **Develop landing page** (`apps/landing/`)
3. **Add new features** khi cần
4. **Documentation** và training

## Kết luận

Kiến trúc monorepo này sẽ giúp dự án BEQEEK:

- **Maintainable**: Dễ bảo trì với cấu trúc rõ ràng theo tính năng
- **Scalable**: Dễ mở rộng khi thêm ứng dụng và tính năng mới
- **Developer-Friendly**: Trải nghiệm phát triển tốt với tooling hiện đại
- **Feature-Aligned**: Cấu trúc code phản ánh đúng các tính năng sản phẩm

Đây là nền tảng vững chắc để BEQEEK phát triển thành một platform Low-Code/No-Code mạnh mẽ, phục vụ tốt thị trường Việt Nam với yêu cầu bảo mật cao và khả năng tùy chỉnh linh hoạt.
