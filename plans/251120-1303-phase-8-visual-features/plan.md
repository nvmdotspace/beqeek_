# Phase 8: Visual Features - Implementation Plan

**Created**: 2025-11-20 13:03
**Status**: Ready for Implementation
**Complexity**: Low-Medium
**Estimated Effort**: 4-6 hours

## Executive Summary

Implement canvas minimap visualization and PNG export functionality for workflow canvas using React Flow's built-in MiniMap component and html-to-image library. Features include:

- **Real-time canvas overview** with color-coded node types
- **High-quality PNG export** with 2x retina resolution
- **Mobile-responsive** design (hide minimap on small screens)
- **Design system compliance** using CSS custom properties

## Context

### Current State

- Workflow canvas using @xyflow/react v12.9.3
- Existing canvas controls (zoom, pan, fit view)
- Canvas header with Save/Auto-Layout buttons
- Zustand store managing nodes/edges state
- 100+ node workflows supported

### Target State

- Minimap in bottom-right corner (default React Flow position)
- Export button in canvas header toolbar
- Dynamic node colors: triggers=blue, actions=green, logic=teal
- PNG downloads with descriptive filenames: `workflow-{eventName}-{timestamp}.png`
- Loading states during export operation

### Technical Constraints

- Must use design tokens (no hardcoded colors)
- Bundle size impact < 50kb
- No breaking changes to existing canvas API
- Maintain keyboard shortcuts compatibility
- YAGNI principle (no SVG export in MVP)

## Architecture Overview

### Component Structure

```
workflow-builder/
├── workflow-canvas.tsx          # [MODIFY] Add export utilities
├── canvas-header.tsx            # [MODIFY] Add export button
└── utils/
    └── export-utils.ts          # [NEW] Export helpers & download logic
```

### Dependencies

**New Package**:

- `html-to-image@1.11.11` - Canvas to PNG conversion (~35kb)

**Existing**:

- `@xyflow/react@12.9.3` - MiniMap component (already bundled)
- `lucide-react` - Download icon
- `sonner` - Toast notifications

### Data Flow

```
User clicks "Export" button
  → Export button disabled (loading state)
  → Get React Flow instance ref
  → Calculate viewport bounds
  → Filter UI elements (.react-flow__minimap, .react-flow__controls)
  → toPng() with 2x pixelRatio
  → Generate filename: workflow-{eventName}-{timestamp}.png
  → Trigger browser download
  → Toast success/error
  → Re-enable export button
```

## Implementation Phases

### Phase 1: MiniMap Integration (1-2 hours)

- Configure MiniMap component in workflow-canvas.tsx
- Implement dynamic node coloring function
- Add responsive hiding (CSS media queries)
- Test with 10, 50, 100+ node workflows

### Phase 2: Export Utilities (2-3 hours)

- Install html-to-image@1.11.11
- Create export-utils.ts with helpers
- Implement exportWorkflowToPng() function
- Add filename generation utility
- Handle error cases (permissions, browser limits)

### Phase 3: UI Integration (1 hour)

- Add Export button to canvas-header.tsx
- Add loading state management
- Implement toast notifications
- Test download flow end-to-end

### Phase 4: Testing & Polish (1 hour)

- Test on Chrome, Firefox, Safari
- Test mobile responsive behavior
- Verify color contrast (WCAG AA)
- Performance test with large workflows
- Bundle size verification

## Success Criteria

### Functional Requirements

- ✅ Minimap shows all nodes in workflow
- ✅ Minimap updates in real-time as nodes move
- ✅ Node colors match type categories (trigger/action/logic)
- ✅ Export produces 2x retina PNG (high quality)
- ✅ Export filters UI chrome correctly
- ✅ Downloaded file has descriptive name
- ✅ Works with 100+ node workflows (<500ms export)

### Non-Functional Requirements

- ✅ Bundle size increase < 50kb gzipped
- ✅ No console errors or warnings
- ✅ Passes TypeScript strict checks
- ✅ Follows design system standards
- ✅ Mobile minimap hidden (breakpoint: 768px)
- ✅ Export loading state visible

### User Experience

- ✅ Export button next to Save button
- ✅ Clear loading indicator during export
- ✅ Success toast on export complete
- ✅ Error toast on export failure
- ✅ Minimap doesn't block canvas interaction

## Risk Assessment

### Technical Risks

| Risk                                    | Impact | Mitigation                                 |
| --------------------------------------- | ------ | ------------------------------------------ |
| Large workflow export timeout           | Medium | Add 10s timeout, show progress toast       |
| Browser memory limits (500+ nodes)      | Low    | Document limitation, recommend chunking    |
| html-to-image rendering inconsistencies | Low    | Lock version @1.11.11, test major browsers |
| MiniMap performance on large graphs     | Low    | React Flow handles virtualization          |

### Business Risks

| Risk                             | Impact | Mitigation                                |
| -------------------------------- | ------ | ----------------------------------------- |
| Feature creep (SVG export, PDF)  | Low    | Strict YAGNI adherence, defer to backlog  |
| User expects more export formats | Low    | Document PNG-only in MVP, gather feedback |

### Timeline Risks

| Risk                         | Impact | Mitigation                                     |
| ---------------------------- | ------ | ---------------------------------------------- |
| Browser compatibility issues | Medium | Allocate buffer time for cross-browser testing |

## Testing Strategy

### Unit Tests (Vitest)

- `export-utils.test.ts`: Filename generation, error handling
- Mock html-to-image toPng() function
- Test viewport bounds calculation

### Integration Tests

- Export button click triggers download
- Loading state transitions correctly
- Toast notifications appear/disappear
- MiniMap color mapping accuracy

### Manual Testing Checklist

- [ ] Export 10-node workflow
- [ ] Export 100-node workflow
- [ ] Export with special characters in event name
- [ ] Export with no nodes (empty canvas)
- [ ] Verify file opens in image viewer
- [ ] Check PNG quality (2x retina)
- [ ] Test minimap pan/zoom interaction
- [ ] Test on mobile (minimap hidden)
- [ ] Test dark mode minimap colors
- [ ] Test with browser download blocked

### Performance Benchmarks

- Export time < 500ms for 100 nodes
- MiniMap render < 16ms (60fps)
- Bundle size increase < 50kb gzipped

## Rollback Plan

If critical issues discovered post-deployment:

1. **Immediate**: Hide export button via feature flag
2. **Short-term**: Revert MiniMap if performance issues
3. **Hotfix**: Remove html-to-image dependency if blocking bugs
4. **Documentation**: Update changelog with known issues

Rollback risk: **Low** (isolated feature, no API changes)

## Documentation Requirements

### Code Documentation

- JSDoc for exportWorkflowToPng() function
- Comment complex viewport calculations
- Type definitions for export options

### User Documentation

- Update workflow canvas help text
- Add export feature to user guide
- Document supported browsers

## Next Steps

1. Review this plan with team
2. Create GitHub issue from Phase 1-4 tasks
3. Begin implementation with MiniMap integration
4. Daily progress updates to Discord
5. Request code review after Phase 3
6. Deploy to staging for QA testing

## Appendix

### Related Files

- `/apps/web/src/features/workflow-units/components/workflow-builder/workflow-canvas.tsx`
- `/apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx`
- `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`

### External Resources

- [React Flow MiniMap Docs](https://reactflow.dev/api-reference/components/mini-map)
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image)
- [Beqeek Design System](/docs/design-system.md)

### Dependencies

```json
{
  "html-to-image": "1.11.11"
}
```

---

**Next Document**: [phase-8-visual-features.md](./phase-8-visual-features.md) - Detailed implementation steps
