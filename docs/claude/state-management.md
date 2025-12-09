# State Management

## Philosophy (CRITICAL)

1. **Local State (useState)** - UI-only state, form inputs, modals, toggles
2. **Server State (React Query)** - API data, caching, mutations, invalidation
3. **Global State (Zustand)** - User preferences, auth, theme, sidebar, language

## Anti-patterns

- ❌ Never use Zustand for server data (use React Query)
- ❌ Never use useState for global preferences (use Zustand)
- ❌ Never use local state for API data (use React Query)

## State Management Checklist

Before implementing features, answer:

1. **Data source?** API → React Query | User input → Local | Config → Global
2. **Scope?** Single component → Local | Many components → Global
3. **Persist?** No → Local | Yes → Global/React Query
4. **Complexity?** Simple → Local | Multiple related → Global | Server sync → React Query

## Zustand Best Practices

Use selectors to prevent re-renders:

```tsx
// ✅ Good
const user = useAuthStore((state) => state.user);

// ❌ Bad
const authState = useAuthStore(); // Subscribes to entire store
```

## React Query Setup

- Query client: `shared/query-client.ts`
- Feature-specific clients in feature directories
- Centralized error handling in `api-error.ts`
