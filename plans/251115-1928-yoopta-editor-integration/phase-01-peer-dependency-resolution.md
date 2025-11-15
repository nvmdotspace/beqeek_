# Phase 01: Peer Dependency Resolution & Testing

**Phase**: 01/08
**Duration**: 2 hours
**Status**: ⏸️ Pending
**Priority**: P0 (Blocker)

## Context

- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: None (first phase)
- **Blocks**: All subsequent phases
- **Related docs**:
  - [Research report](./research/251115-yoopta-editor-v4-analysis.md)
  - [Beqeek package.json](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/package.json)

## Overview

**Date**: 2025-11-15
**Description**: Resolve peer dependency conflicts between Yoopta Editor (requires slate@^0.102.0) and Beqeek (uses React 19.1.1). Verify runtime compatibility before proceeding with integration.

**Goal**: Confirm Yoopta Editor works with React 19 or identify blockers requiring alternative solution.

## Key Insights

From research:

- Yoopta peer deps: `react>=17.0.2`, `slate@^0.102.0`, `slate-react@^0.102.0`
- Beqeek uses React 19.1.1 (technically compatible with >=17.0.2)
- Slate 0.102 may have internal React 18 constraints (unknown)
- npm v7+ throws errors for peer dep mismatches
- pnpm supports overrides to bypass conflicts

## Requirements

### Functional

- FR1: Install Yoopta + slate deps without errors
- FR2: Render basic editor component without runtime errors
- FR3: Type basic text and verify Slate operations work
- FR4: Verify no console warnings/errors

### Non-Functional

- NFR1: No modification to existing packages
- NFR2: Test in isolated environment (test branch)
- NFR3: Document exact versions that work
- NFR4: Rollback plan if incompatible

## Architecture

### Dependency Tree

```
apps/web/
├── react@19.1.1              # Beqeek requirement
├── react-dom@19.1.1          # Beqeek requirement
└── @yoopta/editor@4.9.9      # New dependency
    ├── slate@^0.102.0        # Peer dep (to install)
    └── slate-react@^0.102.0  # Peer dep (to install)
```

### Resolution Strategy

**Option 1**: pnpm overrides (recommended)

```json
{
  "pnpm": {
    "overrides": {
      "slate": "^0.102.0",
      "slate-react": "^0.102.0"
    }
  }
}
```

**Option 2**: --legacy-peer-deps flag (temporary testing)

```bash
pnpm install --legacy-peer-deps
```

**Option 3**: Update to latest slate (if available)

- Check if slate@0.110+ supports React 19
- Risk: Yoopta may not support newer slate

## Implementation Steps

### Step 1: Create test branch

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek
git checkout -b test/yoopta-react19-compatibility
```

### Step 2: Add pnpm overrides

Edit `/Users/macos/Workspace/buildinpublic/beqeek/package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "slate": "0.102.0",
      "slate-react": "0.102.0"
    }
  }
}
```

### Step 3: Install Yoopta dependencies

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek/apps/web

# Install core packages
pnpm add slate@0.102.0 slate-react@0.102.0

# Install Yoopta packages
pnpm add @yoopta/editor@^4.9.9 @yoopta/paragraph@latest

# Install marks
pnpm add @yoopta/marks@latest
```

### Step 4: Create test component

Create `/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/test-yoopta.tsx`:

```typescript
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
import Paragraph from '@yoopta/paragraph';
import { useMemo, useState } from 'react';

export function TestYoopta() {
  const editor = useMemo(() => createYooptaEditor(), []);
  const plugins = useMemo(() => [Paragraph], []);
  const [value, setValue] = useState({});

  return (
    <div style={{ padding: '20px' }}>
      <h1>Yoopta Editor Test</h1>
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        value={value}
        onChange={setValue}
        placeholder="Type here to test..."
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}
```

### Step 5: Add test route

Create `/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/routes/$locale/test-yoopta.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TestYooptaLazy = lazy(() =>
  import('../../test-yoopta').then(m => ({ default: m.TestYoopta }))
);

export const Route = createFileRoute('/$locale/test-yoopta')({
  component: TestYooptaPage,
});

function TestYooptaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestYooptaLazy />
    </Suspense>
  );
}
```

### Step 6: Run dev server & test

```bash
pnpm --filter web dev
```

Navigate to: `http://localhost:4173/vi/test-yoopta`

### Step 7: Runtime testing checklist

Test the following in browser:

- [ ] Page loads without errors
- [ ] Editor renders (no blank screen)
- [ ] Can type text in editor
- [ ] Text appears in preview JSON
- [ ] No console errors
- [ ] No console warnings (React warnings)
- [ ] DevTools show no React version conflicts
- [ ] Can delete text (backspace)
- [ ] Can select text
- [ ] Undo/redo works (Ctrl+Z/Ctrl+Y)

### Step 8: Extended compatibility tests

Add more plugins to test:

```typescript
import { HeadingOne, HeadingTwo } from '@yoopta/headings';
import { BulletedList, NumberedList } from '@yoopta/lists';
import { Bold, Italic } from '@yoopta/marks';

const plugins = [Paragraph, HeadingOne, HeadingTwo, BulletedList, NumberedList];

const marks = [Bold, Italic];

// Add to <YooptaEditor marks={marks} />
```

Test:

- [ ] Heading conversion works (type `/h1`)
- [ ] List creation works (type `-`)
- [ ] Bold formatting (Ctrl+B)
- [ ] Italic formatting (Ctrl+I)

### Step 9: Document results

Create `/Users/macos/Workspace/buildinpublic/beqeek/plans/251115-1928-yoopta-editor-integration/test-results.md`:

```markdown
# React 19 Compatibility Test Results

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**:

- React: 19.1.1
- slate: 0.102.0
- slate-react: 0.102.0
- @yoopta/editor: 4.9.9

## Results

### Installation

- [ ] Pass / [ ] Fail
- Notes:

### Basic Rendering

- [ ] Pass / [ ] Fail
- Notes:

### Text Input

- [ ] Pass / [ ] Fail
- Notes:

### Console Errors

- [ ] None / [ ] See below
- Errors:

### Advanced Features

- Headings: [ ] Pass / [ ] Fail
- Lists: [ ] Pass / [ ] Fail
- Marks: [ ] Pass / [ ] Fail

## Conclusion

[ ] ✅ Compatible - Proceed to Phase 02
[ ] ❌ Incompatible - Consider alternatives

## Screenshots

[Attach screenshots of editor working]
```

### Step 10: Decision point

Based on test results:

**If PASS**:

- Commit changes to test branch
- Proceed to Phase 02 (Package scaffolding)
- Document exact versions in Phase 02

**If FAIL**:

- Document failure modes
- Rollback changes: `git reset --hard HEAD`
- Delete test branch
- Evaluate alternatives:
  - Wait for Yoopta React 19 support
  - Use Tiptap (React 19 compatible)
  - Keep Lexical (current solution)
  - Use ProseMirror directly

## Related Code Files

**To create**:

- `/apps/web/src/test-yoopta.tsx` (test component)
- `/apps/web/src/routes/$locale/test-yoopta.tsx` (test route)
- `/plans/251115-1928-yoopta-editor-integration/test-results.md` (results doc)

**To modify**:

- `/package.json` (add pnpm overrides)
- `/apps/web/package.json` (add dependencies)

**To reference**:

- `/apps/web/package.json` (current deps)
- `/packages/comments/package.json` (Lexical comparison)

## Todo List

- [ ] Create test branch
- [ ] Add pnpm overrides to root package.json
- [ ] Install slate@0.102.0 + slate-react@0.102.0
- [ ] Install @yoopta/editor + @yoopta/paragraph
- [ ] Create test component (TestYoopta)
- [ ] Create test route (/test-yoopta)
- [ ] Run dev server
- [ ] Navigate to test page
- [ ] Verify editor renders
- [ ] Test text input
- [ ] Check console for errors
- [ ] Test undo/redo
- [ ] Test text selection
- [ ] Add more plugins (headings, lists, marks)
- [ ] Test heading conversion
- [ ] Test list creation
- [ ] Test bold/italic formatting
- [ ] Document test results
- [ ] Make go/no-go decision
- [ ] If pass: commit changes, proceed to Phase 02
- [ ] If fail: rollback, evaluate alternatives

## Success Criteria

✅ **Phase complete when**:

- All basic tests pass (rendering, typing, selection)
- No React version errors in console
- Advanced features work (headings, lists, marks)
- Test results documented with screenshots
- Go/no-go decision made and documented

❌ **Phase fails if**:

- Runtime errors related to React version
- Editor doesn't render
- Text input doesn't work
- Excessive console warnings (>10)
- Slate operations fail

## Risk Assessment

| Risk                              | Likelihood | Impact | Mitigation                           |
| --------------------------------- | ---------- | ------ | ------------------------------------ |
| React 19 incompatibility          | Medium     | High   | Test thoroughly, have fallback ready |
| Hidden bugs in complex features   | Low        | Medium | Test extended plugin set             |
| Version conflicts with other deps | Low        | Low    | Check pnpm ls output                 |
| Breaking changes in latest slate  | Low        | Medium | Lock to exact 0.102.0                |

## Security Considerations

- No security impact (testing only)
- Test branch should not be merged until Phase 07 (testing) complete
- No production impact

## Performance Considerations

- Test component is lightweight (single paragraph plugin)
- No performance testing required in this phase
- Defer performance benchmarks to Phase 07

## Next Steps

**If tests pass**:
→ Proceed to [Phase 02: Package Scaffolding](./phase-02-package-scaffolding.md)

**If tests fail**:
→ Evaluate alternatives:

1. Tiptap (React 19 compatible, similar to Yoopta)
2. Keep Lexical (current solution, works well)
3. Wait for Yoopta official React 19 support
4. Use ProseMirror directly (more work, full control)

## Unresolved Questions

1. Does slate@0.102.0 have any React 18-specific code that breaks with React 19?
2. Are there any Slate plugins used by Yoopta that have React version constraints?
3. Will future Yoopta updates require newer slate versions incompatible with current approach?
4. Should we contact Yoopta maintainers about React 19 roadmap before proceeding?
