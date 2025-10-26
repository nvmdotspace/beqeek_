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

## Cấu trúc chính

- `apps/web` — Ứng dụng web (Vite)
- `packages/ui` — Thư viện UI (shadcn/ui, styles, hooks)
- `packages/active-tables-core` — Core logic cho Active Tables
- `packages/active-tables-hooks` — Hooks cho Active Tables
- `packages/encryption-core` — Mã hoá và tiện ích liên quan
- `docs/` — Tài liệu kiến trúc & đặc tả tính năng
- `project.inlang/` + `paraglide.config.js` — Cấu hình i18n (Paraglide)

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
