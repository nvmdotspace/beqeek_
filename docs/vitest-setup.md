# Vitest Setup Guide

Vitest has been successfully integrated into the Beqeek monorepo following Turborepo best practices.

## Architecture

We're using a **Hybrid Approach** that combines:

- Per-package test configurations for optimized caching
- Shared configuration to avoid duplication
- Turbo task orchestration for parallel execution

## Package Structure

### 1. Shared Configuration (`packages/vitest-config/`)

- `base.ts` - Base configuration for Node.js testing
- `react.ts` - Extended configuration for React components with jsdom

### 2. Test Scripts

**Root level:**

```bash
pnpm test              # Run all tests (cached)
pnpm test:watch        # Watch mode for local development
pnpm test:coverage     # Generate coverage reports
```

**Per-package:**

```bash
pnpm --filter web test
pnpm --filter @workspace/active-tables-core test:watch
```

### 3. Configured Packages

#### `apps/web/`

- Config: `vitest.config.ts` (extends Vite config)
- Setup: `vitest.setup.ts` (jsdom, React Testing Library)
- Test location: `src/__tests__/`
- Dependencies: vitest, @testing-library/react, jsdom

#### `packages/active-tables-core/`

- Config: `vitest.config.ts` (with React plugin)
- Setup: `vitest.setup.ts` (jsdom mocks)
- Test location: `src/__tests__/`
- Dependencies: vitest, @testing-library/react, jsdom

## Turbo Configuration

The `turbo.json` includes:

```json
{
  "test": {
    "dependsOn": ["^test"]
  },
  "test:watch": {
    "cache": false,
    "persistent": true
  }
}
```

- `test` - Cacheable, runs after dependencies
- `test:watch` - Persistent, no caching (for local development)

## Testing Libraries

Installed globally in workspace:

- `vitest@4.0.8` - Test runner
- `@vitest/ui@4.0.8` - UI for test visualization
- `@vitest/coverage-v8@4.0.8` - Coverage reporting
- `@testing-library/react@16.3.0` - React component testing
- `@testing-library/jest-dom@6.9.1` - DOM matchers
- `@testing-library/user-event@14.6.1` - User interaction simulation
- `jsdom@27.2.0` - DOM implementation for Node
- `happy-dom@20.0.10` - Alternative fast DOM

## Example Tests

### Basic Component Test (`apps/web/`)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Unit Test (`packages/active-tables-core/`)

```typescript
import { describe, it, expect } from 'vitest';

describe('Utility function', () => {
  it('should calculate correctly', () => {
    expect(myFunction(2, 3)).toBe(5);
  });
});
```

## Test File Conventions

- Place tests in `src/__tests__/` directories
- Name pattern: `*.test.ts` or `*.test.tsx`
- Co-locate component tests near components if preferred
- Use descriptive test names with `should` prefix

## Coverage

Generate coverage reports:

```bash
pnpm test:coverage
```

Coverage is configured to exclude:

- `node_modules/`
- `dist/`
- `*.config.*` files
- `*.d.ts` type definitions
- Test files themselves
- Generated code (e.g., `routeTree.gen.ts`, `paraglide/`)

## CI/CD Integration

For CI pipelines:

```bash
pnpm test  # Runs once, exits with code
```

For local development:

```bash
pnpm test:watch  # Continuous mode
```

## Vitest UI

Access interactive test UI:

```bash
pnpm --filter web test:watch
# Then open http://localhost:51204/__vitest__/
```

## Adding Tests to New Packages

1. Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

2. Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // or 'jsdom' for React
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

3. Add vitest dependencies to `devDependencies`

4. Create test files in `src/__tests__/`

## Best Practices

1. **Use per-package test tasks** for better caching in CI
2. **Run `test:watch` locally** for fast feedback
3. **Include coverage in PR checks** with thresholds
4. **Mock external dependencies** to isolate unit tests
5. **Test user interactions** not implementation details
6. **Use Testing Library queries** in order of priority:
   - getByRole (accessibility-first)
   - getByLabelText
   - getByText
   - getByTestId (last resort)

## Troubleshooting

**Tests not found:**

- Check file naming: `*.test.ts` or `*.test.tsx`
- Verify test files are in correct directories

**Import errors:**

- Ensure path aliases match in both `vite.config.ts` and `vitest.config.ts`
- Check `tsconfig.json` paths are configured

**JSX/React errors:**

- Verify `environment: 'jsdom'` in config
- Check `@vitejs/plugin-react` is installed and configured

**Coverage not generating:**

- Run with `--coverage` flag
- Install `@vitest/coverage-v8`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Turborepo Testing Guide](https://turbo.build/repo/docs/guides/tools/vitest)
