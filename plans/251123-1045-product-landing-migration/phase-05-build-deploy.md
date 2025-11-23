# Phase 5: Build & Deploy

**Parent:** [plan.md](./plan.md)
**Dependencies:** [Phase 4](./phase-04-seo-metadata.md)
**Docs:** [Turborepo Build](https://turbo.build/repo/docs/core-concepts/caching)

---

## Overview

| Field                 | Value                                                |
| --------------------- | ---------------------------------------------------- |
| Date                  | 2025-11-23                                           |
| Description           | Configure build, test SSG output, prepare deployment |
| Priority              | High                                                 |
| Implementation Status | Pending                                              |
| Review Status         | Not Started                                          |

## Key Insights

- vite-react-ssg generates static files in `dist/`
- Output can be deployed to any static host (Vercel, Cloudflare Pages, S3)
- Turborepo caching should work normally
- Need to verify HTML output contains pre-rendered content

## Requirements

1. Verify SSG build produces static HTML with content
2. Test Lighthouse scores (SEO, Performance)
3. Configure production build optimizations
4. Document deployment options
5. Integrate with existing CI/CD if applicable

## Architecture

### Build Output Structure

```
apps/landing/dist/
├── index.html          # Pre-rendered with full HTML content
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── favicon.svg
├── og-image.png
├── robots.txt
├── sitemap.xml
└── assets/
    └── saas_multiview_dashboard.png
```

### Deployment Options

| Platform            | Cost        | Features                            | Recommended       |
| ------------------- | ----------- | ----------------------------------- | ----------------- |
| Vercel              | Free tier   | Auto SSL, Edge CDN, Preview deploys | Yes               |
| Cloudflare Pages    | Free tier   | Global CDN, Workers                 | Yes               |
| AWS S3 + CloudFront | Pay-as-use  | Full control                        | Enterprise        |
| Self-hosted Nginx   | Server cost | Full control                        | If existing infra |

## Related Code Files

- `turbo.json` - task configuration
- `apps/landing/vite.config.ts` - build config
- `apps/landing/package.json` - build scripts

## Implementation Steps

### 5.1 Update package.json build script

```json
// apps/landing/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite-react-ssg build",
    "preview": "vite preview",
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  }
}
```

### 5.2 Configure vite.config.ts for production

```typescript
// apps/landing/vite.config.ts
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
    // Optimize for production
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let SSG handle chunking
      },
    },
  },
  // SSG configuration
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    crittersOptions: {
      // Inline critical CSS
      preload: 'swap',
      pruneSource: true,
    },
  },
});
```

### 5.3 Verify SSG output

```bash
# Build the landing page
pnpm --filter landing build

# Check output
cat apps/landing/dist/index.html | head -100

# Should see:
# - Full HTML content (not just <div id="root"></div>)
# - Meta tags pre-rendered
# - JSON-LD scripts
```

### 5.4 Test with Lighthouse

```bash
# Start preview server
pnpm --filter landing preview

# Run Lighthouse (via Chrome DevTools or CLI)
npx lighthouse http://localhost:4174 --view
```

Target scores:

- Performance: ≥ 90
- SEO: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90

### 5.5 Vercel deployment config

```json
// apps/landing/vercel.json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=landing",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### 5.6 Cloudflare Pages config

```toml
# apps/landing/wrangler.toml (optional)
name = "beqeek-landing"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
```

### 5.7 Docker deployment (optional)

```dockerfile
# apps/landing/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/landing ./apps/landing
COPY packages ./packages
COPY turbo.json ./

RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=landing

# Production image
FROM nginx:alpine

COPY --from=builder /app/apps/landing/dist /usr/share/nginx/html
COPY apps/landing/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# apps/landing/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml;

        # Cache static assets
        location /assets {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

### 5.8 GitHub Actions CI (optional)

```yaml
# .github/workflows/landing-deploy.yml
name: Deploy Landing Page

on:
  push:
    branches: [main]
    paths:
      - 'apps/landing/**'
      - 'packages/ui/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm turbo build --filter=landing

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: beqeek-landing
          directory: apps/landing/dist
```

## Todo List

- [ ] Update package.json build script
- [ ] Configure vite.config.ts for production
- [ ] Run build and verify output
- [ ] Check dist/index.html has pre-rendered content
- [ ] Run Lighthouse audit
- [ ] Fix any performance issues
- [ ] Create vercel.json (if using Vercel)
- [ ] Create deployment docs
- [ ] Test production build locally with preview
- [ ] Deploy to staging environment

## Success Criteria

- [ ] `pnpm --filter landing build` succeeds
- [ ] dist/index.html contains full page content
- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Performance score ≥ 90
- [ ] No console errors in production build
- [ ] Assets properly cached
- [ ] Deployment successful

## Risk Assessment

| Risk               | Likelihood | Impact | Mitigation                 |
| ------------------ | ---------- | ------ | -------------------------- |
| SSG build fails    | Low        | High   | Test incrementally         |
| Large bundle size  | Medium     | Medium | Check with visualizer      |
| Hydration errors   | Low        | High   | Check client/server parity |
| Cache invalidation | Low        | Medium | Use hashed asset names     |

## Security Considerations

- Security headers configured for production
- No sensitive data in static files
- HTTPS enforced by hosting provider
- iframe src uses HTTPS

## Unresolved Questions

1. **Domain:** Will landing be at beqeek.com or landing.beqeek.com?
2. **CDN:** Which CDN provider preferred?
3. **CI/CD:** Integrate with existing pipeline or separate?
4. **Monitoring:** Add performance monitoring (Web Vitals)?

## Next Steps

After Phase 5 complete:

1. Create PR for review
2. Deploy to staging
3. QA visual testing
4. Deploy to production
5. Delete old `apps/product-page/` directory
