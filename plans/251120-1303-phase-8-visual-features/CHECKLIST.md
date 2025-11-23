# Phase 8: Visual Features - Implementation Checklist

**Plan**: [plan.md](./plan.md) | **Details**: [phase-8-visual-features.md](./phase-8-visual-features.md)

## 🎯 Quick Progress Tracker

- [ ] **Phase 1**: MiniMap Integration (1-2h)
- [ ] **Phase 2**: Export Utilities (2-3h)
- [ ] **Phase 3**: UI Integration (1h)
- [ ] **Phase 4**: Testing & Polish (1h)

---

## Phase 1: MiniMap Integration

### Code Changes

- [ ] Update MiniMap in `workflow-canvas.tsx` with improved node coloring
- [ ] Add `pannable` and `zoomable` props to MiniMap
- [ ] Add responsive CSS to `globals.css` (hide on mobile <768px)
- [ ] Add dark mode styles for minimap

### Testing

- [ ] Test with 10 nodes - renders correctly
- [ ] Test with 50 nodes - no performance issues
- [ ] Test with 100+ nodes - <16ms render time
- [ ] Test mobile viewport - minimap hidden
- [ ] Test dark mode - colors correct

**Time Checkpoint**: Should complete in 1-2 hours

---

## Phase 2: Export Utilities

### Setup

- [ ] Install dependency: `pnpm --filter web add html-to-image@1.11.11`
- [ ] Verify installation: `pnpm --filter web list html-to-image`

### Code Changes

- [ ] Create `export-utils.ts` in `workflow-units/utils/`
- [ ] Implement `generateExportFilename()` function
- [ ] Implement `downloadImage()` helper
- [ ] Implement `exportWorkflowToPng()` main function
- [ ] Add TypeScript interfaces and JSDoc

### Testing

- [ ] Type check passes: `pnpm --filter web check-types`
- [ ] Build succeeds: `pnpm --filter web build`
- [ ] Unit test filename generation (if time permits)

**Time Checkpoint**: Should complete in 2-3 hours

---

## Phase 3: UI Integration

### Code Changes - canvas-header.tsx

- [ ] Import `Download` icon from lucide-react
- [ ] Import `exportWorkflowToPng` from export-utils
- [ ] Add `isExporting` state with useState
- [ ] Implement `handleExport()` callback
- [ ] Add Export button JSX after Save button
- [ ] Add keyboard shortcut (Cmd+Shift+E) to useEffect
- [ ] Update useEffect dependency array

### Testing

- [ ] Export button visible in header
- [ ] Button disabled when no nodes
- [ ] Clicking button triggers export
- [ ] Loading state shows "Exporting..."
- [ ] Success toast appears
- [ ] File downloads correctly
- [ ] Keyboard shortcut works

**Time Checkpoint**: Should complete in 1 hour

---

## Phase 4: Testing & Polish

### Functional Testing

- [ ] Export 10-node workflow - file downloads
- [ ] Export 100-node workflow - <500ms
- [ ] Export with special chars in name - sanitized filename
- [ ] Export empty workflow - button disabled
- [ ] Exported PNG excludes minimap/controls

### Browser Compatibility

- [ ] Chrome/Edge - export works
- [ ] Firefox - export works
- [ ] Safari - export works

### Mobile Responsive

- [ ] 375px viewport - minimap hidden, export button visible
- [ ] 768px viewport - minimap hidden at breakpoint

### Dark Mode

- [ ] Minimap background dark in dark mode
- [ ] Export PNG renders correctly (not inverted)

### Performance

- [ ] Bundle size increase < 50kb: `pnpm --filter web build`
- [ ] Export timing: 10 nodes <100ms, 50 nodes <300ms, 100 nodes <500ms
- [ ] MiniMap render: <16ms (60fps)

### Error Handling

- [ ] Download blocked - error toast appears
- [ ] Large canvas (500+ nodes) - graceful error
- [ ] Missing canvas element - error toast

### Accessibility

- [ ] Tab to Export button works
- [ ] Enter key triggers export
- [ ] Cmd+Shift+E shortcut works
- [ ] Button announced by screen reader
- [ ] Color contrast meets WCAG AA

### Code Quality

- [ ] Lint check passes: `pnpm --filter web lint` (max 120 warnings)
- [ ] Type check passes: `pnpm --filter web check-types` (0 errors)
- [ ] Code formatted: `pnpm format`
- [ ] JSDoc comments added

**Time Checkpoint**: Should complete in 1 hour

---

## Final Checklist

### Pre-Commit

- [ ] All Phase 1-4 checklists completed
- [ ] No TypeScript errors
- [ ] No ESLint errors (within baseline)
- [ ] Bundle size verified (<50kb increase)
- [ ] Screenshots captured for PR

### Commit & PR

- [ ] Stage changes: `git add .`
- [ ] Commit with message:

  ```
  feat: add workflow canvas minimap and PNG export

  - Implement React Flow MiniMap with dynamic node coloring
  - Add PNG export with html-to-image@1.11.11 (2x retina)
  - Export button in canvas header with loading states
  - Mobile responsive (hide minimap on small screens)
  - Keyboard shortcut: Cmd+Shift+E

  Closes #XXX
  ```

- [ ] Push branch: `git push origin feature/phase-8-visual-features`
- [ ] Create PR with test plan and screenshots

### Post-Deployment

- [ ] Smoke test on staging
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Update changelog

---

## 🚨 Common Issues & Solutions

### Export button not appearing

```bash
# Check TypeScript errors
pnpm --filter web check-types

# Check imports
grep -n "exportWorkflowToPng" apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx
```

### Minimap colors incorrect

Check node type naming:

- Triggers: `trigger_*`
- Actions: `action_*` or `log*`
- Logic: everything else

### Export fails

Check console for error, verify:

1. `.react-flow__viewport` element exists
2. `nodes.length > 0`
3. Browser downloads not blocked

### Bundle size too large

```bash
pnpm dedupe
pnpm install
pnpm --filter web build
```

---

## 📊 Time Tracking

| Phase     | Estimated | Actual | Notes               |
| --------- | --------- | ------ | ------------------- |
| Phase 1   | 1-2h      | \_\_\_ | MiniMap Integration |
| Phase 2   | 2-3h      | \_\_\_ | Export Utilities    |
| Phase 3   | 1h        | \_\_\_ | UI Integration      |
| Phase 4   | 1h        | \_\_\_ | Testing & Polish    |
| **Total** | **4-6h**  | \_\_\_ |                     |

---

**Status**: ⏳ Ready to Start

**Next Action**: Begin Phase 1 - Update workflow-canvas.tsx with MiniMap configuration
