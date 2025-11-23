# SSR/SEO Options for Vite + React 19 in Turborepo

**Date:** 2025-11-23
**Status:** Research Complete
**Context:** Product landing page for Beqeek workflow platform

---

## Executive Summary

For a **product landing page needing SEO**, **Static Site Generation (SSG) / Pre-rendering** is recommended over full SSR. The landing page content is static/semi-static, making SSG the optimal choice for:

- Best performance (no server required)
- Full SEO support (crawlable HTML, meta tags, Open Graph)
- Simple deployment (static hosting)
- Minimal changes to existing Vite + TanStack Router setup

**Recommended:** Use **Vike (vite-plugin-ssr)** with pre-rendering enabled for landing pages only.

---

## Options Comparison

### 1. Vike (formerly vite-plugin-ssr)

**Status:** Production-ready, actively maintained (last npm update: Nov 2025)

| Aspect          | Details                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| React 19        | Supported via [vike-react](https://www.npmjs.com/package/vike-react) (v0.6.13) |
| SSR + SSG       | Both supported; selective pre-rendering per route                              |
| Turborepo       | Compatible; standard Vite plugin                                               |
| TanStack Router | Requires migration or parallel routing system                                  |

**Pros:**

- Mature ecosystem with official integrations (vike-react-query, vike-react-zustand)
- Selective pre-rendering: `/landing` = SSG, `/app/*` = SPA
- HTML streaming support
- Deploy anywhere (static + Node.js)

**Cons:**

- Requires separate routing from TanStack Router
- Learning curve for Vike's file-based conventions
- Some configuration overhead

**References:**

- [Vike Official](https://vike.dev/)
- [Pre-rendering docs](https://vike.dev/pre-rendering)
- [vike-react npm](https://www.npmjs.com/package/vike-react)

---

### 2. Manual SSR with @vitejs/plugin-react

**Status:** Stable but requires custom implementation

| Aspect          | Details                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| React 19        | Full support                                                                               |
| Complexity      | High - manual SSR setup required                                                           |
| Turborepo       | Compatible                                                                                 |
| TanStack Router | [Known issues](https://github.com/TanStack/router/discussions/1995) with SSR deduplication |

**Pros:**

- Full control over SSR implementation
- No additional framework dependencies
- Works with existing TanStack Router (with effort)

**Cons:**

- Significant development time (~2-4 weeks for production-ready)
- Must handle: hydration, streaming, data fetching, error boundaries
- Maintenance burden

**Reference:** [Vite SSR Guide](https://vite.dev/guide/ssr)

---

### 3. React Server Components (RSC)

**Status:** Experimental - NOT production-ready

| Aspect       | Details                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| React 19     | Native support                                                                            |
| Vite Support | [@vitejs/plugin-rsc](https://www.npmjs.com/package/@vitejs/plugin-rsc) - **EXPERIMENTAL** |
| Stability    | Unstable APIs, subject to change                                                          |

**Pros:**

- Future-proof architecture
- Best performance potential (selective hydration)

**Cons:**

- **Not recommended for production use in 2025**
- Experimental Vite plugin
- Requires React Router v7 with unstable templates
- Deep expertise required

**References:**

- [Vite RSC Discussion](https://github.com/vitejs/vite/discussions/4591)
- [React Router RSC Preview](https://remix.run/blog/rsc-preview)

---

### 4. SSG / Pre-rendering (RECOMMENDED for Landing Pages)

**Options:**

#### A. vite-react-ssg

| Aspect          | Details                                         |
| --------------- | ----------------------------------------------- |
| React 19        | Compatible                                      |
| TanStack Router | **Not directly compatible** - uses React Router |
| Use Case        | Best with React Router v6/v7                    |

**Reference:** [vite-react-ssg GitHub](https://github.com/Daydreamer-riri/vite-react-ssg)

#### B. react-snap (Framework Agnostic)

| Aspect          | Details                        |
| --------------- | ------------------------------ |
| React 19        | Compatible (uses Puppeteer)    |
| TanStack Router | **Works** - framework agnostic |
| Setup           | Zero-config for existing SPAs  |

**Pros:**

- Works with ANY routing solution
- No code changes required
- Generates static HTML at build time

**Cons:**

- Uses Puppeteer (heavier build)
- Selective route control more manual

**Reference:** [react-snap GitHub](https://github.com/stereobooster/react-snap)

#### C. vite-plugin-prerender

| Aspect      | Details                           |
| ----------- | --------------------------------- |
| Flexibility | Specify exact routes to prerender |
| Integration | Simple Vite plugin                |

**Reference:** [vite-plugin-prerender](https://github.com/Rudeus3Greyrat/vite-plugin-prerender)

---

## Recommendation for Beqeek Landing Page

### Strategy: Hybrid SPA + Pre-rendered Landing

```
Landing pages (SEO required):
  /             → Pre-rendered static HTML
  /features     → Pre-rendered static HTML
  /pricing      → Pre-rendered static HTML

App routes (SPA, auth required):
  /$locale/workspaces/*  → Client-side rendered (current behavior)
  /$locale/tables/*      → Client-side rendered
```

### Implementation Options (Ranked)

#### Option 1: react-snap (Lowest Effort)

```bash
pnpm --filter web add -D react-snap
```

```json
// package.json
"scripts": {
  "postbuild": "react-snap"
},
"reactSnap": {
  "include": ["/", "/features", "/pricing"],
  "skipThirdPartyRequests": true
}
```

- **Effort:** ~1 day
- **Risk:** Low
- **Keep:** Existing TanStack Router

#### Option 2: Vike with Selective Pre-rendering (Best Long-term)

- Create `/apps/landing` for marketing pages with Vike
- Keep `/apps/web` as SPA for authenticated app
- **Effort:** ~1 week
- **Risk:** Medium (new framework)
- **Benefit:** Full SSR/SSG flexibility for future

#### Option 3: Separate Static Landing (Simplest)

- Create static HTML landing page outside React
- Use Astro, Hugo, or plain HTML
- Keep React app for authenticated routes only
- **Effort:** 2-3 days
- **Risk:** Lowest

---

## SEO Requirements Checklist

| Requirement        | react-snap | Vike   | Manual SSR |
| ------------------ | ---------- | ------ | ---------- |
| Crawlable HTML     | Yes        | Yes    | Yes        |
| Meta tags          | Yes\*      | Yes    | Yes        |
| Open Graph         | Yes\*      | Yes    | Yes        |
| Structured data    | Yes\*      | Yes    | Yes        |
| Dynamic content    | No         | Yes    | Yes        |
| Sitemap generation | Manual     | Plugin | Manual     |

\*Requires meta tags in React components; react-snap renders what's there

---

## Unresolved Questions

1. **TanStack Router + Vike:** Can they coexist in same app, or require separate packages?
2. **Build time impact:** What's react-snap build overhead for Turborepo?
3. **i18n SEO:** How to handle hreflang for vi/en with pre-rendering?
4. **Dynamic OG images:** Needed? Would require server-side generation

---

## References

- [Vite SSR Guide](https://vite.dev/guide/ssr)
- [Vike Pre-rendering](https://vike.dev/pre-rendering)
- [react-snap](https://github.com/stereobooster/react-snap)
- [TanStack Router SSR Discussion](https://github.com/TanStack/router/discussions/1995)
- [React SSG Landscape 2025](https://crystallize.com/blog/react-static-site-generators)
- [Vite RSC Discussion](https://github.com/vitejs/vite/discussions/4591)
