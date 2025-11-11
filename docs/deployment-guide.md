# Deployment Guide

## Prerequisites

### System Requirements

- **Node.js**: >= 22
- **PNPM**: 10.x
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 2GB for dependencies + build artifacts
- **OS**: Linux, macOS, Windows (WSL2)

### Environment Variables

Create `.env` files in `apps/web/`:

```bash
# apps/web/.env.local (development)
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development

# apps/web/.env.production (production)
VITE_API_URL=https://api.beqeek.com
VITE_APP_ENV=production
```

## Local Development

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Access application
# http://localhost:4173
```

### Feature Development

```bash
# Run specific app
pnpm --filter web dev

# Run with custom host
pnpm --filter web dev -- --host 127.0.0.1

# Watch specific package
pnpm --filter @workspace/ui dev
```

### Code Quality Checks

```bash
# Before committing
pnpm lint              # ESLint
pnpm format            # Prettier
pnpm --filter web check-types  # TypeScript
pnpm build             # Verify build succeeds
```

## Production Build

### Build Process

```bash
# 1. Clean previous builds (optional)
rm -rf apps/web/dist packages/*/dist

# 2. Build entire monorepo
NODE_ENV=production pnpm build

# Build output:
# - apps/web/dist/         (~2.5MB uncompressed)
# - packages/ui/dist/
# - packages/*/dist/
```

### Build Optimization

**Vite Configuration** (apps/web/vite.config.ts):

```typescript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor splitting for optimal caching
          if (id.includes('react')) return 'react';
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('@tanstack')) return 'tanstack';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
        },
      },
    },
  },
});
```

### Preview Production Build

```bash
# Preview locally
pnpm --filter web preview

# Access at http://localhost:4173
```

## Docker Deployment

### Using Docker Compose (Recommended)

**Quick Start**:

```bash
# 1. Build and start
docker-compose up -d

# 2. Check logs
docker-compose logs -f web

# 3. Stop services
docker-compose down
```

**Production with Nginx**:

```bash
# Start with nginx reverse proxy
docker-compose --profile proxy up -d

# Access via http://localhost (port 80)
```

### Docker Files Overview

**Dockerfile.web** (Multi-stage build):

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN npm install -g pnpm@10
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_ENV=production pnpm build

# Stage 3: Production
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

**compose.yml**:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - '3000:80'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    profiles: [proxy]
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web
```

### Manual Docker Build

```bash
# Build image
docker build -f Dockerfile.web -t beqeek-web:latest .

# Run container
docker run -d \
  -p 3000:80 \
  --name beqeek-web \
  --env-file apps/web/.env.production \
  beqeek-web:latest

# Check logs
docker logs -f beqeek-web

# Stop container
docker stop beqeek-web
docker rm beqeek-web
```

## Deployment Script

### Automated Deployment

```bash
# Make executable
chmod +x deploy.sh

# Deploy options
./deploy.sh docker    # Docker deployment
./deploy.sh local     # Local preview
./deploy.sh --help    # Show help
```

**Script Features**:

- Prerequisites checking (Node, PNPM, Docker)
- Dependency installation
- Production build
- Docker image creation
- Health checks
- Error handling with colored output

## Cloud Deployment

### Vercel (Frontend Only)

**Setup**:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd apps/web
vercel --prod
```

**vercel.json** (in apps/web/):

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install --filter web",
  "env": {
    "VITE_API_URL": "@api-url"
  }
}
```

### AWS S3 + CloudFront

```bash
# 1. Build production
NODE_ENV=production pnpm --filter web build

# 2. Sync to S3
aws s3 sync apps/web/dist/ s3://your-bucket/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Build
NODE_ENV=production pnpm build

# 3. Deploy
netlify deploy --prod --dir=apps/web/dist
```

**netlify.toml** (in root):

```toml
[build]
  command = "pnpm build"
  publish = "apps/web/dist"
  base = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Environment Configuration

### Development (.env.local)

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development
VITE_ENABLE_DEVTOOLS=true
```

### Staging (.env.staging)

```bash
VITE_API_URL=https://api-staging.beqeek.com
VITE_APP_ENV=staging
VITE_ENABLE_DEVTOOLS=true
```

### Production (.env.production)

```bash
VITE_API_URL=https://api.beqeek.com
VITE_APP_ENV=production
VITE_ENABLE_DEVTOOLS=false
```

## Health Checks

### Application Health

```bash
# Check if app is running
curl http://localhost:3000

# Expected: HTML response with status 200
```

### Docker Health

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' beqeek-web

# Expected: "healthy"

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' beqeek-web
```

## Monitoring & Logging

### Docker Logs

```bash
# Real-time logs
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 web

# Logs since timestamp
docker-compose logs --since="2025-01-01T00:00:00" web
```

### Application Logs

```bash
# Development console logs
# Accessible via browser DevTools

# Production logs (if using logging service)
# Example: Datadog, Sentry, CloudWatch
```

### Error Tracking

**Recommended Tools**:

- **Sentry**: Error tracking & performance monitoring
- **LogRocket**: Session replay & debugging
- **Datadog**: APM & infrastructure monitoring

## Performance Optimization

### Build Optimizations

1. **Code Splitting**: Automatic via Vite (route-based)
2. **Tree Shaking**: Enabled in production mode
3. **Minification**: Terser for JS, cssnano for CSS
4. **Compression**: Enable gzip/brotli in nginx
5. **Asset Optimization**: Image optimization, lazy loading

### Nginx Configuration

```nginx
# /etc/nginx/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 256;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

## Rollback Strategy

### Docker Rollback

```bash
# Tag builds with version
docker build -t beqeek-web:v1.2.0 .

# Keep previous versions
docker tag beqeek-web:v1.2.0 beqeek-web:latest

# Rollback to previous version
docker run -d -p 3000:80 beqeek-web:v1.1.0
```

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Security Checklist

Pre-deployment security review:

- [ ] Environment variables not committed to git
- [ ] HTTPS enforced in production
- [ ] API keys stored securely
- [ ] CORS configured correctly
- [ ] Security headers enabled (nginx)
- [ ] Dependencies updated (no critical vulnerabilities)
- [ ] Rate limiting configured (backend)
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens validated (backend)

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules .turbo apps/web/dist packages/*/dist
pnpm install
pnpm build
```

### Docker Image Too Large

```bash
# Check image size
docker images beqeek-web

# Multi-stage build already optimized
# Expected size: ~100MB (nginx:alpine + assets)

# Further optimization:
# 1. Reduce unused dependencies
# 2. Optimize images (WebP, compression)
# 3. Remove dev dependencies from prod build
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:80 beqeek-web
```

### Memory Issues

```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Docker memory limit
docker run --memory="2g" beqeek-web
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: NODE_ENV=production pnpm build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Post-Deployment

### Verification Checklist

- [ ] Application accessible via production URL
- [ ] All routes working (especially dynamic routes)
- [ ] Login/logout functioning
- [ ] API requests successful
- [ ] i18n working (vi, en)
- [ ] Dark mode toggle working
- [ ] Mobile responsive
- [ ] Performance acceptable (Lighthouse score > 90)
- [ ] No console errors
- [ ] Analytics tracking (if configured)

### Monitoring Setup

1. **Uptime Monitoring**: Pingdom, UptimeRobot, StatusCake
2. **Error Tracking**: Sentry, Bugsnag
3. **Analytics**: Google Analytics, Plausible
4. **Performance**: Web Vitals, Lighthouse CI

## Support & Maintenance

### Regular Maintenance

**Weekly**:

- Review error logs
- Check uptime metrics
- Monitor performance

**Monthly**:

- Update dependencies (`pnpm update`)
- Security audit (`pnpm audit`)
- Review disk usage
- Backup verification

**Quarterly**:

- Major dependency updates
- Performance optimization review
- Security penetration testing
- Disaster recovery drill

### Emergency Contacts

- **DevOps Lead**: [Contact info]
- **Backend Team**: [Contact info]
- **On-Call Rotation**: [Schedule link]

## Additional Resources

- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Nginx Config Generator**: https://www.digitalocean.com/community/tools/nginx
- **Vercel Docs**: https://vercel.com/docs
