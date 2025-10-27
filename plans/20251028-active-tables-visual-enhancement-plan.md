# Active Tables Visual Enhancement Plan

**Date:** October 28, 2025
**Version:** 1.0
**Status:** Ready for Implementation
**Estimated Effort:** 3-5 days (8-10 implementation tasks)

---

## Executive Summary

This plan outlines a comprehensive visual enhancement for the Active Tables (now "Modules") feature based on the **QUICK-VISUAL-SUMMARY.md** and **UI-DRAFT-API-ACCURATE-v2.md** specifications. The goal is to modernize the UI with improved typography, iconography, button patterns, color coding, and visual hierarchy while maintaining design system compliance and accessibility standards.

**Key Objectives:**
- Implement module-specific icon system with visual coding
- Establish clear typography hierarchy across all views
- Modernize button styles with consistent variants and sizes
- Add color-coded visual treatments for different module types
- Enhance card layouts with improved spacing and depth
- Improve responsive behavior across breakpoints
- Maintain WCAG 2.1 AA accessibility compliance

---

## 1. Design Specifications

### 1.1 Icon System

**Module Type Icons Mapping:**

| Module Type | Icon | Color | Usage Context |
|-------------|------|-------|---------------|
| HRM / Employee | `Users` | `hsl(220 70% 50%)` (blue) | Employee management, team structures |
| CRM / Customer | `UserCog` | `hsl(160 60% 45%)` (teal) | Customer relations, contacts |
| Finance / Budget | `DollarSign` | `hsl(30 80% 55%)` (amber) | Financial records, invoicing |
| Sales / Deals | `TrendingUp` | `hsl(280 65% 60%)` (purple) | Sales pipeline, opportunities |
| Operations / Tasks | `Package` | `hsl(340 75% 55%)` (rose) | Operational workflows |
| Standard / Generic | `Database` | `text-primary` | Default fallback |

**Icon Sizes:**
- **xs:** `h-3 w-3` (12px) - Inline badges, micro indicators
- **sm:** `h-3.5 w-3.5` (14px) - Card metadata, list items
- **md:** `h-4 w-4` (16px) - Buttons, action items (default)
- **lg:** `h-5 w-5` (20px) - Card headers, section titles
- **xl:** `h-6 w-6` (24px) - Page headers, hero sections

**Icon Implementation:**
```tsx
import { Users, UserCog, DollarSign, TrendingUp, Package, Database } from 'lucide-react';

const MODULE_ICONS = {
  hrm: Users,
  employee: Users,
  crm: UserCog,
  customer: UserCog,
  finance: DollarSign,
  budget: DollarSign,
  sales: TrendingUp,
  deals: TrendingUp,
  operations: Package,
  tasks: Package,
  standard: Database,
} as const;

const getModuleIcon = (moduleType: string) => {
  const type = moduleType.toLowerCase().replace(/[_-]/g, '');
  return MODULE_ICONS[type] || MODULE_ICONS.standard;
};
```

---

### 1.2 Typography Hierarchy

**Font Stack:**
```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

**Type Scale:**

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **Page Title** | `text-3xl` (30px) | `font-bold` (700) | `tracking-tight` | Main page headings |
| **Section Title** | `text-xl` (20px) | `font-semibold` (600) | `tracking-tight` | Section headers, group names |
| **Card Title** | `text-xl` (20px) | `font-semibold` (600) | `tracking-tight` | Card headers |
| **Body Text** | `text-sm` (14px) | `font-normal` (400) | `leading-relaxed` | Descriptions, content |
| **Label** | `text-xs` (12px) | `font-medium` (500) | `uppercase tracking-wide` | Form labels, metadata |
| **Caption** | `text-[10px]` (10px) | `font-normal` (400) | Normal | Timestamps, hints |

**Text Colors:**
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Tertiary text: `text-muted-foreground/70`
- Interactive text: `text-primary`
- Destructive text: `text-destructive`

**Responsive Typography:**
```css
/* Mobile (< 768px) */
Page Title: text-2xl (24px)
Section Title: text-lg (18px)
Card Title: text-lg (18px)

/* Tablet (768-1024px) */
Page Title: text-3xl (30px)
Section Title: text-xl (20px)

/* Desktop (> 1024px) */
Page Title: text-3xl (30px)
Section Title: text-xl (20px)
```

---

### 1.3 Button System

**Button Variants:**

| Variant | Use Case | Visual Treatment |
|---------|----------|------------------|
| `default` | Primary actions (Create, Save, Submit) | `bg-primary text-primary-foreground shadow-sm` |
| `secondary` | Secondary actions (Cancel, Reset) | `bg-secondary text-secondary-foreground shadow-xs` |
| `outline` | Tertiary actions, filters | `border border-input bg-background shadow-xs` |
| `ghost` | Low-priority actions, nav items | `hover:bg-accent hover:text-accent-foreground` |
| `destructive` | Delete, remove actions | `bg-destructive text-destructive-foreground shadow-xs` |

**Button Sizes:**

| Size | Height | Padding | Icon Padding | Usage |
|------|--------|---------|--------------|-------|
| `sm` | `h-8` (32px) | `px-3` | `px-2.5` | Filters, inline actions, compact UIs |
| `default` | `h-9` (36px) | `px-4` | `px-3` | Standard actions (default) |
| `lg` | `h-10` (40px) | `px-6` | `px-4` | Hero actions, primary CTAs |
| `icon` | `size-9` (36px) | N/A | N/A | Icon-only buttons |

**Button with Icon Patterns:**
```tsx
// Leading icon (default)
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Create Table
</Button>

// Trailing icon
<Button>
  View Details
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

// Icon only
<Button size="icon">
  <MoreVertical className="h-4 w-4" />
</Button>
```

**Button Groups:**
```tsx
<div className="flex items-center gap-2">
  <Button variant="default">Primary Action</Button>
  <Button variant="outline">Secondary</Button>
  <Button variant="ghost">Tertiary</Button>
</div>
```

---

### 1.4 Badge System

**Badge Variants:**

| Variant | Visual | Usage |
|---------|--------|-------|
| `default` | `bg-secondary text-secondary-foreground` | Status indicators, counts |
| `secondary` | `bg-muted text-muted-foreground` | Metadata, labels |
| `destructive` | `bg-destructive/15 text-destructive` | Errors, warnings |
| `outline` | `border-border bg-background` | Filters, tags |

**Badge Sizes:**
```tsx
// Default
<Badge>Standard Badge</Badge>

// Small (custom)
<Badge className="text-[10px] px-2 py-0.5">Small Badge</Badge>

// Large (custom)
<Badge className="text-sm px-3 py-1">Large Badge</Badge>
```

**Module Type Badges:**
```tsx
// Color-coded by module type
<Badge
  variant="outline"
  className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
>
  <Users className="mr-1 h-3 w-3" />
  HRM Suite
</Badge>
```

---

### 1.5 Color System

**Module Type Colors:**

| Module Type | Background | Text | Border |
|-------------|------------|------|--------|
| HRM | `bg-blue-500/10` | `text-blue-600 dark:text-blue-400` | `border-blue-500/20` |
| CRM | `bg-teal-500/10` | `text-teal-600 dark:text-teal-400` | `border-teal-500/20` |
| Finance | `bg-amber-500/10` | `text-amber-600 dark:text-amber-400` | `border-amber-500/20` |
| Sales | `bg-purple-500/10` | `text-purple-600 dark:text-purple-400` | `border-purple-500/20` |
| Operations | `bg-rose-500/10` | `text-rose-600 dark:text-rose-400` | `border-rose-500/20` |

**Status Colors:**

| Status | Color | Usage |
|--------|-------|-------|
| Active | `text-emerald-600` | Active records, enabled states |
| Pending | `text-amber-600` | In-progress, waiting |
| Inactive | `text-gray-500` | Disabled, archived |
| Error | `text-destructive` | Errors, failures |

**Encryption Status:**
```tsx
// E2EE
<Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
  End-to-end encrypted
</Badge>

// Server-side
<Badge variant="outline">
  <Shield className="mr-1 h-3.5 w-3.5" />
  Server encrypted
</Badge>
```

---

### 1.6 Card System

**Card Structure:**
```tsx
<Card className="group relative flex h-full flex-col overflow-hidden border-border/70 bg-background/90 shadow-sm transition-shadow hover:shadow-md">
  <CardHeader className="pb-4">
    {/* Title, badges, actions */}
  </CardHeader>
  <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
    {/* Main content */}
  </CardContent>
  <CardFooter className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
    {/* Actions, metadata */}
  </CardFooter>
</Card>
```

**Card Enhancements:**
- **Hover effect:** `hover:shadow-md` with subtle lift
- **Border:** `border-border/70` (semi-transparent)
- **Background:** `bg-background/90` for layering
- **Spacing:** `pb-4` header, `gap-3` content, `pt-4` footer
- **Group hover:** Use `group` for coordinated animations

**Card Variants:**

1. **Standard Card (Current)**
   - Full border, shadow on hover
   - Used for: Module cards, workspace cards

2. **Compact Card** (New)
   - Reduced padding, no footer
   - Used for: List items, search results

3. **Stat Card** (Enhanced)
   - Large number, icon, label
   - Used for: Dashboard metrics

---

### 1.7 Spacing System

**Spacing Scale:**
- `gap-2` (8px) - Tight spacing (inline items, badges)
- `gap-3` (12px) - Default spacing (card content)
- `gap-4` (16px) - Section spacing
- `gap-6` (24px) - Page spacing (default)
- `gap-8` (32px) - Major section spacing

**Padding Scale:**
- `p-2` (8px) - Tight padding (small components)
- `p-3` (12px) - Compact padding (metadata boxes)
- `p-4` (16px) - Default padding (cards, sections)
- `p-6` (24px) - Page padding (main containers)

---

## 2. Component Enhancement Specifications

### 2.1 ActiveTableCard Component

**File:** `apps/web/src/features/active-tables/components/active-table-card.tsx`

**Current Issues:**
- Generic Database icon for all module types
- Inconsistent badge hierarchy
- Button actions overflow on small screens
- No visual distinction between module types

**Enhancement Plan:**

#### 2.1.1 Header Section
```tsx
<CardHeader className="pb-4">
  <div className="flex items-start justify-between gap-3">
    {/* LEFT: Icon + Title + Description */}
    <div className="flex items-start gap-3">
      {/* NEW: Module type icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
        <ModuleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {table.name}
          </CardTitle>
          {/* Status badge - smaller, less prominent */}
          <Badge variant="outline" className="text-[10px] capitalize">
            {statusLabel}
          </Badge>
        </div>

        {table.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {table.description}
          </p>
        )}
      </div>
    </div>

    {/* RIGHT: Encryption badge + Menu */}
    <div className="flex flex-col items-end gap-2">
      <Badge
        variant={isE2EE ? 'default' : 'outline'}
        className={cn(
          'flex items-center gap-1 text-xs',
          isE2EE
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : '',
        )}
      >
        {isE2EE ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            E2EE
          </>
        ) : (
          <>
            <Shield className="h-3.5 w-3.5" />
            Server
          </>
        )}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Menu items */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</CardHeader>
```

#### 2.1.2 Content Section - Metadata Grid
```tsx
<CardContent className="flex flex-col gap-3 text-sm">
  {/* Enhanced metadata grid with icons */}
  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
    {/* Field count */}
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Table className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">{fieldCount} fields</span>
      </div>
      {/* Field preview badges */}
      {fieldPreview.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {fieldPreview.map((field) => (
            <Badge
              key={field.name}
              variant="secondary"
              className="max-w-[120px] truncate text-[10px] uppercase"
            >
              {field.label}
            </Badge>
          ))}
          {fieldCount > fieldPreview.length && (
            <Badge variant="outline" className="text-[10px]">
              +{fieldCount - fieldPreview.length}
            </Badge>
          )}
        </div>
      )}
    </div>

    {/* Automation count */}
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Workflow className="h-3.5 w-3.5 text-purple-500" />
        <span className="font-medium">
          {actionsCount} automation{actionsCount === 1 ? '' : 's'}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {actionsCount
          ? `${actionsCount} workflow${actionsCount === 1 ? '' : 's'} configured`
          : 'No automation rules'}
      </p>
    </div>

    {/* Smart filters */}
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-3.5 w-3.5 text-blue-500" />
        <span className="font-medium">
          {quickFilterCount} smart filter{quickFilterCount === 1 ? '' : 's'}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {quickFilterCount
          ? 'Quick filters available'
          : 'No filters defined'}
      </p>
    </div>
  </div>

  {/* Encryption warning (if applicable) */}
  {!isEncryptionReady && isE2EE && (
    <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50/80 p-2 text-xs text-yellow-900 dark:border-yellow-500/40 dark:bg-yellow-950/40 dark:text-yellow-200">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>Encryption key not available. Cannot decrypt.</span>
    </div>
  )}
</CardContent>
```

#### 2.1.3 Footer Section - Actions
```tsx
<CardFooter className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
  {/* Primary actions - wrap on mobile */}
  <div className="flex flex-wrap items-center gap-2">
    <Button size="sm" onClick={() => onOpen?.(table)}>
      View Details
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onOpenRecords?.(table)}
    >
      <Database className="mr-2 h-4 w-4" />
      Records
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onConfigure?.(table)}
    >
      <Settings2 className="mr-2 h-4 w-4" />
      Configure
    </Button>
  </div>

  {/* Secondary actions - ghost variant */}
  <div className="flex flex-wrap items-center gap-2">
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onOpenComments?.(table)}
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      Comments
    </Button>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onOpenAutomations?.(table)}
    >
      <Workflow className="mr-2 h-4 w-4" />
      Automations
    </Button>
  </div>

  {/* Timestamp */}
  <div className="text-xs text-muted-foreground">
    {updatedAtLabel
      ? `Updated ${updatedAtLabel}`
      : '\u00A0'
    }
  </div>
</CardFooter>
```

**Key Changes:**
- ✅ Add module-type icon with background
- ✅ Smaller status badge (text-[10px])
- ✅ Enhanced metadata grid with icon-label pairs
- ✅ Improved button hierarchy (primary → outline → ghost)
- ✅ Responsive button wrapping
- ✅ Color-coded icons for different features

---

### 2.2 ActiveTablesPage Component

**File:** `apps/web/src/features/active-tables/pages/active-tables-page.tsx`

**Current Issues:**
- Plain header without visual hierarchy
- Filter UI could be more intuitive
- Stats cards lack icon emphasis
- Search bar could be more prominent

**Enhancement Plan:**

#### 2.2.1 Page Header
```tsx
<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
  {/* LEFT: Title + Breadcrumb */}
  <div className="space-y-1">
    <h1 className="text-3xl font-bold tracking-tight">
      {m.activeTables_page_title()}
    </h1>
    <p className="text-sm text-muted-foreground">
      {workspaceName
        ? `Workspace • ${workspaceName}`
        : m.activeTables_page_subtitle()
      }
    </p>
  </div>

  {/* RIGHT: Search + Actions */}
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    {/* Enhanced search bar */}
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={m.activeTables_page_searchPlaceholder()}
        className="h-10 rounded-lg border-border/60 bg-background/80 pl-10 pr-4 shadow-sm focus:border-primary"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 min-w-[200px] justify-between rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate text-sm">
                {workspaceName ?? 'Select workspace'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          {/* Workspace list */}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shadow-sm"
        onClick={() => refetch()}
      >
        <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
      </Button>

      <Button className="h-10 shadow-sm" onClick={handleCreateTable}>
        <Plus className="mr-2 h-4 w-4" />
        Create Table
      </Button>
    </div>
  </div>
</div>
```

#### 2.2.2 Stats Cards - Enhanced
```tsx
<div className="grid gap-4 md:grid-cols-3">
  {/* Active Tables Card */}
  <Card className="border-border/60 transition-shadow hover:shadow-md">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Database className="h-4 w-4 text-primary" />
          </div>
          Active tables
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-foreground">
        {totalTables}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Across {workGroups.length} workgroup{workGroups.length === 1 ? '' : 's'}
      </p>
    </CardContent>
  </Card>

  {/* E2EE Card */}
  <Card className="border-border/60 transition-shadow hover:shadow-md">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          End-to-end encrypted
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-foreground">
        {encryptedTables}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {encryptedTables
          ? `${encryptedPercentage}% of catalog`
          : 'Ready to secure sensitive data'
        }
      </p>
    </CardContent>
  </Card>

  {/* Automation Card */}
  <Card className="border-border/60 transition-shadow hover:shadow-md">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <Workflow className="h-4 w-4 text-purple-600" />
          </div>
          Automation ready
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-foreground">
        {automationEnabledTables}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Trigger workflows directly from records
      </p>
    </CardContent>
  </Card>
</div>
```

**Key Changes:**
- ✅ Icon backgrounds with color coding
- ✅ Hover effect on stats cards
- ✅ Improved spacing and padding
- ✅ Better visual hierarchy with icon emphasis

#### 2.2.3 Filter Panel - Enhanced
```tsx
<div className="flex flex-col gap-4">
  {/* Filter summary badges */}
  <div className="flex flex-wrap items-center gap-2 text-xs">
    <Badge variant="outline" className="border-dashed">
      {filteredTotalTables} tables
    </Badge>
    <Badge variant="secondary" className="border-dashed">
      {workGroups.length} work groups
    </Badge>
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1">
      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-foreground">
        {activeFilterCount
          ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
          : 'No filters applied'
        }
      </span>
    </div>
  </div>

  {/* Enhanced filter panel */}
  <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-4 shadow-sm">
    {/* Work Group filters */}
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={selectedWorkGroupId === 'all' ? 'default' : 'outline'}
        size="sm"
        className="shadow-sm"
        onClick={() => setSelectedWorkGroupId('all')}
      >
        All work groups
      </Button>
      {workGroups.map((group) => (
        <Button
          key={group.id}
          variant={selectedWorkGroupId === group.id ? 'default' : 'outline'}
          size="sm"
          className="shadow-sm"
          onClick={() => setSelectedWorkGroupId(group.id)}
        >
          {group.name}
        </Button>
      ))}
    </div>

    {/* Status filters */}
    {statusOptions.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
          Status
        </Badge>
        <Button
          size="sm"
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          className="shadow-sm"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        {statusOptions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? 'default' : 'outline'}
            className="capitalize shadow-sm"
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>
    )}

    {/* Encryption filters */}
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
        <ShieldCheck className="mr-1 h-3 w-3" />
        Encryption
      </Badge>
      <Button
        size="sm"
        variant={encryptionFilter === 'all' ? 'default' : 'outline'}
        className="shadow-sm"
        onClick={() => setEncryptionFilter('all')}
      >
        All
      </Button>
      <Button
        size="sm"
        variant={encryptionFilter === 'encrypted' ? 'default' : 'outline'}
        className="shadow-sm"
        onClick={() => setEncryptionFilter('encrypted')}
      >
        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
        E2EE
      </Button>
      <Button
        size="sm"
        variant={encryptionFilter === 'standard' ? 'default' : 'outline'}
        className="shadow-sm"
        onClick={() => setEncryptionFilter('standard')}
      >
        <Shield className="mr-1.5 h-3.5 w-3.5" />
        Server-side
      </Button>
    </div>

    {/* Automation filters */}
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
        <Workflow className="mr-1 h-3 w-3" />
        Automation
      </Badge>
      <Button
        size="sm"
        variant={automationFilter === 'all' ? 'default' : 'outline'}
        className="shadow-sm"
        onClick={() => setAutomationFilter('all')}
      >
        All
      </Button>
      <Button
        size="sm"
        variant={automationFilter === 'automated' ? 'default' : 'outline'}
        className="shadow-sm"
        onClick={() => setAutomationFilter('automated')}
      >
        With workflows
      </Button>
      <Button
        size="sm"
        variant={automationFilter === 'manual' ? 'default' : 'outline'}
        className="shadow-sm"
        onClick={() => setAutomationFilter('manual')}
      >
        Manual only
      </Button>
    </div>
  </div>
</div>
```

**Key Changes:**
- ✅ Gradient background for filter panel
- ✅ Shadow on buttons for depth
- ✅ Icon labels for filter categories
- ✅ Better visual grouping with badges

---

### 2.3 ActiveTableRecordsPage Component

**File:** `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Enhancement Plan:**

#### 2.3.1 Page Header
```tsx
<div className="flex flex-col gap-4 border-b border-border/60 pb-6">
  {/* Breadcrumb */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate({ to: `${localePrefix}/workspaces/tables`, search: { workspaceId } })}
    className="w-fit"
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to modules
  </Button>

  {/* Title + Actions */}
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="space-y-2">
      {/* Module icon + title */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
          <ModuleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTable?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {fieldCount} fields • {records.length} records
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {isE2EE && (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="mr-1 h-3 w-3" />
            E2EE
          </Badge>
        )}
        <Badge variant="outline">
          {m.activeTables_records_recordsBadge()}
        </Badge>
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={() => setIsRecordDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Record
      </Button>
      <Button size="sm" variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button size="sm" variant="outline">
        <Filter className="mr-2 h-4 w-4" />
        Filters
      </Button>
    </div>
  </div>
</div>
```

#### 2.3.2 Table View - Enhanced
```tsx
<table className="min-w-full divide-y divide-border/70 text-sm">
  <thead className="bg-muted/50">
    <tr>
      <th className="sticky left-0 z-10 bg-muted/80 px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <Checkbox />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ID
          </span>
        </div>
      </th>
      {fields.map((field) => (
        <th
          key={field.name}
          className="px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <FieldTypeIcon type={field.type} className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {field.label}
            </span>
          </div>
        </th>
      ))}
      <th className="px-4 py-3 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Updated At
        </span>
      </th>
      <th className="px-4 py-3 text-right">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Actions
        </span>
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border/60 bg-background">
    {records.map((record) => (
      <tr
        key={record.id}
        className="group cursor-pointer transition-colors hover:bg-muted/30"
        onClick={() => onSelect?.(record)}
      >
        <td className="sticky left-0 z-10 bg-background/95 px-4 py-3 group-hover:bg-muted/30">
          <div className="flex items-center gap-2">
            <Checkbox />
            <span className="font-mono text-xs text-muted-foreground">
              {record.id.slice(0, 8)}
            </span>
          </div>
        </td>
        {/* Field cells */}
        {/* ... */}
      </tr>
    ))}
  </tbody>
</table>
```

**Key Changes:**
- ✅ Module icon in header
- ✅ Field type icons in column headers
- ✅ Checkbox for bulk selection
- ✅ Hover effect on rows
- ✅ Shortened ID display with monospace font

---

### 2.4 Empty States

**Enhancement Plan:**

```tsx
<div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-12">
  {/* Illustration or Icon */}
  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
    <Database className="h-10 w-10 text-muted-foreground/50" />
  </div>

  {/* Title */}
  <h3 className="mb-2 text-lg font-semibold text-foreground">
    No modules yet
  </h3>

  {/* Description */}
  <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
    Modules help your teams manage structured data securely.
    Create a new module to get started.
  </p>

  {/* CTA */}
  <Button onClick={onCreate}>
    <Plus className="mr-2 h-4 w-4" />
    Create Module
  </Button>
</div>
```

---

## 3. Implementation Phases

### Phase 1: Icon System Integration (Day 1)
**Estimated Time:** 4-6 hours

**Tasks:**
1. Create `getModuleIcon()` utility function
2. Create `getModuleColor()` utility function
3. Update ActiveTableCard to use module-specific icons
4. Add icon backgrounds with color coding
5. Update stats cards with icon backgrounds
6. Test icon rendering across all module types

**Files to Modify:**
- `apps/web/src/features/active-tables/utils/module-icons.ts` (NEW)
- `apps/web/src/features/active-tables/components/active-table-card.tsx`
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx`

**Acceptance Criteria:**
- ✅ Each module type shows correct icon
- ✅ Icons have appropriate color coding
- ✅ Icon sizes are consistent (sm, md, lg)
- ✅ Dark mode colors work properly

---

### Phase 2: Typography Updates (Day 1-2)
**Estimated Time:** 3-4 hours

**Tasks:**
1. Update page titles to `text-3xl font-bold tracking-tight`
2. Update section titles to `text-xl font-semibold tracking-tight`
3. Update card titles to `text-xl font-semibold tracking-tight`
4. Apply label styles (`text-xs font-medium uppercase tracking-wide`)
5. Update body text sizing and line heights
6. Add responsive typography classes

**Files to Modify:**
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx`
- `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`
- `apps/web/src/features/active-tables/components/active-table-card.tsx`
- `apps/web/src/features/active-tables/components/table-management-dialog.tsx`

**Acceptance Criteria:**
- ✅ Clear visual hierarchy across all pages
- ✅ Consistent font sizes and weights
- ✅ Responsive scaling on mobile
- ✅ Readable contrast ratios (WCAG AA)

---

### Phase 3: Button Redesign (Day 2)
**Estimated Time:** 4-5 hours

**Tasks:**
1. Update button variants (default, outline, ghost)
2. Apply consistent button sizes (sm, default, lg)
3. Add shadow effects (`shadow-sm`)
4. Implement button groups with proper spacing
5. Update icon placements in buttons
6. Test button states (hover, active, disabled)

**Files to Modify:**
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx`
- `apps/web/src/features/active-tables/components/active-table-card.tsx`
- `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`
- `apps/web/src/features/active-tables/components/table-management-dialog.tsx`

**Acceptance Criteria:**
- ✅ Consistent button hierarchy across pages
- ✅ Clear primary vs secondary actions
- ✅ Proper icon alignment and sizing
- ✅ Smooth hover transitions
- ✅ Accessible focus states

---

### Phase 4: Layout & Spacing (Day 3)
**Estimated Time:** 5-6 hours

**Tasks:**
1. Update card spacing (gap-3, p-4, pb-4, pt-4)
2. Enhance metadata grid with borders and backgrounds
3. Update page padding (p-6)
4. Add section spacing (gap-6, gap-8)
5. Improve filter panel layout
6. Update responsive breakpoints

**Files to Modify:**
- `apps/web/src/features/active-tables/components/active-table-card.tsx`
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx`
- `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Acceptance Criteria:**
- ✅ Consistent spacing throughout
- ✅ Proper grid alignment
- ✅ Card content doesn't feel cramped
- ✅ Responsive wrapping on mobile
- ✅ Visual separation between sections

---

### Phase 5: Visual Polish (Day 4)
**Estimated Time:** 6-8 hours

**Tasks:**
1. Add hover effects (shadow-md, transitions)
2. Implement gradient backgrounds (filter panel)
3. Add color coding for badges
4. Update border opacities (border-border/60, border-border/70)
5. Enhance encryption status badges
6. Add subtle animations (spin, fade)

**Files to Modify:**
- All component files from previous phases
- `packages/ui/src/components/card.tsx` (if needed)
- `packages/ui/src/components/badge.tsx` (if needed)

**Acceptance Criteria:**
- ✅ Smooth hover transitions
- ✅ Proper shadow depth
- ✅ Color-coded visual treatments
- ✅ Subtle loading animations
- ✅ No jarring transitions

---

### Phase 6: Empty States & Loading (Day 4-5)
**Estimated Time:** 3-4 hours

**Tasks:**
1. Redesign empty state components
2. Add large icons to empty states
3. Update loading skeletons
4. Improve error state designs
5. Add contextual help text

**Files to Modify:**
- `apps/web/src/features/active-tables/components/active-tables-empty-state.tsx`
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx`
- `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Acceptance Criteria:**
- ✅ Clear empty state messaging
- ✅ Helpful CTAs
- ✅ Consistent loading states
- ✅ Informative error messages

---

### Phase 7: Responsive Optimization (Day 5)
**Estimated Time:** 4-5 hours

**Tasks:**
1. Test all views on mobile (< 768px)
2. Test tablet layout (768-1024px)
3. Adjust button wrapping on small screens
4. Optimize card grids for different breakpoints
5. Test filter panel responsiveness
6. Verify typography scaling

**Devices to Test:**
- Mobile: iPhone SE, iPhone 14, Android
- Tablet: iPad, iPad Pro
- Desktop: 1440px, 1920px

**Acceptance Criteria:**
- ✅ No horizontal scroll on mobile
- ✅ Buttons wrap gracefully
- ✅ Cards stack properly
- ✅ Typography scales appropriately
- ✅ Touch targets >= 44px

---

### Phase 8: Accessibility Audit (Day 5)
**Estimated Time:** 3-4 hours

**Tasks:**
1. Verify color contrast ratios (WCAG AA)
2. Test keyboard navigation
3. Verify screen reader announcements
4. Add ARIA labels where needed
5. Test focus indicators
6. Verify semantic HTML structure

**Tools:**
- axe DevTools
- Lighthouse Accessibility Audit
- NVDA/VoiceOver screen readers
- Keyboard-only navigation

**Acceptance Criteria:**
- ✅ All contrast ratios meet WCAG AA
- ✅ Full keyboard navigation support
- ✅ Proper ARIA attributes
- ✅ Clear focus indicators
- ✅ Screen reader friendly

---

## 4. File Change Log

### Files to Create

1. **`apps/web/src/features/active-tables/utils/module-icons.ts`**
   - Purpose: Centralized module icon and color utilities
   - Exports: `getModuleIcon()`, `getModuleColor()`, `MODULE_ICONS`, `MODULE_COLORS`

### Files to Modify

1. **`apps/web/src/features/active-tables/components/active-table-card.tsx`**
   - Add module icon in header
   - Update badge hierarchy
   - Enhance metadata grid
   - Improve button layout
   - Add hover effects

2. **`apps/web/src/features/active-tables/pages/active-tables-page.tsx`**
   - Update page header
   - Enhance stats cards
   - Improve filter panel
   - Add search bar styling
   - Update spacing

3. **`apps/web/src/features/active-tables/pages/active-table-records-page.tsx`**
   - Add module icon to header
   - Enhance table headers
   - Update button actions
   - Improve empty states

4. **`apps/web/src/features/active-tables/components/active-tables-empty-state.tsx`**
   - Redesign empty state layout
   - Add large icon
   - Update typography
   - Improve CTA button

5. **`apps/web/src/features/active-tables/components/table-management-dialog.tsx`**
   - Update form layout
   - Enhance field labels
   - Improve button placement
   - Add visual feedback

6. **`apps/web/src/features/active-tables/components/record-kanban-view.tsx`**
   - Update kanban card design
   - Add module icons
   - Improve drag indicators
   - Enhance column headers

7. **`apps/web/src/features/active-tables/components/record-comments-panel.tsx`**
   - Update comment card design
   - Improve avatar sizing
   - Enhance timestamp display
   - Better action buttons

### Files to Review (No Changes Expected)

1. **`packages/ui/src/components/button.tsx`** - Already well-structured
2. **`packages/ui/src/components/badge.tsx`** - Already well-structured
3. **`packages/ui/src/components/card.tsx`** - Already well-structured
4. **`packages/ui/src/styles/globals.css`** - CSS variables already defined

---

## 5. Code Examples

### 5.1 Module Icon Utility

**File:** `apps/web/src/features/active-tables/utils/module-icons.ts`

```typescript
import {
  Users,
  UserCog,
  DollarSign,
  TrendingUp,
  Package,
  Database,
  Briefcase,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

/**
 * Module type to icon mapping
 */
export const MODULE_ICONS: Record<string, LucideIcon> = {
  hrm: Users,
  employee: Users,
  team: Users,
  staff: Users,
  crm: UserCog,
  customer: UserCog,
  contact: UserCog,
  client: UserCog,
  finance: DollarSign,
  budget: DollarSign,
  accounting: DollarSign,
  invoice: DollarSign,
  sales: TrendingUp,
  deals: TrendingUp,
  opportunity: TrendingUp,
  operations: Package,
  tasks: Package,
  project: Briefcase,
  workflow: Briefcase,
  inventory: ShoppingCart,
  standard: Database,
} as const;

/**
 * Module type to color mapping (Tailwind color classes)
 */
export const MODULE_COLORS = {
  hrm: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    icon: 'text-blue-600',
  },
  crm: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20',
    icon: 'text-teal-600',
  },
  finance: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    icon: 'text-amber-600',
  },
  sales: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    icon: 'text-purple-600',
  },
  operations: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    icon: 'text-rose-600',
  },
  standard: {
    bg: 'bg-muted/30',
    text: 'text-foreground',
    border: 'border-border',
    icon: 'text-primary',
  },
} as const;

/**
 * Get Lucide icon component for a module type
 */
export const getModuleIcon = (moduleType?: string): LucideIcon => {
  if (!moduleType) return MODULE_ICONS.standard;

  const normalized = moduleType
    .toLowerCase()
    .replace(/[_-]/g, '')
    .replace(/\s+/g, '');

  return MODULE_ICONS[normalized] || MODULE_ICONS.standard;
};

/**
 * Get color classes for a module type
 */
export const getModuleColor = (moduleType?: string) => {
  if (!moduleType) return MODULE_COLORS.standard;

  const normalized = moduleType
    .toLowerCase()
    .replace(/[_-]/g, '')
    .replace(/\s+/g, '');

  // Find first matching key
  for (const [key, colors] of Object.entries(MODULE_COLORS)) {
    if (normalized.includes(key)) {
      return colors;
    }
  }

  return MODULE_COLORS.standard;
};

/**
 * Get module category label
 */
export const getModuleCategory = (moduleType?: string): string => {
  if (!moduleType) return 'Standard';

  const normalized = moduleType.toLowerCase();

  if (normalized.includes('hrm') || normalized.includes('employee')) return 'HRM Suite';
  if (normalized.includes('crm') || normalized.includes('customer')) return 'CRM Suite';
  if (normalized.includes('finance') || normalized.includes('budget')) return 'Finance Suite';
  if (normalized.includes('sales') || normalized.includes('deal')) return 'Sales Suite';
  if (normalized.includes('operations') || normalized.includes('task')) return 'Operations Suite';

  return 'Standard';
};
```

---

### 5.2 Enhanced ActiveTableCard Header

```tsx
import { getModuleIcon, getModuleColor } from '../utils/module-icons';

export const ActiveTableCard = memo(({ table, ... }: ActiveTableCardProps) => {
  const ModuleIcon = getModuleIcon(table.tableType);
  const moduleColors = getModuleColor(table.tableType);

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/70 bg-background/90 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* LEFT: Icon + Title + Description */}
          <div className="flex items-start gap-3">
            {/* Module icon with color-coded background */}
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              moduleColors.bg
            )}>
              <ModuleIcon className={cn("h-6 w-6", moduleColors.icon)} />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  {table.name}
                </CardTitle>
                {/* Smaller status badge */}
                <Badge
                  variant="outline"
                  className="text-[10px] capitalize"
                >
                  {statusLabel}
                </Badge>
              </div>

              {table.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {table.description}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Encryption badge + Menu */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            {/* Encryption badge - more compact */}
            <Badge
              variant={isE2EE ? 'default' : 'outline'}
              className={cn(
                'flex items-center gap-1 text-xs',
                isE2EE
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : '',
              )}
            >
              {isE2EE ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  E2EE
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  Server
                </>
              )}
            </Badge>

            {/* Action menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onConfigure && (
                  <DropdownMenuItem onClick={() => onConfigure(table)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Configure
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(table)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Rest of card... */}
    </Card>
  );
});
```

---

### 5.3 Enhanced Filter Panel

```tsx
<div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-4 shadow-sm">
  {/* Work Group filters */}
  <div className="flex flex-wrap items-center gap-2">
    <Button
      variant={selectedWorkGroupId === 'all' ? 'default' : 'outline'}
      size="sm"
      className="shadow-sm transition-all hover:scale-105"
      onClick={() => setSelectedWorkGroupId('all')}
    >
      <Folder className="mr-1.5 h-3.5 w-3.5" />
      All work groups
    </Button>
    {workGroups.map((group) => (
      <Button
        key={group.id}
        variant={selectedWorkGroupId === group.id ? 'default' : 'outline'}
        size="sm"
        className="shadow-sm transition-all hover:scale-105"
        onClick={() => setSelectedWorkGroupId(group.id)}
      >
        {group.name}
      </Button>
    ))}
  </div>

  {/* Encryption filters with icons */}
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
      <ShieldCheck className="mr-1 h-3 w-3" />
      Encryption
    </Badge>
    <Button
      size="sm"
      variant={encryptionFilter === 'all' ? 'default' : 'outline'}
      className="shadow-sm"
      onClick={() => setEncryptionFilter('all')}
    >
      All
    </Button>
    <Button
      size="sm"
      variant={encryptionFilter === 'encrypted' ? 'default' : 'outline'}
      className="shadow-sm"
      onClick={() => setEncryptionFilter('encrypted')}
    >
      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
      E2EE
    </Button>
    <Button
      size="sm"
      variant={encryptionFilter === 'standard' ? 'default' : 'outline'}
      className="shadow-sm"
      onClick={() => setEncryptionFilter('standard')}
    >
      <Shield className="mr-1.5 h-3.5 w-3.5" />
      Server-side
    </Button>
  </div>

  {/* Similar patterns for Automation filters */}
</div>
```

---

## 6. Testing Strategy

### 6.1 Visual Regression Testing

**Tools:**
- Playwright for screenshot comparison
- Chromatic for visual diff tracking

**Test Cases:**
1. Module cards across different module types
2. Stats cards with various counts
3. Filter panel in different states
4. Empty states
5. Loading skeletons
6. Error states

**Breakpoints to Test:**
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1440px, 1920px

---

### 6.2 Responsive Design Testing

**Devices:**
- iPhone SE (375x667)
- iPhone 14 (390x844)
- iPad (768x1024)
- iPad Pro (1024x1366)
- Desktop (1440x900, 1920x1080)

**Test Scenarios:**
1. Card grid wrapping behavior
2. Button text wrapping on small screens
3. Filter panel responsiveness
4. Table horizontal scrolling
5. Dialog sizing on mobile

**Tools:**
- Chrome DevTools Device Mode
- BrowserStack for real devices
- Responsive Design Checker

---

### 6.3 Accessibility Testing

**Manual Testing:**
1. Keyboard navigation through all interactive elements
2. Tab order verification
3. Focus indicator visibility
4. Screen reader announcements (NVDA, VoiceOver)
5. High contrast mode compatibility

**Automated Testing:**
1. axe DevTools scan
2. Lighthouse Accessibility audit
3. WAVE browser extension
4. pa11y CLI testing

**Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Color contrast ratios >= 4.5:1 (WCAG AA)
- [ ] ARIA labels present where needed
- [ ] Semantic HTML structure
- [ ] Alt text for all icons (via aria-label)
- [ ] No keyboard traps
- [ ] Logical tab order

---

### 6.4 Cross-Browser Testing

**Browsers:**
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

**Test Focus:**
- Icon rendering
- Shadow and gradient support
- CSS Grid and Flexbox layouts
- Hover states
- Transitions and animations
- Dark mode

---

### 6.5 Performance Testing

**Metrics:**
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

**Tools:**
- Lighthouse Performance audit
- WebPageTest
- Chrome DevTools Performance profiler

**Optimizations:**
- Lazy load module cards (use intersection observer)
- Debounce search input
- Memoize expensive computations
- Virtual scrolling for large record lists

---

## 7. Risk Assessment

### High Risk Items

1. **Breaking Changes to Component APIs**
   - **Risk:** Modifying component props could break other pages
   - **Mitigation:**
     - Make changes backward compatible
     - Add new props instead of modifying existing
     - Use TypeScript strict mode
     - Test all active-tables routes

2. **Performance Degradation**
   - **Risk:** Adding shadows, gradients, and hover effects could impact performance
   - **Mitigation:**
     - Use `will-change` sparingly
     - Test on lower-end devices
     - Monitor bundle size
     - Lazy load heavy components

3. **Dark Mode Inconsistencies**
   - **Risk:** New color tokens might not work well in dark mode
   - **Mitigation:**
     - Test all changes in both light and dark modes
     - Use CSS custom properties
     - Follow existing dark mode patterns
     - Add dark mode variants for all custom colors

### Medium Risk Items

1. **Typography Reflow**
   - **Risk:** Changing font sizes could break layouts
   - **Mitigation:**
     - Test on multiple screen sizes
     - Use `line-clamp` for overflow
     - Add truncation where needed

2. **Icon Licensing**
   - **Risk:** Lucide icons already used, but verify licensing
   - **Mitigation:**
     - Verify Lucide license (ISC - permissive)
     - Document icon usage
     - Keep icon library up to date

3. **i18n Compatibility**
   - **Risk:** Typography changes might not work well with Vietnamese text
   - **Mitigation:**
     - Test with Vietnamese locale
     - Verify Vietnamese typography optimization (from design-system.md)
     - Check text wrapping behavior

### Low Risk Items

1. **Button Variant Changes**
   - **Risk:** Existing button styles are already well-defined
   - **Mitigation:** Follow existing button system from `packages/ui`

2. **Spacing Adjustments**
   - **Risk:** Consistent spacing system already in place
   - **Mitigation:** Use existing Tailwind spacing scale

---

## 8. Design System Compliance

### 8.1 CSS Custom Properties

All color values MUST use CSS custom properties from `packages/ui/src/styles/globals.css`:

```css
/* Light mode */
--background: hsl(0 0% 100%);
--foreground: hsl(0 0% 3.9%);
--primary: hsl(0 0% 9%);
--muted: hsl(0 0% 96.1%);
--muted-foreground: hsl(0 0% 45.1%);
--border: hsl(0 0% 89.8%);
/* ... etc */

/* Dark mode */
.dark {
  --background: hsl(0 0% 3.9%);
  --foreground: hsl(0 0% 98%);
  /* ... etc */
}
```

**Usage:**
```tsx
// ✅ Correct
<div className="bg-background text-foreground border-border">

// ❌ Incorrect
<div className="bg-white text-black border-gray-200">
```

---

### 8.2 Accessibility Requirements (WCAG 2.1 AA)

**Color Contrast:**
- Normal text (< 18px): >= 4.5:1
- Large text (>= 18px or bold >= 14px): >= 3:1
- UI components and graphics: >= 3:1

**Interactive Elements:**
- Minimum touch target size: 44x44px
- Focus indicators: visible and >= 3:1 contrast
- Keyboard navigation: full support

**Screen Readers:**
- All icons with semantic meaning need `aria-label`
- Complex interactions need `aria-describedby`
- Form inputs need associated labels

---

### 8.3 Mobile-First Responsive Design

**Breakpoints (from Tailwind):**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Design Approach:**
1. Start with mobile layout (< 640px)
2. Add `sm:` classes for tablet
3. Add `lg:` classes for desktop

**Example:**
```tsx
<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
  {/* Mobile: stacked, Desktop: horizontal */}
</div>
```

---

### 8.4 Vietnamese Typography Optimization

**From design-system.md:**
- Font stack includes Geist Sans (optimized for Vietnamese diacritics)
- Use `line-height: 1.6` for Vietnamese body text
- Avoid all-caps for Vietnamese text
- Test with Vietnamese i18n messages

**i18n Testing:**
```tsx
// Always test with Vietnamese locale
const locale = 'vi';
{m.activeTables_page_title()} // Should render properly
```

---

### 8.5 Dark Mode Support

**All components MUST support dark mode via the `dark:` variant:**

```tsx
<Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
  E2EE
</Badge>

<div className="border border-border/60 bg-muted/30 dark:bg-muted/20">
  Content
</div>
```

**Testing:**
- Toggle dark mode in browser/OS settings
- Verify all colors have proper dark variants
- Check readability and contrast

---

## 9. Success Criteria

### Visual Quality
- [ ] Module icons display correctly for all types
- [ ] Typography hierarchy is clear and consistent
- [ ] Button variants follow design system
- [ ] Badge colors match specifications
- [ ] Spacing is consistent throughout
- [ ] Hover effects are smooth and subtle
- [ ] Shadows add appropriate depth
- [ ] Color coding is intuitive

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Full keyboard navigation works
- [ ] Screen readers announce content correctly
- [ ] Focus indicators are visible
- [ ] Color contrast ratios meet standards
- [ ] Touch targets are adequate

### Performance
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] No janky animations
- [ ] Smooth scrolling on mobile

### Responsive Design
- [ ] Mobile layout works (< 768px)
- [ ] Tablet layout works (768-1024px)
- [ ] Desktop layout works (> 1024px)
- [ ] No horizontal scroll on any device
- [ ] Text scales appropriately

### Cross-Browser
- [ ] Works in Chrome 120+
- [ ] Works in Firefox 120+
- [ ] Works in Safari 17+
- [ ] Works in Edge 120+

### i18n
- [ ] Vietnamese text renders correctly
- [ ] English text renders correctly
- [ ] Typography handles diacritics well
- [ ] No text overflow issues

---

## 10. QA Validation Checklist

### Pre-Implementation Review
- [ ] Design specifications reviewed and approved
- [ ] Component inventory complete
- [ ] File change log validated
- [ ] Implementation phases agreed upon
- [ ] Risk assessment reviewed

### During Implementation
- [ ] Code follows existing patterns from CLAUDE.md
- [ ] TypeScript types are complete and strict
- [ ] Component props are documented
- [ ] Changes are backward compatible
- [ ] Commits are incremental and logical

### Post-Implementation
- [ ] All acceptance criteria met for each phase
- [ ] Visual regression tests pass
- [ ] Responsive design tests pass
- [ ] Accessibility audits pass
- [ ] Performance metrics meet targets
- [ ] Cross-browser tests pass
- [ ] i18n tests pass
- [ ] Dark mode tests pass

### User Acceptance
- [ ] Stakeholder review complete
- [ ] User feedback collected
- [ ] Edge cases addressed
- [ ] Documentation updated
- [ ] Deployment plan approved

---

## Appendix A: Icon Reference Chart

| Module Type | Icon Name | Lucide Component | Color Theme |
|-------------|-----------|------------------|-------------|
| HRM / Employee / Team / Staff | Users | `<Users />` | Blue (`hsl(220 70% 50%)`) |
| CRM / Customer / Contact / Client | User Cog | `<UserCog />` | Teal (`hsl(160 60% 45%)`) |
| Finance / Budget / Accounting / Invoice | Dollar Sign | `<DollarSign />` | Amber (`hsl(30 80% 55%)`) |
| Sales / Deals / Opportunity | Trending Up | `<TrendingUp />` | Purple (`hsl(280 65% 60%)`) |
| Operations / Tasks | Package | `<Package />` | Rose (`hsl(340 75% 55%)`) |
| Project / Workflow | Briefcase | `<Briefcase />` | Indigo |
| Inventory | Shopping Cart | `<ShoppingCart />` | Green |
| Standard / Generic | Database | `<Database />` | Primary |

---

## Appendix B: Button Usage Matrix

| Context | Action Type | Variant | Size | Icon Position |
|---------|-------------|---------|------|---------------|
| Page header | Primary action (Create) | `default` | `default` | Leading |
| Card footer | View/Open | `default` | `sm` | Trailing |
| Card footer | Configure/Edit | `outline` | `sm` | Leading |
| Card footer | Comments/Automations | `ghost` | `sm` | Leading |
| Dropdown menu | Edit | N/A | N/A | Leading |
| Dropdown menu | Delete | N/A (destructive class) | N/A | Leading |
| Filter panel | Filter toggle | `default` or `outline` | `sm` | Optional leading |
| Table actions | Row action | `ghost` | `sm` | Icon only |
| Dialog | Save/Submit | `default` | `default` | No icon |
| Dialog | Cancel | `outline` | `default` | No icon |

---

## Appendix C: Typography Scale Reference

| Element | Mobile | Tablet | Desktop | Weight | Tracking |
|---------|--------|--------|---------|--------|----------|
| Page Title | `text-2xl` (24px) | `text-3xl` (30px) | `text-3xl` (30px) | `font-bold` (700) | `tracking-tight` |
| Section Title | `text-lg` (18px) | `text-xl` (20px) | `text-xl` (20px) | `font-semibold` (600) | `tracking-tight` |
| Card Title | `text-lg` (18px) | `text-xl` (20px) | `text-xl` (20px) | `font-semibold` (600) | `tracking-tight` |
| Body Text | `text-sm` (14px) | `text-sm` (14px) | `text-sm` (14px) | `font-normal` (400) | Normal |
| Label | `text-xs` (12px) | `text-xs` (12px) | `text-xs` (12px) | `font-medium` (500) | `uppercase tracking-wide` |
| Caption | `text-[10px]` | `text-[10px]` | `text-[10px]` | `font-normal` (400) | Normal |

---

## Appendix D: Spacing Guidelines

| Context | Gap/Padding | Value | Usage |
|---------|-------------|-------|-------|
| Page container | `p-6` | 24px | Main page padding |
| Section spacing | `gap-6` | 24px | Between major sections |
| Major sections | `gap-8` | 32px | Large section breaks |
| Card content | `gap-3` | 12px | Within card sections |
| Card header | `pb-4` | 16px | Header bottom padding |
| Card footer | `pt-4` | 16px | Footer top padding |
| Button groups | `gap-2` | 8px | Between buttons |
| Inline items | `gap-2` | 8px | Badges, small items |
| Metadata grid | `gap-3` | 12px | Grid item spacing |

---

**END OF PLAN**

This comprehensive plan is ready for implementation. Each phase is clearly defined with acceptance criteria, estimated times, and specific file changes. The plan maintains backward compatibility, follows the existing design system, and ensures WCAG 2.1 AA accessibility compliance.
