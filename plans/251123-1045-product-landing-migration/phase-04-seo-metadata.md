# Phase 4: SEO & Metadata

**Parent:** [plan.md](./plan.md)
**Dependencies:** [Phase 3](./phase-03-component-migration.md)
**Docs:** [Google SEO Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

## Overview

| Field                 | Value                                         |
| --------------------- | --------------------------------------------- |
| Date                  | 2025-11-23                                    |
| Description           | Add SEO metadata, Open Graph, structured data |
| Priority              | High                                          |
| Implementation Status | Pending                                       |
| Review Status         | Not Started                                   |

## Key Insights

- vite-react-ssg pre-renders HTML with meta tags
- react-helmet-async recommended for SSG-compatible head management
- Vietnamese as primary language, no EN version initially
- Structured data (JSON-LD) improves rich snippets

## Requirements

1. Meta tags: title, description, keywords, viewport
2. Open Graph tags for social sharing
3. Twitter Card tags
4. Canonical URL
5. JSON-LD structured data (Organization, WebSite)
6. robots.txt and sitemap.xml
7. Favicon and app icons

## Architecture

### Head Structure

```html
<head>
  <!-- Basic Meta -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BEQEEK - Phần Mềm SaaS Tùy Chỉnh Hiện Đại</title>
  <meta
    name="description"
    content="Vận hành quy trình kinh doanh, tự động hoá mượt mà. Sản phẩm phần mềm tùy chỉnh, tự thiết lập theo nhu cầu, bảo mật cao."
  />
  <meta
    name="keywords"
    content="workflow automation, SaaS, business process, low-code, Vietnam, quản lý quy trình, tự động hoá"
  />
  <link rel="canonical" href="https://beqeek.com/" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://beqeek.com/" />
  <meta property="og:title" content="BEQEEK - Phần Mềm SaaS Tùy Chỉnh Hiện Đại" />
  <meta property="og:description" content="Vận hành quy trình kinh doanh, tự động hoá mượt mà." />
  <meta property="og:image" content="https://beqeek.com/og-image.png" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:site_name" content="BEQEEK" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="BEQEEK - Phần Mềm SaaS Tùy Chỉnh Hiện Đại" />
  <meta name="twitter:description" content="Vận hành quy trình kinh doanh, tự động hoá mượt mà." />
  <meta name="twitter:image" content="https://beqeek.com/og-image.png" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <!-- JSON-LD -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", ... }
  </script>
</head>
```

## Related Code Files

- `apps/product-page/index.html` - existing meta tags (lines 4-19)
- `apps/landing/index.html` - target file

## Implementation Steps

### 4.1 Install react-helmet-async

```bash
pnpm --filter landing add react-helmet-async
```

### 4.2 Create SEO component

```typescript
// apps/landing/src/components/seo/seo-head.tsx
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaults = {
  title: 'BEQEEK - Phần Mềm SaaS Tùy Chỉnh Hiện Đại',
  description: 'Vận hành quy trình kinh doanh, tự động hoá mượt mà. Sản phẩm phần mềm tùy chỉnh, tự thiết lập theo nhu cầu, bảo mật cao.',
  image: 'https://beqeek.com/og-image.png',
  url: 'https://beqeek.com/',
};

export function SEOHead({
  title = defaults.title,
  description = defaults.description,
  image = defaults.image,
  url = defaults.url,
}: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="workflow automation, SaaS, business process, low-code, Vietnam, quản lý quy trình, tự động hoá" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="BEQEEK" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
```

### 4.3 Create JSON-LD component

```typescript
// apps/landing/src/components/seo/json-ld.tsx
import { Helmet } from 'react-helmet-async';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BEQEEK',
  url: 'https://beqeek.com',
  logo: 'https://beqeek.com/logo.png',
  description: 'Phần Mềm SaaS Tùy Chỉnh Hiện Đại - Workflow Automation Platform',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@beqeek.com',
    contactType: 'customer service',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BEQEEK',
  url: 'https://beqeek.com',
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BEQEEK',
  operatingSystem: 'Web',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'VND',
    description: 'Miễn phí dùng thử 7 ngày',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '50',
  },
};

export function JsonLd() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
    </Helmet>
  );
}
```

### 4.4 Setup HelmetProvider in main.tsx

```typescript
// apps/landing/src/main.tsx
import { HelmetProvider } from 'react-helmet-async';
import { ViteReactSSG } from 'vite-react-ssg';
import App from './App';
import './styles/index.css';

export const createRoot = ViteReactSSG({
  routes: [{ path: '/', element: <App /> }],
  getStyleCollector: null,
}, ({ isClient, initialState }) => ({
  // Wrap with HelmetProvider for SSG
  app: ({ children }) => <HelmetProvider>{children}</HelmetProvider>,
}));
```

### 4.5 Add SEO to LandingPage

```typescript
// apps/landing/src/pages/index.tsx
import { SEOHead } from '@/components/seo/seo-head';
import { JsonLd } from '@/components/seo/json-ld';

export default function LandingPage() {
  return (
    <>
      <SEOHead />
      <JsonLd />
      {/* ... rest of page */}
    </>
  );
}
```

### 4.6 Create robots.txt

```text
# apps/landing/public/robots.txt
User-agent: *
Allow: /

Sitemap: https://beqeek.com/sitemap.xml
```

### 4.7 Create sitemap.xml

```xml
<!-- apps/landing/public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://beqeek.com/</loc>
    <lastmod>2025-11-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 4.8 Create OG image

- Size: 1200x630px
- Content: BEQEEK logo + tagline + dashboard preview
- Place at: `apps/landing/public/og-image.png`

### 4.9 Add Clarity tracking component

```typescript
// apps/landing/src/components/analytics/clarity.tsx
import { useEffect } from 'react';

const CLARITY_ID = 'tc90lf31v5';

export function ClarityTracking() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","${CLARITY_ID}");
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
```

## Todo List

- [ ] Install react-helmet-async
- [ ] Create SEOHead component
- [ ] Create JsonLd component
- [ ] Setup HelmetProvider in main.tsx
- [ ] Add SEO components to LandingPage
- [ ] Create robots.txt
- [ ] Create sitemap.xml
- [ ] Create OG image (1200x630)
- [ ] Add apple-touch-icon.png
- [ ] Create ClarityTracking component
- [ ] Test meta tags with social preview tools

## Success Criteria

- [ ] Lighthouse SEO score ≥ 90
- [ ] Open Graph preview works on Facebook/LinkedIn
- [ ] Twitter Card preview works
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] JSON-LD validates (schema.org validator)
- [ ] Clarity tracking fires on page load

## Risk Assessment

| Risk                     | Likelihood | Impact | Mitigation                       |
| ------------------------ | ---------- | ------ | -------------------------------- |
| SSG not rendering meta   | Low        | High   | Use react-helmet-async correctly |
| OG image not loading     | Medium     | Medium | Use absolute URLs                |
| Schema validation errors | Low        | Low    | Test with Google validator       |

## Security Considerations

- OG image URL must be public/CORS-enabled
- Clarity script from trusted source (clarity.ms)
- No sensitive data in meta tags

## Next Steps

After Phase 4 complete → [Phase 5: Build & Deploy](./phase-05-build-deploy.md)
