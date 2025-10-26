# Beqeek Monorepo (React 19, Vite, Tailwind v4, shadcn/ui)

Monorepo sử dụng Turborepo + PNPM cho ứng dụng web React, tích hợp TailwindCSS v4, shadcn/ui và i18n qua Paraglide.

## Yêu cầu môi trường

- Node `>=22`
- PNPM `10.x`

## Cài đặt & chạy

- Cài đặt dependencies ở thư mục gốc:

```bash
pnpm install
```

- Chạy development toàn monorepo:

```bash
pnpm dev
```

- Hoặc chỉ app web (từ thư mục app):

```bash
pnpm -C apps/web dev
```

- Build toàn monorepo:

```bash
pnpm build
```

- Preview app web sau khi build:

```bash
pnpm -C apps/web preview
```

## Cấu trúc chi tiết

```
beqeek/
├── apps/                          # Applications
│   ├── web/                       # Ứng dụng web chính (Vite + React 19)
│   │   ├── src/
│   │   │   ├── components/        # Shared components (layout, error boundaries, etc.)
│   │   │   ├── features/          # Feature modules
│   │   │   │   ├── auth/         # Authentication (login, logout, stores)
│   │   │   │   └── workspace/    # Workspace management
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── providers/        # React providers (theme, app context)
│   │   │   ├── routes/           # TanStack Router file-based routes
│   │   │   ├── shared/           # Shared utilities and API clients
│   │   │   ├── stores/           # Global state (Zustand)
│   │   │   ├── main.tsx         # App entry point
│   │   │   └── router.tsx        # Router configuration
│   │   ├── public/               # Static assets
│   │   ├── package.json
│   │   ├── vite.config.ts        # Vite configuration
│   │   └── components.json       # shadcn/ui configuration
│   ├── admin/                     # Admin application (placeholder)
│   └── product-page/              # Product page application (placeholder)
│
├── packages/                       # Shared packages
│   ├── ui/                       # UI component library
│   │   ├── src/
│   │   │   ├── components/       # shadcn/ui components
│   │   │   ├── lib/
│   │   │   │   └── utils.ts      # Utility functions (cn, etc.)
│   │   │   └── styles/
│   │   │       └── globals.css   # Global TailwindCSS styles
│   │   ├── components.json       # shadcn/ui configuration
│   │   └── postcss.config.mjs    # PostCSS/TailwindCSS v4 config
│   ├── active-tables-core/       # Core Active Tables logic
│   ├── active-tables-hooks/       # React hooks for Active Tables
│   ├── encryption-core/           # Encryption utilities
│   ├── eslint-config/            # Shared ESLint configuration
│   │   ├── base.js               # Base ESLint config
│   │   ├── next.js               # Next.js specific config
│   │   └── react-internal.js     # React internal config
│   └── typescript-config/        # Shared TypeScript configuration
│       ├── base.json             # Base TypeScript config
│       ├── nextjs.json           # Next.js specific config
│       └── react-library.json    # React library config
│
├── docs/                         # Documentation
│   ├── design-system.md          # Design system documentation
│   ├── feature-*.md              # Feature specifications
│   │   ├── feature-auth.md
│   │   ├── feature-workspaces.md
│   │   ├── feature-active-tables.md
│   │   └── feature-workflow-*.md
│   ├── monorepo-architecture-proposal.md
│   ├── react-active-tables-plan.md
│   ├── roadmap.md
│   └── swagger.yaml              # API documentation
│
├── project.inlang/               # Parag.js i18n configuration
├── paraglide.config.js           # Paraglide.js configuration
├── messages/                     # Translation strings
├── turbo.json                    # Turborepo configuration
├── pnpm-workspace.yaml           # PNPM workspace configuration
├── package.json                  # Root package configuration
└── tsconfig.json                 # Root TypeScript configuration
```

## UI Components (packages/ui)

- Import styles toàn cục:

```ts
import "@workspace/ui/globals.css"
```

- Import component ví dụ:

```tsx
import { Button } from "@workspace/ui/components/button"
```

- Thêm component từ shadcn/ui vào app web:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Thành phần sẽ được đồng bộ hoá sang `packages/ui/src/components` theo cấu hình xuất của package.

## TailwindCSS v4

- Đã cấu hình PostCSS/Tailwind v4 trong `apps/web` và `packages/ui`
- Sử dụng cơ chế "explicit sources" của Tailwind v4 theo tài liệu chính thức

## i18n (Paraglide)

- Plugin Paraglide đã bật trong `apps/web/vite.config.ts`
- Chuỗi dịch nằm trong `messages/` và được phát sinh vào `apps/web/src/paraglide/generated`

## Router (TanStack)

- Export `router` từ `apps/web/src/router.tsx`:

```ts
import { createRouter } from '@tanstack/react-router'
// ...
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

- Sử dụng `RouterProvider` trong `apps/web/src/main.tsx`:

```tsx
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

// ...
<RouterProvider router={router} />
```

## Scripts hữu ích

- `pnpm dev` — chạy dev pipeline toàn repo (Turbo)
- `pnpm build` — build toàn repo
- `pnpm -C apps/web dev` — chạy dev riêng app web
- `pnpm -C apps/web preview` — preview app web
- `pnpm lint` — lint toàn repo
- `pnpm format` — format `ts/tsx/md`

## Hướng dẫn đóng góp

Xem thêm: [AGENTS.md](AGENTS.md) để biết quy ước cấu trúc, câu lệnh và conventions khi tạo PR.

## Tài nguyên tham khảo

- shadcn/ui — Monorepo: https://ui.shadcn.com/docs/monorepo
- Turborepo: https://turbo.build/repo/docs
- TailwindCSS v4: https://tailwindcss.com/docs
- Paraglide (inlang): https://www.inlang.com/m/gercan/paraglide-js
