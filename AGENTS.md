<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding
- **UI/UX Changes**: Any frontend development, component creation, or styling work
- **Design Work**: Layout changes, responsive design, or visual improvements
- Spec format and conventions
- Project structure and guidelines
- **Design System Requirements**: Mandatory UI/UX development standards
- **Component Development**: Workflow and best practices for frontend development

# Repository Guidelines

## Project Structure & Module Organization

- `apps/web` is a Vite + React SPA that uses the TanStack suite (Router, Query, Form) and Tailwind CSS utilities from `@workspace/ui`. Route components live in `src/routes`, shared providers in `src/providers`, global state in `src/stores`, and feature code should colocate with routes when practical.
- `packages/ui` exposes reusable React components (`src/components/**`) and Tailwind styles. Update the barrel exports in `packages/ui/src/index.ts` when adding new primitives.
- `packages/eslint-config` and `packages/typescript-config` provide shared lint/TS baselines; extend these rather than duplicating rules per app.
- `turbo.json` and `pnpm-workspace.yaml` define task pipelines and workspace membership; update both when adding a new package or app.

## Build, Test, and Development Commands

- `pnpm install` hydrates all workspace dependencies using the Node 22 toolchain declared in `package.json`.
- `pnpm dev` runs `turbo dev`, which triggers `pnpm --filter web dev` (Vite dev server). Prefer `pnpm --filter web dev -- --host 127.0.0.1` when binding needs to be explicit.
- `pnpm build` runs `turbo build`, which calls `vite build` in `apps/web` and any package-level build scripts.
- `pnpm lint` executes `turbo lint`; each package should expose a local `lint` script using the shared ESLint config.
- Type-checks run via `pnpm --filter web run check-types` until a unified `check-types` pipeline is in place.

## Coding Style & Naming Conventions

- TypeScript is required; keep strict options aligned with `packages/typescript-config`.
- Prettier (root `format` script) enforces two-space indentation and double-quoted JSX props; run `pnpm format` for bulk updates.
- Follow React conventions: components in PascalCase (`Button.tsx`), hooks in camelCase starting with `use`, and directories in lowercase-hyphen (`form-fields`).
- Re-export UI primitives from `packages/ui/src/index.ts` so consumers keep a single import surface.
- Use TanStack libraries for routing/data/forms;

## Design System Requirements (MANDATORY)

- **Design System Compliance**: All UI changes MUST follow `docs/design-system.md`
- **Component Reuse**: Always check `@workspace/ui` before creating new components
- **Styling Standards**: Use CSS custom properties defined in design system
- **Responsive Design**: Mobile-first approach with defined breakpoints
- **Accessibility**: WCAG 2.1 AA compliance required for all new features
- **TypeScript**: Strict typing required for all components and props
- **Vietnamese Support**: Typography and spacing optimized for Vietnamese content

### Component Development Workflow

1. **Check Existing**: Search `packages/ui/` for similar components first
2. **Follow Patterns**: Use existing component structure and naming
3. **Design Tokens**: Use CSS custom properties from design system
4. **Responsive**: Implement mobile-first with defined breakpoints
5. **Accessibility**: Include ARIA labels, keyboard navigation, screen reader support

### Styling Requirements

- **Colors**: Use semantic color variables from design system
- **Spacing**: Follow 8px base unit spacing scale
- **Typography**: Use defined font stacks and type scale
- **Animations**: Use defined transition presets and easing functions
- **Dark Mode**: Support both light and dark themes

### Design System Validation

```bash
# Check design system compliance
rg -n "bg-|text-|border-" src/ --type tsx  # Verify using design tokens
rg -n "className=" src/ --type tsx        # Check Tailwind usage
rg -n "interface.*Props" src/ --type tsx   # Verify TypeScript interfaces
```

## State Management Rules (MANDATORY)

### State Design First Principle

**ALWAYS design state architecture before coding**. Every feature must include state design decisions in implementation plan.

### State Type Decision Tree

#### 1. Local State (useState)

**Use when:**

- UI-only state that affects single component
- Form inputs, toggles, modals, dropdown states
- Temporary state that resets on component unmount
- Component-specific animations or visual states

**Examples:**

```typescript
// ✅ Correct: Form input
const [email, setEmail] = useState('');

// ✅ Correct: Modal visibility
const [isOpen, setIsOpen] = useState(false);

// ✅ Correct: Loading spinner
const [isLoading, setIsLoading] = useState(false);
```

#### 2. Server State (React Query/TanStack Query)

**Use when:**

- Data fetched from API endpoints
- Data that needs caching, background updates, invalidation
- Shared across multiple components
- Requires optimistic updates, pagination, infinite scroll

**Examples:**

```typescript
// ✅ Correct: API data
const { data: users, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// ✅ Correct: Mutations with invalidation
const createUserMutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});
```

#### 3. Global State (Zustand)

**Use when:**

- State shared across many unrelated components
- Complex state logic with multiple actions
- User preferences, authentication status, theme
- State that persists across route navigation
- When React Query is overkill for non-server state

**Examples:**

```typescript
// ✅ Correct: Auth state
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

// ✅ Correct: UI preferences
interface UIStore {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: string;
  setSidebarCollapsed: (collapsed: boolean) => void;
}
```

### State Design Checklist

Before implementing any feature, answer:

1. **Data Source**: Where does this data come from?
   - API → React Query
   - User input → Local State
   - App configuration → Global State

2. **Scope**: Who needs this data?
   - Single component → Local State
   - Few related components → Lift state up
   - Many unrelated components → Global State

3. **Persistence**: Should this survive navigation?
   - No → Local State
   - Yes → Global State or React Query (if from server)

4. **Complexity**: How complex is the state logic?
   - Simple values → Local State
   - Multiple related values → Global State
   - Server synchronization → React Query

### Anti-Patterns to Avoid

❌ **NEVER use Zustand for server data** - Use React Query instead
❌ **NEVER use useState for global preferences** - Use Zustand
❌ **NEVER duplicate state** - Single source of truth
❌ **NEVER use local state for data fetched from API** - Use React Query

### Implementation Requirements

1. **State Documentation**: Every store must include:

   ```typescript
   /**
    * Auth Store - Manages user authentication state
    *
    * State:
    * - user: Current authenticated user or null
    * - isAuthenticated: Boolean flag for auth status
    *
    * Usage:
    * - Use in components that need auth status
    * - Persist across navigation
    * - Don't use for server data (use React Query)
    */
   ```

2. **Type Safety**: All state must be fully typed with TypeScript interfaces

3. **Selector Pattern**: Components must use selectors to prevent unnecessary re-renders:

   ```typescript
   // ✅ Good: Selective subscription
   const user = useAuthStore((state) => state.user);

   // ❌ Bad: Subscribes to entire store
   const authState = useAuthStore();
   ```

4. **State Validation**: New state implementations must pass:
   ```bash
   # Check for proper state patterns
   rg -n "useState.*\[\]" src/ --type tsx  # Review useState usage
   rg -n "useQuery\|useMutation" src/ --type tsx  # Verify React Query usage
   rg -n "use.*Store" src/ --type tsx  # Check Zustand patterns
   ```

### Migration Path

When refactoring existing state:

1. Identify current state type and usage
2. Apply decision tree to determine correct type
3. Create migration plan with minimal breaking changes
4. Update all consuming components
5. Remove old state implementation

**All new features MUST include state design decisions in their implementation plan.**

## Testing Guidelines

- A dedicated test runner is not yet configured; when introducing one (Vitest + Testing Library recommended), add a `test` script per package and register it in `turbo.json`.
- Co-locate tests as `*.test.tsx` or group them under `__tests__/` to leverage Vite module resolution.
- Until automated tests exist, rely on `pnpm lint` plus manual verification in `pnpm --filter web dev`; document any new coverage expectations in PR descriptions.

## Commit & Pull Request Guidelines

- Follow the existing Git history: short, imperative commit subjects with a scoped prefix when helpful (`chore:`, `fix:`, etc.); emojis are optional but used sparingly.
- Each PR should describe the change, note affected packages, and link issues or tasks. Screenshots/GIFs are expected for UI tweaks in `apps/web`.
- Ensure lint/build pipelines succeed locally (`pnpm lint`, `pnpm build`) before opening a PR, and mention any skipped checks with justification.
- **Design System Review**: All UI changes must be validated against `docs/design-system.md` before PR submission
- **Component Verification**: Ensure new components follow established patterns and TypeScript interfaces
