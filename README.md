# Beqeek Monorepo (React 19, Vite, Tailwind v4, shadcn/ui)

Monorepo sử dụng Turborepo + PNPM cho ứng dụng web React, tích hợp TailwindCSS v4, shadcn/ui và i18n qua Paraglide.

## Yêu cầu môi trường

- Node `>=22`
- PNPM `10.x`

## Cài đặt & chạy

### Cài đặt dependencies

Cài đặt dependencies cho toàn bộ monorepo từ thư mục gốc:

```bash
pnpm install
```

### Development

#### Chạy toàn bộ monorepo (khuyến nghị)

```bash
pnpm dev
```

Lệnh này sẽ:
- Compile i18n messages (Paraglide)
- Chạy development server cho tất cả apps
- Tự động reload khi có thay đổi

#### Chạy từng app riêng lẻ

**App Web chính:**
```bash
# Từ thư mục gốc
pnpm --filter web dev

# Hoặc từ thư mục app
cd apps/web && pnpm dev

# Chạy với host cụ thể (nếu cần)
pnpm --filter web dev -- --host 127.0.0.1
```

**App Admin (khi có):**
```bash
pnpm --filter admin dev
```

**Product Page App (khi có):**
```bash
pnpm --filter product-page dev
```

### Production Build

#### Build toàn bộ monorepo

```bash
pnpm build
```

Lệnh này sẽ:
1. Compile i18n messages
2. Build tất cả packages theo thứ tự dependency
3. Build tất cả applications

#### Build từng app riêng lẻ

**App Web:**
```bash
# Build app web và dependencies
pnpm --filter web build

# Hoặc từ thư mục app
cd apps/web && pnpm build
```

**Build packages riêng:**
```bash
# Build UI package
pnpm --filter @workspace/ui build

# Build core packages
pnpm --filter @workspace/active-tables-core build
pnpm --filter @workspace/encryption-core build
```

#### Preview sau khi build

**Preview app web:**
```bash
# Từ thư mục gốc
pnpm --filter web preview

# Hoặc từ thư mục app
cd apps/web && pnpm preview
```

#### Deployment Production

**Build optimized cho production:**
```bash
# Set NODE_ENV và build
NODE_ENV=production pnpm build

# Hoặc chỉ app web
NODE_ENV=production pnpm --filter web build
```

**Kiểm tra build output:**
```bash
# Kiểm tra kích thước bundle
ls -la apps/web/dist/

# Preview production build
pnpm --filter web preview
```

**4. Docker deployment:**

Dự án đã bao gồm các file cấu hình Docker sẵn sàng:

```bash
# Build Docker image
docker build -t beqeek-web .

# Chạy container đơn giản
docker run -p 3000:80 beqeek-web

# Chạy với docker-compose (khuyến nghị)
docker-compose up -d

# Chạy với nginx proxy (cho production)
docker-compose --profile proxy up -d

# Xem logs
docker-compose logs -f web

# Stop services
docker-compose down
```

**Cấu trúc Docker files:**
- `Dockerfile.web` - Multi-stage build cho production
- `compose.yml` - Container orchestration
- `.dockerignore` - Loại trừ files không cần thiết

## 🚀 Script Deployment Tự động

Dự án bao gồm script `deploy.sh` để tự động hóa quá trình deployment:

```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x deploy.sh

# Deploy với Docker
./deploy.sh docker

# Chạy local preview
./deploy.sh local

# Xem hướng dẫn
./deploy.sh --help
```

**Tính năng của script:**
- ✅ Kiểm tra prerequisites tự động
- ✅ Install dependencies
- ✅ Build application
- ✅ Health checks
- ✅ Error handling và logging
- ✅ Docker deployment support
- ✅ Colored output cho dễ đọc

**Files deployment đã tạo:**
- `Dockerfile.web` - Multi-stage production build
- `compose.yml` - Container orchestration
- `.dockerignore` - Optimize Docker build
- `deploy.sh` - Automated deployment script
- `DEPLOYMENT.md` - Chi tiết hướng dẫn deployment

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

### Development
- `pnpm dev` — chạy dev pipeline toàn repo (Turbo)
- `pnpm --filter web dev` — chạy dev riêng app web
- `pnpm --filter admin dev` — chạy dev app admin
- `pnpm --filter product-page dev` — chạy dev product page

### Build & Preview
- `pnpm build` — build toàn repo
- `pnpm --filter web build` — build riêng app web
- `pnpm --filter web preview` — preview app web sau build
- `NODE_ENV=production pnpm build` — build optimized cho production

### Code Quality
- `pnpm lint` — lint toàn repo
- `pnpm --filter web lint` — lint riêng app web
- `pnpm --filter web check-types` — type check app web
- `pnpm format` — format `ts/tsx/md`

### i18n
- `pnpm machine-translate` — dịch tự động các message

## Hướng dẫn đóng góp

Xem thêm: [AGENTS.md](AGENTS.md) để biết quy ước cấu trúc, câu lệnh và conventions khi tạo PR.

## Tài nguyên tham khảo

- shadcn/ui — Monorepo: https://ui.shadcn.com/docs/monorepo
- Turborepo: https://turbo.build/repo/docs
- TailwindCSS v4: https://tailwindcss.com/docs
- Paraglide (inlang): https://www.inlang.com/m/gercan/paraglide-js
