# BEQEEK Design System

## Overview

Design system cho BEQEEK Low-Code Platform, kết hợp best practices từ Notion, Linear, và Slack với các design principles hiện đại.

## 🎨 Design Philosophy

### Core Principles

- **Clarity First** - Information hierarchy rõ ràng, dễ hiểu
- **Efficiency** - Quick access đến frequently used features
- **Consistency** - Unified design language across modules
- **Accessibility** - WCAG 2.1 AA compliance
- **Responsive** - Mobile-first approach

### Visual Identity

- **Modern & Professional** - Clean, minimal aesthetic
- **Trust & Security** - Emphasize E2EE và data protection
- **Vietnamese-friendly** - Typography optimized for Vietnamese content

## 🎯 Color System

### Primary Colors

```css
/* Brand Colors */
--primary: 59 130 246; /* Blue-500 */
--primary-foreground: 255 255 255;

/* Secondary */
--secondary: 241 245 249; /* Slate-100 */
--secondary-foreground: 15 23 42; /* Slate-900 */

/* Accent Colors */
--accent: 241 245 249; /* Slate-100 */
--accent-foreground: 15 23 42; /* Slate-900 */
```

### Semantic Colors

```css
/* Success */
--success: 34 197 94; /* Green-500 */
--success-foreground: 255 255 255;

/* Warning */
--warning: 251 146 60; /* Orange-400 */
--warning-foreground: 255 255 255;

/* Error */
--destructive: 239 68 68; /* Red-500 */
--destructive-foreground: 255 255 255;

/* Muted */
--muted: 241 245 249; /* Slate-100 */
--muted-foreground: 100 116 139; /* Slate-500 */
```

### Background Colors

```css
/* Light Theme */
--background: 255 255 255;
--foreground: 15 23 42;
--card: 255 255 255;
--card-foreground: 15 23 42;
--border: 241 245 249;
--input: 255 255 255;
--ring: 59 130 246;

/* Dark Theme */
--background: 15 23 42; /* Slate-900 */
--foreground: 248 250 252; /* Slate-50 */
--card: 30 41 59; /* Slate-800 */
--card-foreground: 248 250 252;
--border: 51 65 85; /* Slate-700 */
--input: 30 41 59;
--ring: 59 130 246;
```

## 📝 Typography

### Font Stack

```css
/* Primary */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### Type Scale

```css
/* Headings */
--text-4xl: 2.25rem; /* 36px - Page titles */
--text-3xl: 1.875rem; /* 30px - Section headers */
--text-2xl: 1.5rem; /* 24px - Card titles */
--text-xl: 1.25rem; /* 20px - Subsection headers */
--text-lg: 1.125rem; /* 18px - Large body text */

/* Body */
--text-base: 1rem; /* 16px - Default body */
--text-sm: 0.875rem; /* 14px - Small text */
--text-xs: 0.75rem; /* 12px - Captions, labels */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

## 📏 Spacing System

### Scale (8px base unit)

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Component Spacing

```css
/* Padding */
--p-4: 1rem; /* Default padding */
--p-6: 1.5rem; /* Large padding */
--p-8: 2rem; /* Extra large padding */

/* Margin */
--m-4: 1rem; /* Default margin */
--m-6: 1.5rem; /* Large margin */
--m-8: 2rem; /* Extra large margin */

/* Gap */
--gap-4: 1rem; /* Default gap */
--gap-6: 1.5rem; /* Large gap */
--gap-8: 2rem; /* Extra large gap */
```

## 🔲 Layout System

### Container Widths

```css
/* Max Widths */
--container-sm: 640px; /* Small screens */
--container-md: 768px; /* Medium screens */
--container-lg: 1024px; /* Large screens */
--container-xl: 1280px; /* Extra large screens */
--container-2xl: 1536px; /* 2X large screens */
```

### Sidebar Dimensions

```css
/* Sidebar */
--sidebar-width: 280px;
--sidebar-collapsed-width: 64px;
--sidebar-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Header Height

```css
--header-height: 64px;
--header-padding: 1.5rem;
```

## 🎭 Components

### Buttons

#### Primary Button

```css
.btn-primary {
  background: linear-gradient(135deg, rgb(59 130 246), rgb(6 182 212));
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px -5px rgb(59 130 246 / 0.25);
}
```

#### Secondary Button

```css
.btn-secondary {
  background: rgb(241 245 249);
  color: rgb(15 23 42);
  border: 1px solid rgb(226 232 240);
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
}
```

### Cards

#### Default Card

```css
.card {
  background: rgb(255 255 255);
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

#### Dark Card

```css
.card-dark {
  background: rgb(30 41 59);
  border: 1px solid rgb(51 65 85);
  color: rgb(248 250 252);
}
```

### Form Elements

#### Input Fields

```css
.input {
  background: rgb(255 255 255);
  border: 1px solid rgb(226 232 240);
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: rgb(59 130 246);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}
```

#### Dark Input

```css
.input-dark {
  background: rgb(30 41 59);
  border: 1px solid rgb(51 65 85);
  color: rgb(248 250 252);
}
```

## 🎨 Gradients & Effects

### Background Gradients

```css
/* Primary Gradient */
.gradient-primary {
  background: linear-gradient(135deg, rgb(59 130 246), rgb(6 182 212));
}

/* Dark Background Gradient */
.gradient-dark {
  background: linear-gradient(180deg, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42));
}

/* Radial Gradient */
.gradient-radial {
  background: radial-gradient(circle at top, rgb(56 189 248 / 0.15), transparent 55%);
}
```

### Glass Effects

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-dark {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 📱 Responsive Breakpoints

### Breakpoint System

```css
/* Mobile First */
--breakpoint-sm: 640px; /* Small tablets */
--breakpoint-md: 768px; /* Tablets */
--breakpoint-lg: 1024px; /* Laptops */
--breakpoint-xl: 1280px; /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Container Queries

```css
/* Mobile */
@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .main-content {
    margin-left: 0;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 240px;
  }
  .main-content {
    margin-left: 240px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
  }
  .main-content {
    margin-left: 280px;
  }
}
```

## 🎭 Iconography

### Icon Library

- **Primary**: Lucide React
- **Size Scale**: 16px, 20px, 24px, 32px
- **Colors**: Inherit, currentColor, semantic colors

### Common Icons

```typescript
// Navigation
(HomeIcon, BarChart3Icon, FolderIcon, ZapIcon, UsersIcon, SettingsIcon);

// Actions
(PlusIcon, SearchIcon, BellIcon, MenuIcon, XIcon, LogOutIcon);

// Status
(CheckIcon, AlertIcon, XIcon, InfoIcon);
```

## ⚡ Animations

### Transition Presets

```css
/* Fast */
.transition-fast {
  transition: all 0.15s ease;
}

/* Normal */
.transition-normal {
  transition: all 0.2s ease;
}

/* Slow */
.transition-slow {
  transition: all 0.3s ease;
}

/* Easing */
.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Micro-interactions

```css
/* Hover */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
}

/* Active */
.active-scale:active {
  transform: scale(0.98);
}

/* Focus */
.focus-ring:focus-visible {
  outline: 2px solid rgb(59 130 246);
  outline-offset: 2px;
}
```

## 🎯 Component Patterns

### Sidebar Navigation

```typescript
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: SidebarItem[];
  badge?: string;
}
```

### Workspace Cards

```typescript
interface WorkspaceCard {
  id: string;
  name: string;
  namespace: string;
  description?: string;
  memberCount: number;
  tableCount: number;
  workflowCount: number;
  lastActivity: Date;
}
```

### Stats Cards

```typescript
interface StatsCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}
```

## 🔧 Implementation Guidelines

### File Structure

```
src/
├── components/
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── app/             # App-specific components
│   │   ├── app-sidebar.tsx
│   │   ├── app-layout.tsx
│   │   └── workspace-card.tsx
│   └── features/        # Feature-specific components
├── styles/
│   ├── globals.css      # Global styles
│   └── components.css   # Component-specific styles
└── lib/
    ├── utils.ts         # Utility functions
    └── constants.ts    # Design tokens
```

### Naming Conventions

- **Components**: PascalCase (e.g., `AppSidebar`)
- **Props**: camelCase (e.g., `isCollapsed`)
- **CSS Classes**: kebab-case (e.g., `sidebar-item`)
- **Variables**: kebab-case with CSS custom properties (e.g., `--sidebar-width`)

### TypeScript Guidelines

- **Strict typing** cho tất cả props
- **Interface exports** cho component props
- **Generic types** cho reusable components
- **Enum usage** cho constants

## 📚 Usage Examples

### Button Component

```typescript
import { Button } from '@workspace/ui/components/button';

<Button variant="primary" size="md" className="w-full">
  Create Workspace
</Button>
```

### Card Component

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

<Card>
  <CardHeader>
    <CardTitle>Workspace Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Custom Component

```typescript
interface WorkspaceCardProps {
  workspace: Workspace;
  onClick?: () => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  onClick
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-normal" onClick={onClick}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{workspace.name}</h3>
        <p className="text-muted-foreground text-sm">{workspace.description}</p>
      </CardContent>
    </Card>
  );
};
```

## 🚀 Future Enhancements

### Phase 2 Features

- **Dark Mode Toggle** - Complete dark theme implementation
- **Motion Library** - Advanced animations and transitions
- **Component Library** - Storybook documentation
- **Design Tokens** - Dynamic theming system

### Accessibility Improvements

- **Screen Reader Support** - Enhanced ARIA labels
- **Keyboard Navigation** - Full keyboard accessibility
- **High Contrast Mode** - Improved visibility options
- **Reduced Motion** - Respect user preferences

---

_Design System v1.0 - Updated October 2025_
