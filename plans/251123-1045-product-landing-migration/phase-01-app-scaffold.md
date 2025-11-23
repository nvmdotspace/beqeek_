# Phase 1: App Scaffold

**Parent:** [plan.md](./plan.md)
**Dependencies:** None
**Docs:** [vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg)

---

## Overview

| Field                 | Value                                            |
| --------------------- | ------------------------------------------------ |
| Date                  | 2025-11-23                                       |
| Description           | Create `apps/landing` with Vite + React 19 + SSG |
| Priority              | High                                             |
| Implementation Status | **Completed**                                    |
| Review Status         | Pending Review                                   |

## Key Insights

- vite-react-ssg uses React Router for route detection during SSG
- Separate app avoids TanStack Router SSG conflicts
- Can share UI package via Turborepo workspace
- Use same Node.js/pnpm versions as main web app

## Requirements

1. Create `apps/landing` directory structure
2. Configure Vite with React 19 + TailwindCSS v4
3. Set up vite-react-ssg for pre-rendering
4. Configure Turborepo tasks
5. Verify `pnpm dev` and `pnpm build` work

## Architecture

```
apps/landing/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── index.html
├── public/
│   ├── favicon.svg
│   └── assets/
│       └── saas_multiview_dashboard.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   └── index.css
    └── pages/
        └── index.tsx
```

## Related Code Files

- `apps/web/package.json` - reference for dependencies
- `apps/web/vite.config.ts` - reference for Vite config
- `packages/ui/package.json` - UI dependency
- `turbo.json` - task configuration

## Implementation Steps

### 1.1 Create directory and package.json

```bash
mkdir -p apps/landing/src/{pages,styles,components}
mkdir -p apps/landing/public/assets
```

```json
// apps/landing/package.json
{
  "name": "landing",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite-react-ssg build",
    "preview": "vite preview",
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.1.3",
    "@workspace/ui": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.5.2",
    "@workspace/eslint-config": "workspace:*",
    "@workspace/typescript-config": "workspace:*",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.11",
    "typescript": "^5.9.2",
    "vite": "^6.3.5",
    "vite-react-ssg": "^0.8.0"
  }
}
```

### 1.2 Create vite.config.ts

```typescript
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 4174,
    strictPort: true,
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
```

### 1.3 Create TypeScript config

```json
// apps/landing/tsconfig.json
{
  "extends": "@workspace/typescript-config/vite.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 Create postcss.config.mjs

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### 1.5 Create entry files

```html
<!-- apps/landing/index.html -->
<!DOCTYPE html>
<html lang="vi" class="dark scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>BEQEEK - Phần Mềm SaaS Tùy Chỉnh Hiện Đại</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```typescript
// apps/landing/src/main.tsx
import { ViteReactSSG } from 'vite-react-ssg';
import App from './App';
import './styles/index.css';

export const createRoot = ViteReactSSG({ routes: [{ path: '/', element: <App /> }] });
```

```css
/* apps/landing/src/styles/index.css */
@import '@workspace/ui/globals.css';

/* Landing page specific overrides */
body {
  background-color: hsl(222 47% 7%);
  color: hsl(210 40% 98%);
  overflow-x: hidden;
}
```

### 1.6 Copy static assets

```bash
cp apps/product-page/favicon.svg apps/landing/public/
cp apps/product-page/assets/* apps/landing/public/assets/
```

### 1.7 Update turbo.json (if needed)

No changes required - existing `build`, `dev`, `lint` tasks auto-detect new app.

## Todo List

- [ ] Create directory structure
- [ ] Write package.json with deps
- [ ] Create vite.config.ts
- [ ] Create tsconfig.json
- [ ] Create postcss.config.mjs
- [ ] Create index.html entry
- [ ] Create main.tsx with SSG setup
- [ ] Create index.css importing design tokens
- [ ] Copy static assets
- [ ] Run `pnpm install` from root
- [ ] Verify `pnpm --filter landing dev` works
- [ ] Verify `pnpm --filter landing build` generates static HTML

## Success Criteria

- [ ] Dev server runs on localhost:4174
- [ ] Build outputs static HTML files in `dist/`
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Design tokens from `@workspace/ui` load correctly

## Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation               |
| ----------------------------- | ---------- | ------ | ------------------------ |
| vite-react-ssg version issues | Low        | Medium | Pin to 0.8.0, test build |
| CSS import conflicts          | Medium     | Low    | Use separate entry CSS   |
| Turborepo cache issues        | Low        | Low    | Clear .turbo cache       |

## Security Considerations

- No auth/sensitive data on landing page
- External iframe URL for signup form (keep as-is)
- Clarity tracking script should be added via component

## Next Steps

After Phase 1 complete → [Phase 2: Design System Integration](./phase-02-design-system.md)
