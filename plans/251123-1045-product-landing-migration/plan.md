# Product Landing Page Migration Plan

**Date:** 2025-11-23
**Status:** In Progress
**Branch:** `feature/landing-page`

## Overview

Migrate `apps/product-page/index.html` to React 19 with SSG for SEO support, preserving existing dark theme design that matches login page.

## Research Summary

Full SSR unnecessary for static landing page. **Recommended: vite-react-ssg** for simple pre-rendering with React Router.

| Option              | Effort | Risk   | TanStack Router       |
| ------------------- | ------ | ------ | --------------------- |
| react-snap          | Low    | Low    | Compatible            |
| Vike (separate app) | Medium | Medium | N/A - own routing     |
| **vite-react-ssg**  | Low    | Low    | Requires React Router |

**Decision:** Create separate `apps/landing` with vite-react-ssg + React Router (simple landing routes don't need TanStack's advanced features).

## Implementation Phases

| Phase | Name                      | Status        | Progress | Link                                                                 |
| ----- | ------------------------- | ------------- | -------- | -------------------------------------------------------------------- |
| 1     | App Scaffold              | **Completed** | 100%     | [phase-01-app-scaffold.md](./phase-01-app-scaffold.md)               |
| 2     | Design System Integration | Pending       | 0%       | [phase-02-design-system.md](./phase-02-design-system.md)             |
| 3     | Component Migration       | Pending       | 0%       | [phase-03-component-migration.md](./phase-03-component-migration.md) |
| 4     | SEO & Metadata            | Pending       | 0%       | [phase-04-seo-metadata.md](./phase-04-seo-metadata.md)               |
| 5     | Build & Deploy            | Pending       | 0%       | [phase-05-build-deploy.md](./phase-05-build-deploy.md)               |

## Key Architecture Decisions

1. **Separate App:** `apps/landing` independent from `apps/web` for cleaner SEO setup
2. **SSG Tool:** vite-react-ssg for pre-rendering at build time
3. **Routing:** React Router (simpler, SSG-compatible) - landing doesn't need TanStack features
4. **Styles:** Import `@workspace/ui/globals.css` for design token consistency
5. **Dark Mode:** Hardcode `dark` class - landing page is dark-only (matches login)

## Success Criteria

- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Performance score ≥ 90
- [ ] Design pixel-perfect match with current HTML
- [ ] Meta tags / Open Graph working
- [ ] Build integrates with Turborepo pipeline

## Related Files

- Source: `apps/product-page/index.html`
- Target: `apps/landing/`
- Reference: `apps/web/src/features/auth/pages/login-page.tsx`
- Research: `docs/research/251123-ssr-seo-options-vite-react19.md`
