# Performance Verification (MANDATORY)

**IMPORTANT:** Always verify performance before marking a task as complete:

1. **Check browser console** for errors/warnings (especially "Maximum update depth exceeded")
2. **Use Chrome DevTools MCP** to inspect console messages and network requests
3. **Watch for infinite loops** in useEffect - common causes:
   - Object/array dependencies that change on every render (use `useMemo` or refs)
   - URL sync effects with `searchParams` in dependencies (use refs to track previous values)
   - `useQueries` results as dependencies (create stable hash from data instead)
4. **Run performance trace** if UI feels sluggish
5. **Verify no redundant re-renders** using React DevTools Profiler

## Anti-patterns to avoid

```tsx
// ❌ Bad - searchParams changes on every navigate, causing infinite loop
useEffect(() => {
  navigate({ search: { ...searchParams, filters } });
}, [filters, searchParams]); // searchParams triggers this again!

// ✅ Good - use ref to track previous value
const prevFiltersRef = useRef(searchParams.filters);
useEffect(() => {
  if (filters !== prevFiltersRef.current) {
    prevFiltersRef.current = filters;
    navigate({ search: (prev) => ({ ...prev, filters }) });
  }
}, [filters, navigate]);

// ❌ Bad - queries array is new reference every render
useEffect(() => {
  decryptData(queries);
}, [queries]); // triggers on every render!

// ✅ Good - create stable hash from actual data
const dataHash = useMemo(() => queries.map((q) => q.dataUpdatedAt).join('|'), [queries]);
useEffect(() => {
  if (dataHash !== prevHashRef.current) {
    prevHashRef.current = dataHash;
    decryptData(queries);
  }
}, [dataHash, queries]);
```
