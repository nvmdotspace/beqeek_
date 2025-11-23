# Phase 3: Component Migration

**Parent:** [plan.md](./plan.md)
**Dependencies:** [Phase 2](./phase-02-design-system.md)
**Docs:** [Code Standards](../../docs/code-standards.md)

---

## Overview

| Field                 | Value                                     |
| --------------------- | ----------------------------------------- |
| Date                  | 2025-11-23                                |
| Description           | Convert HTML sections to React components |
| Priority              | High                                      |
| Implementation Status | Pending                                   |
| Review Status         | Not Started                               |

## Key Insights

- HTML has 8 major sections: Navbar, Hero, Features, Benefits, Testimonials, Pricing, Footer, Modal
- Use Lucide React icons instead of Font Awesome (consistency with web app)
- Modal uses iframe for external form - keep as-is
- Clarity tracking should be component-based

## Requirements

1. Create reusable components for each section
2. Replace Font Awesome with Lucide icons
3. Preserve all interactive behaviors (smooth scroll, modal)
4. Maintain responsive design
5. Keep identical visual appearance

## Architecture

### Component Structure

```
apps/landing/src/
├── components/
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── background-effects.tsx
│   ├── sections/
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── benefits-section.tsx
│   │   ├── testimonials-section.tsx
│   │   └── pricing-section.tsx
│   ├── ui/
│   │   ├── glass-card.tsx
│   │   ├── gradient-button.tsx
│   │   └── feature-card.tsx
│   └── modal/
│       └── signup-modal.tsx
└── pages/
    └── index.tsx
```

### Icon Mapping (Font Awesome → Lucide)

| Font Awesome      | Lucide          | Usage                 |
| ----------------- | --------------- | --------------------- |
| `fa-arrow-right`  | `ArrowRight`    | CTA buttons           |
| `fa-tools`        | `Wrench`        | Customization feature |
| `fa-lock`         | `Lock`          | Security feature      |
| `fa-plug`         | `Plug`          | API feature           |
| `fa-chart-line`   | `TrendingUp`    | Efficiency benefit    |
| `fa-piggy-bank`   | `PiggyBank`     | Cost saving           |
| `fa-sitemap`      | `Network`       | Multi-business        |
| `fa-quote-left`   | `Quote`         | Testimonials          |
| `fa-check`        | `Check`         | Pricing features      |
| `fa-times`        | `X`             | Modal close           |
| `fa-envelope`     | `Mail`          | SMTP                  |
| `fa-table`        | `Table`         | Google Sheets         |
| `fa-comment-dots` | `MessageCircle` | Zalo OA               |
| `fa-store`        | `Store`         | KiotViet              |
| `fa-shield-alt`   | `Shield`        | E2EE icon             |
| `fab fa-twitter`  | `Twitter`       | Social                |
| `fab fa-github`   | `Github`        | Social                |

## Related Code Files

- `apps/product-page/index.html` - source (all sections)
- `apps/web/src/features/auth/pages/login-page.tsx` - styling patterns
- `packages/ui/src/components/button.tsx` - Button component reference

## Implementation Steps

### 3.1 Create BackgroundEffects component

```typescript
// apps/landing/src/components/layout/background-effects.tsx
export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Blue glow top-right */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[120px] mix-blend-screen" />
      {/* Purple glow bottom-left */}
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[120px] mix-blend-screen" />
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid" />
    </div>
  );
}
```

### 3.2 Create Navbar component

```typescript
// apps/landing/src/components/layout/navbar.tsx
import { useState, useEffect } from 'react';

interface NavbarProps {
  onOpenModal: () => void;
}

export function Navbar({ onOpenModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'fixed w-full top-0 z-50 glass border-b-0 transition-all duration-300',
      scrolled && 'shadow-lg'
    )}>
      {/* ... navbar content */}
    </header>
  );
}
```

### 3.3 Create HeroSection component

```typescript
// apps/landing/src/components/sections/hero-section.tsx
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenModal: () => void;
}

export function HeroSection({ onOpenModal }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
              </span>
              SaaS Tùy Chỉnh Hiện Đại
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.15]">
              Vận Hành Quy Trình Kinh Doanh, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-accent-teal text-glow">
                Tự Động Hoá Mượt Mà
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
              Sản phẩm phần mềm tùy chỉnh, tự thiết lập theo nhu cầu, bảo mật cao và quản lý hàng trăm nghiệp vụ doanh nghiệp một cách dễ dàng.
            </p>

            <button
              onClick={onOpenModal}
              className="h-12 px-8 rounded-full bg-accent-blue text-white font-bold text-base flex items-center justify-center hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/20"
            >
              Đăng ký dùng thử miễn phí
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            {/* Metrics */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="grid grid-cols-3 gap-4">
                <MetricItem value="99.9%" label="Uptime SLA" />
                <MetricItem value="E2EE" label="Mã Hoá" />
                <MetricItem value="Global" label="Hạ Tầng" />
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
```

### 3.4 Create SignupModal component

```typescript
// apps/landing/src/components/modal/signup-modal.tsx
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORM_URL = 'https://app.o1erp.com/platform/forms/732878538910205325/019952f6-f3f5-57-7a-a6c362a6933141a3';
const WEBHOOK_URL = 'https://app.o1erp.com/api/workspace/732878538910205325/webhook/post/workflows/01995753-6941-93-70-be12f8844a6a01a1';

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  // Track modal open
  useEffect(() => {
    if (isOpen) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'open_signup_modal',
          client: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error);
    }
  }, [isOpen]);

  // ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-[var(--landing-surface)] rounded-2xl border border-white/10 w-full max-w-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Đăng Ký / Chọn Gói</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form iframe */}
          <div className="h-[600px] bg-[var(--landing-bg)]">
            <iframe
              src={FORM_URL}
              className="w-full h-full border-0"
              title="Đăng ký BEQEEK"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.5 Create main page component

```typescript
// apps/landing/src/pages/index.tsx
import { useState } from 'react';
import { BackgroundEffects } from '@/components/layout/background-effects';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { BenefitsSection } from '@/components/sections/benefits-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { SignupModal } from '@/components/modal/signup-modal';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="antialiased selection:bg-accent-blue/30 selection:text-accent-blue-foreground">
      <BackgroundEffects />
      <Navbar onOpenModal={() => setIsModalOpen(true)} />

      <main>
        <HeroSection onOpenModal={() => setIsModalOpen(true)} />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <PricingSection onOpenModal={() => setIsModalOpen(true)} />
      </main>

      <Footer />
      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
```

## Todo List

- [ ] Create BackgroundEffects component
- [ ] Create Navbar component with scroll effect
- [ ] Create Logo component (shared)
- [ ] Create HeroSection with metrics
- [ ] Create DashboardPreview component
- [ ] Create FeaturesSection (3 features)
- [ ] Create BenefitsSection (3 cards)
- [ ] Create TestimonialsSection (3 cards)
- [ ] Create PricingSection (3 tiers)
- [ ] Create Footer component
- [ ] Create SignupModal with iframe
- [ ] Assemble LandingPage
- [ ] Add smooth scroll behavior
- [ ] Test all interactive elements
- [ ] Verify responsive design (mobile/tablet/desktop)

## Success Criteria

- [ ] All 8 sections render correctly
- [ ] Modal opens/closes properly
- [ ] Smooth scroll works for anchor links
- [ ] Lucide icons display correctly
- [ ] Mobile responsive layout works
- [ ] No console errors

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                   |
| ----------------------- | ---------- | ------ | ---------------------------- |
| Icon visual differences | Medium     | Low    | Review icon choices manually |
| Modal accessibility     | Medium     | Medium | Add ARIA + keyboard handling |
| SSG hydration mismatch  | Low        | High   | Avoid window checks in SSG   |

## Security Considerations

- iframe URL is external (o1erp.com) - already in production
- Webhook URL for tracking is existing endpoint
- No user data handled in components

## Next Steps

After Phase 3 complete → [Phase 4: SEO & Metadata](./phase-04-seo-metadata.md)
