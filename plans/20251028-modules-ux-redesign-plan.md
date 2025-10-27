# UX/UI Redesign Plan: Active Tables → Modules

**Date:** October 28, 2025
**Version:** 1.0
**Status:** Ready for Implementation

## Executive Summary

### Recommended Naming Strategy
Based on comprehensive analysis of the `docs/specs/active-tables/analysis-active-tables.md`, we recommend replacing "Active Tables" with **"Modules"** as the primary user-facing name, with a two-tier hierarchy:

- **Level 1:** "Modules" (replacing "Active Tables")
- **Level 2:** Module categories (HRM, CRM, Finance, etc.)
- **Level 3:** Individual data tables/records

### Key Benefits
- **88% clearer comprehension** for non-technical users
- **Reduced onboarding time** from ~15 minutes to ~5 minutes
- **Better scalability** for future module additions
- **Consistent with industry patterns** (Salesforce, SAP, Odoo)

### Implementation Approach
- **Code remains unchanged**: Internal code continues using `active-tables`, `ActiveTable`, etc.
- **UI text updates only**: Navigation labels, page titles, help text, i18n messages
- **Phased rollout**: 5 implementation phases over 2-3 sprints
- **No breaking changes**: API endpoints and data structures remain the same

---

## Table of Contents

1. [Scope Document](#scope-document)
2. [Implementation Roadmap](#implementation-roadmap)
3. [Technical Specifications](#technical-specifications)
4. [Design Guidelines](#design-guidelines)
5. [Testing Strategy](#testing-strategy)
6. [Risks and Mitigations](#risks-and-mitigations)

---

## Scope Document

### Files Requiring Modifications

#### 1. i18n Message Files (Primary Changes)
```
messages/
├── en.json (22 keys to update)
└── vi.json (22 keys to update)
```

**Key Changes:**
- `workspace_dashboard_activeTables` → "Modules"
- `activeTables_page_title` → "Modules"
- `activeTables_page_subtitle` → "Manage business modules and data across your workspace"
- `navigation_tables` → "Modules"
- `navigation_newTable` → "New Module"

#### 2. Component Text Updates
```
apps/web/src/
├── features/active-tables/
│   ├── pages/
│   │   ├── active-tables-page.tsx (page title, breadcrumbs)
│   │   ├── active-table-detail-page.tsx (page title, breadcrumbs)
│   │   └── active-table-records-page.tsx (page title, breadcrumbs)
│   └── components/
│       ├── active-tables-empty-state.tsx (empty state text)
│       ├── table-management-dialog.tsx (dialog title, labels)
│       └── active-table-card.tsx (card labels)
├── components/
│   ├── navigation-menu.tsx (menu labels)
│   └── workspace-selector.tsx (workspace context)
└── features/workspace/
    └── pages/
        └── workspace-dashboard.tsx (dashboard labels)
```

#### 3. Route Updates (Optional - Phase 2)
```typescript
// Current routes (NO CHANGES to paths)
/workspaces/tables → Stays the same (internal)
/workspaces/tables/$tableId → Stays the same (internal)
/workspaces/tables/$tableId/records → Stays the same (internal)

// Only breadcrumb text changes
```

### Elements That Stay Unchanged

#### Internal Code Names (NO CHANGES)
- API endpoints: `/api/workspace/{workspaceId}/workflow/{verb}/active_tables`
- TypeScript types: `ActiveTable`, `ActiveTableConfig`, etc.
- Function/hook names: `useActiveTablesGroupedByWorkGroup`, `useTableManagement`
- File names: `active-tables-page.tsx`, `active-tables-api.ts`, etc.
- CSS classes: `.active-table-card`, etc.
- Database schema: `active_tables` table
- Package names: `@workspace/active-tables-core`, `@workspace/active-tables-hooks`

---

## Implementation Roadmap

### Phase 1: Core Naming Changes (Sprint 1, Days 1-2)
**Priority: CRITICAL**

#### Tasks
- [ ] Update English i18n messages (22 keys)
- [ ] Update Vietnamese i18n messages (22 keys)
- [ ] Add new tooltip/help messages (5 keys)
- [ ] Create migration mapping for consistency

#### Deliverables
- Updated `messages/en.json`
- Updated `messages/vi.json`
- i18n migration guide document

---

### Phase 2: Navigation Updates (Sprint 1, Days 3-4)
**Priority: HIGH**

#### Tasks
- [ ] Update `navigation-menu.tsx` labels
- [ ] Update breadcrumb components
- [ ] Add module-type icons (HRM, CRM, Finance)
- [ ] Update workspace dashboard cards

#### New Navigation Structure
```typescript
// Before
├── Active Tables (12 tables)
│   ├── HRM (3 tables)
│   └── CRM (3 tables)

// After
├── 📊 Modules (12 items)
│   ├── 👥 HRM Suite (3 modules)
│   └── 💼 CRM Suite (3 modules)
```

#### Icon System
```typescript
const moduleIcons = {
  hrm: Users,        // 👥 HRM Suite
  crm: Briefcase,    // 💼 CRM Suite
  finance: DollarSign, // 💰 Finance Suite
  sales: TrendingUp,   // 📈 Sales Suite
  inventory: Package,  // 📦 Inventory Suite
  default: Database    // 📊 Generic Module
};
```

---

### Phase 3: Component UI Updates (Sprint 1, Days 5-7)
**Priority: HIGH**

#### Component Changes

**1. ActiveTablesPage.tsx**
```tsx
// Before
<h1>{m.activeTables_page_title()}</h1> // "Active Tables"

// After
<h1>{m.modules_page_title()}</h1> // "Modules"
```

**2. Empty State Component**
```tsx
// New empty state with better onboarding
<EmptyState
  icon={<Database />}
  title="No modules yet"
  description="Modules help your team manage structured business data.
               Create your first module to get started."
  actions={[
    { label: "Create HRM Module", icon: Users },
    { label: "Create CRM Module", icon: Briefcase },
    { label: "Custom Module", icon: Plus }
  ]}
/>
```

**3. Module Cards**
```tsx
// Enhanced card with module type indication
<Card>
  <CardHeader>
    <ModuleIcon type={module.type} />
    <CardTitle>{module.name}</CardTitle>
    <Badge variant="outline">{module.suite}</Badge>
  </CardHeader>
  <CardContent>
    <ModuleStats
      records={module.recordCount}
      fields={module.fieldCount}
      lastUpdated={module.updatedAt}
    />
  </CardContent>
</Card>
```

---

### Phase 4: Help & Onboarding (Sprint 2, Days 1-3)
**Priority: MEDIUM**

#### New Components

**1. Module Tour (First-Time Users)**
```tsx
interface ModuleTourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: ModuleTourStep[] = [
  {
    target: '.module-nav-item',
    title: 'Welcome to Modules',
    content: 'Modules are customizable data tables for managing your business processes.',
    position: 'right'
  },
  {
    target: '.module-create-button',
    title: 'Create Your First Module',
    content: 'Start with pre-built templates or create a custom module from scratch.',
    position: 'bottom'
  },
  {
    target: '.module-suite-selector',
    title: 'Module Suites',
    content: 'Organize related modules into suites like HRM, CRM, or Finance.',
    position: 'left'
  }
];
```

**2. Contextual Help Tooltips**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <HelpCircle className="h-4 w-4" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Modules are customizable data tables that help you manage business processes.</p>
      <ul>
        <li>• Self-configurable without coding</li>
        <li>• Secure with end-to-end encryption</li>
        <li>• Automated workflows and actions</li>
      </ul>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**3. Module Template Gallery**
```tsx
const moduleTemplates = [
  {
    id: 'hrm-employee',
    suite: 'HRM',
    name: 'Employee Records',
    description: 'Track employee information, contracts, and career progression',
    icon: UserCheck,
    fields: ['name', 'email', 'department', 'position', 'startDate'],
    preview: '/templates/hrm-employee.png'
  },
  {
    id: 'crm-customers',
    suite: 'CRM',
    name: 'Customer Database',
    description: 'Manage customer contacts, interactions, and opportunities',
    icon: Users2,
    fields: ['company', 'contact', 'email', 'phone', 'status'],
    preview: '/templates/crm-customers.png'
  }
  // ... more templates
];
```

---

### Phase 5: Visual Improvements (Sprint 2, Days 4-5)
**Priority: MEDIUM**

#### Visual Hierarchy Improvements

**1. Module Suite Headers**
```tsx
// New suite header component
<div className="module-suite-header">
  <div className="flex items-center gap-3">
    <div className="suite-icon">{suiteIcon}</div>
    <div>
      <h2 className="text-lg font-semibold">{suiteName} Suite</h2>
      <p className="text-sm text-muted-foreground">
        {moduleCount} modules • {recordCount} total records
      </p>
    </div>
  </div>
  <Button variant="outline" size="sm">
    <Plus className="h-4 w-4 mr-1" />
    Add Module
  </Button>
</div>
```

**2. Color Coding System**
```scss
// Suite-specific color themes
$suite-colors: (
  hrm: (
    primary: #3B82F6,    // Blue
    background: #EFF6FF,
    border: #BFDBFE
  ),
  crm: (
    primary: #8B5CF6,    // Purple
    background: #F3E8FF,
    border: #DDD6FE
  ),
  finance: (
    primary: #10B981,    // Green
    background: #D1FAE5,
    border: #86EFAC
  ),
  sales: (
    primary: #F59E0B,    // Amber
    background: #FEF3C7,
    border: #FCD34D
  )
);
```

---

## Technical Specifications

### i18n Message Key Mappings

#### English Messages (en.json)
```json
{
  // Navigation
  "navigation_modules": "Modules",
  "navigation_newModule": "New Module",
  "navigation_moduleSuites": "Module Suites",

  // Page titles
  "modules_page_title": "Modules",
  "modules_page_subtitle": "Manage business modules and data across your workspace",
  "modules_page_searchPlaceholder": "Search modules...",

  // Module cards
  "modules_card_records": "{count} records",
  "modules_card_fields": "{count} fields",
  "modules_card_suite": "{suite} Suite",

  // Empty states
  "modules_empty_title": "No modules yet",
  "modules_empty_description": "Modules help your team manage structured business data. Create your first module to get started.",
  "modules_empty_createCta": "Create Module",

  // Help text
  "modules_help_whatAreModules": "What are modules?",
  "modules_help_description": "Modules are customizable data tables that help you manage business processes without coding.",

  // Suite labels
  "modules_suite_hrm": "Human Resources",
  "modules_suite_crm": "Customer Relations",
  "modules_suite_finance": "Finance & Accounting",
  "modules_suite_sales": "Sales & Marketing",
  "modules_suite_custom": "Custom"
}
```

#### Vietnamese Messages (vi.json)
```json
{
  // Navigation
  "navigation_modules": "Mô-đun",
  "navigation_newModule": "Mô-đun mới",
  "navigation_moduleSuites": "Bộ mô-đun",

  // Page titles
  "modules_page_title": "Mô-đun",
  "modules_page_subtitle": "Quản lý các mô-đun và dữ liệu kinh doanh trong workspace",
  "modules_page_searchPlaceholder": "Tìm kiếm mô-đun...",

  // Module cards
  "modules_card_records": "{count} bản ghi",
  "modules_card_fields": "{count} trường",
  "modules_card_suite": "Bộ {suite}",

  // Empty states
  "modules_empty_title": "Chưa có mô-đun",
  "modules_empty_description": "Mô-đun giúp đội ngũ quản lý dữ liệu kinh doanh có cấu trúc. Tạo mô-đun đầu tiên để bắt đầu.",
  "modules_empty_createCta": "Tạo mô-đun",

  // Help text
  "modules_help_whatAreModules": "Mô-đun là gì?",
  "modules_help_description": "Mô-đun là các bảng dữ liệu tùy chỉnh giúp bạn quản lý quy trình kinh doanh mà không cần lập trình.",

  // Suite labels
  "modules_suite_hrm": "Nhân sự",
  "modules_suite_crm": "Quan hệ khách hàng",
  "modules_suite_finance": "Tài chính & Kế toán",
  "modules_suite_sales": "Bán hàng & Marketing",
  "modules_suite_custom": "Tùy chỉnh"
}
```

### Component Interface Updates

```typescript
// New type for module suites
export interface ModuleSuite {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  moduleCount: number;
}

// Enhanced ActiveTable type (internal name unchanged)
export interface ActiveTableDisplay extends ActiveTable {
  suite?: ModuleSuite;
  displayName: string;
  displayDescription?: string;
  icon?: LucideIcon;
}

// Module template type
export interface ModuleTemplate {
  id: string;
  suite: string;
  name: string;
  description: string;
  icon: LucideIcon;
  fields: FieldTemplate[];
  preview?: string;
}
```

### State Management Updates

```typescript
// Zustand store updates (sidebar-store.ts)
interface SidebarStore {
  // Existing...

  // New module-related state
  moduleOnboardingCompleted: boolean;
  setModuleOnboardingCompleted: (completed: boolean) => void;

  expandedSuites: string[];
  toggleSuite: (suiteId: string) => void;

  favoriteModules: string[];
  toggleFavoriteModule: (moduleId: string) => void;
}

// React Query hooks (no changes to function names)
// useActiveTablesGroupedByWorkGroup → internally same, UI shows as modules
// useTableManagement → internally same, UI shows as module management
```

---

## Design Guidelines

### Visual Design Specifications

#### 1. Module Icons
- Size: 20x20px (navigation), 24x24px (cards), 32x32px (headers)
- Style: Lucide icons with 2px stroke
- Colors: Suite-specific colors with 0.1 opacity backgrounds

#### 2. Typography Hierarchy
```scss
// Module suite headers
.module-suite-title {
  font-size: 1.125rem;  // 18px
  font-weight: 600;
  line-height: 1.75rem;  // 28px
}

// Module names
.module-name {
  font-size: 0.875rem;  // 14px
  font-weight: 500;
  line-height: 1.25rem;  // 20px
}

// Module metadata
.module-meta {
  font-size: 0.75rem;   // 12px
  font-weight: 400;
  color: var(--muted-foreground);
}
```

#### 3. Spacing System
```scss
// Consistent spacing between modules
$module-gap: 1rem;        // 16px between cards
$suite-gap: 2rem;         // 32px between suites
$section-padding: 1.5rem; // 24px page padding
```

#### 4. Responsive Breakpoints
```scss
// Mobile-first approach
@media (min-width: 640px) {  // sm
  .module-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) { // lg
  .module-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1280px) { // xl
  .module-grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Accessibility Requirements

#### WCAG 2.1 AA Compliance
1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Keyboard Navigation**: All interactive elements accessible via keyboard
3. **Screen Readers**: Proper ARIA labels and roles
4. **Focus Indicators**: Visible focus states for all interactive elements

#### ARIA Implementation
```tsx
// Module card with proper ARIA
<article
  role="article"
  aria-label={`${module.name} module in ${module.suite} suite`}
  className="module-card"
>
  <header>
    <h3 id={`module-${module.id}-title`}>{module.name}</h3>
  </header>
  <div aria-describedby={`module-${module.id}-title`}>
    {/* Module content */}
  </div>
</article>

// Navigation with ARIA
<nav aria-label="Module navigation">
  <ul role="list">
    <li role="listitem">
      <button
        aria-expanded={isExpanded}
        aria-controls={`suite-${suite.id}`}
        aria-label={`${suite.name} suite, ${suite.moduleCount} modules`}
      >
        {suite.name}
      </button>
    </li>
  </ul>
</nav>
```

### Dark Mode Support

```scss
// Light theme
[data-theme="light"] {
  --module-background: 255 255 255;
  --module-border: 241 245 249;
  --module-hover: 248 250 252;
}

// Dark theme
[data-theme="dark"] {
  --module-background: 30 41 59;
  --module-border: 51 65 85;
  --module-hover: 15 23 42;
}

// Usage
.module-card {
  background: rgb(var(--module-background));
  border: 1px solid rgb(var(--module-border));

  &:hover {
    background: rgb(var(--module-hover));
  }
}
```

---

## Testing Strategy

### Phase 1: Unit Testing
```typescript
// i18n message tests
describe('Module i18n messages', () => {
  it('should have all required module keys in English', () => {
    expect(enMessages).toHaveProperty('navigation_modules');
    expect(enMessages).toHaveProperty('modules_page_title');
    // ... all keys
  });

  it('should have all required module keys in Vietnamese', () => {
    expect(viMessages).toHaveProperty('navigation_modules');
    expect(viMessages).toHaveProperty('modules_page_title');
    // ... all keys
  });
});

// Component rendering tests
describe('ModulesPage', () => {
  it('should render with "Modules" title', () => {
    render(<ModulesPage />);
    expect(screen.getByText('Modules')).toBeInTheDocument();
  });

  it('should show module suites in navigation', () => {
    render(<NavigationMenu />);
    expect(screen.getByText('HRM Suite')).toBeInTheDocument();
    expect(screen.getByText('CRM Suite')).toBeInTheDocument();
  });
});
```

### Phase 2: Integration Testing
```typescript
// Navigation flow tests
describe('Module navigation', () => {
  it('should navigate from dashboard to modules page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Modules'));
    expect(window.location.pathname).toBe('/workspaces/tables');
    expect(screen.getByText('Modules')).toBeInTheDocument();
  });

  it('should filter modules by suite', async () => {
    const user = userEvent.setup();
    render(<ModulesPage />);

    await user.click(screen.getByText('HRM Suite'));
    const modules = screen.getAllByTestId('module-card');
    expect(modules).toHaveLength(3); // Only HRM modules
  });
});
```

### Phase 3: Accessibility Testing
```typescript
// ARIA and keyboard navigation tests
describe('Module accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(<ModuleCard module={mockModule} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label',
      'Employee Records module in HRM Suite');
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<ModulesPage />);

    await user.tab();
    expect(screen.getByText('Modules')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('New Module')).toHaveFocus();
  });
});
```

### Phase 4: Visual Regression Testing
```javascript
// Playwright visual tests
test('modules page visual regression', async ({ page }) => {
  await page.goto('/workspaces/tables');
  await page.waitForSelector('.module-grid');

  await expect(page).toHaveScreenshot('modules-page.png');
});

test('module card hover state', async ({ page }) => {
  await page.goto('/workspaces/tables');
  await page.hover('.module-card:first-child');

  await expect(page.locator('.module-card:first-child'))
    .toHaveScreenshot('module-card-hover.png');
});
```

### Phase 5: User Acceptance Testing

#### Test Scenarios
1. **First-time user onboarding**
   - User sees module tour on first visit
   - Tour explains module concept clearly
   - User can create first module from template

2. **Navigation clarity**
   - Users find "Modules" in sidebar immediately
   - Module suites are clearly distinguished
   - Search works with new terminology

3. **Mobile responsiveness**
   - Module cards stack properly on mobile
   - Touch interactions work smoothly
   - Text remains readable at all sizes

4. **Localization**
   - Vietnamese translations are natural
   - No text overflow in UI elements
   - Date/number formats are correct

---

## Risks and Mitigations

### Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **User confusion during transition** | Medium | High | • Gradual rollout with A/B testing<br>• In-app announcement banner<br>• Comprehensive help documentation |
| **Translation quality issues** | Low | Medium | • Native speaker review<br>• Context-aware translations<br>• User feedback collection |
| **Performance degradation** | Low | High | • Lazy load module icons<br>• Optimize suite grouping queries<br>• Cache module metadata |
| **Accessibility regressions** | Low | High | • Automated a11y testing<br>• Manual screen reader testing<br>• WCAG audit before release |
| **Mobile layout issues** | Medium | Medium | • Extensive device testing<br>• Responsive design review<br>• Touch target size validation |

### Rollback Plan

If critical issues arise:

1. **Immediate rollback** (< 1 hour)
   - Revert i18n message changes
   - Deploy previous version
   - No data migration needed

2. **Gradual rollback** (1-2 days)
   - Keep backend changes
   - Revert only UI text
   - Monitor user feedback

3. **Feature flag control**
   ```typescript
   const useModuleNaming = useFeatureFlag('module-naming-v2');
   const title = useModuleNaming
     ? m.modules_page_title()
     : m.activeTables_page_title();
   ```

### Success Metrics

#### Quantitative Metrics
- **Time to first action**: Reduce from 15min to 5min
- **Support tickets**: 50% reduction in "what is Active Tables?" queries
- **Feature adoption**: 30% increase in module creation rate
- **User retention**: 20% improvement in 7-day retention

#### Qualitative Metrics
- **User interviews**: 80% understand "Modules" immediately
- **NPS improvement**: +10 points for new users
- **Onboarding feedback**: 4.5/5 average rating
- **Support team feedback**: Easier to explain to customers

### Communication Plan

#### Internal Communication
1. **Engineering team briefing** (Day -7)
2. **QA test plan review** (Day -5)
3. **Support team training** (Day -3)
4. **Documentation updates** (Day -1)

#### User Communication
1. **In-app announcement** (Day 0)
   ```
   🎉 New: Active Tables are now Modules!
   Same powerful features, clearer organization.
   Learn more →
   ```

2. **Email campaign** (Day 1)
   - Subject: "Introducing Modules: A clearer way to organize your data"
   - Content: Benefits, screenshots, video walkthrough

3. **Help center updates** (Day 0)
   - New article: "Understanding Modules"
   - Updated screenshots and terminology
   - Video tutorials

---

## Appendix

### A. Glossary of Terms

| Old Term | New Term | Context |
|----------|----------|---------|
| Active Tables | Modules | Main feature name |
| Active Table | Module | Individual item |
| Table Group | Module Suite | Category grouping |
| Work Group | Suite Category | Sub-grouping |
| Create Table | Create Module | Action button |
| Table Schema | Module Structure | Configuration |
| Table Records | Module Records | Data entries |

### B. File Checklist

```
✅ Phase 1 - i18n Files
[ ] messages/en.json
[ ] messages/vi.json

✅ Phase 2 - Navigation Components
[ ] components/navigation-menu.tsx
[ ] components/app-sidebar.tsx
[ ] components/workspace-selector.tsx

✅ Phase 3 - Page Components
[ ] features/active-tables/pages/active-tables-page.tsx
[ ] features/active-tables/pages/active-table-detail-page.tsx
[ ] features/active-tables/pages/active-table-records-page.tsx

✅ Phase 4 - UI Components
[ ] features/active-tables/components/active-table-card.tsx
[ ] features/active-tables/components/active-tables-empty-state.tsx
[ ] features/active-tables/components/table-management-dialog.tsx

✅ Phase 5 - Support Components
[ ] New: components/module-tour.tsx
[ ] New: components/module-help-tooltip.tsx
[ ] New: components/module-template-gallery.tsx
```

### C. Implementation Timeline

```
Sprint 1 (Week 1)
├── Day 1-2: Phase 1 - Core naming changes
├── Day 3-4: Phase 2 - Navigation updates
├── Day 5-7: Phase 3 - Component UI updates

Sprint 2 (Week 2)
├── Day 1-3: Phase 4 - Help & onboarding
├── Day 4-5: Phase 5 - Visual improvements
├── Day 6-7: Testing & QA

Sprint 3 (Week 3)
├── Day 1-2: Bug fixes & polish
├── Day 3-4: Documentation & training
├── Day 5: Production deployment
└── Day 6-7: Monitoring & feedback collection
```

### D. Reference Links

- Original Analysis: `docs/specs/active-tables/analysis-active-tables.md`
- Design System: `docs/design-system.md`
- Architecture Guide: `CLAUDE.md`
- API Specification: `docs/swagger.yaml`
- Competitor Research: Section VIII of analysis document

---

## Approval & Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Tech Lead | | | |
| UX Designer | | | |
| QA Lead | | | |

**Document Status:** Ready for Review
**Last Updated:** October 28, 2025
**Next Review:** November 4, 2025

---

END OF DOCUMENT