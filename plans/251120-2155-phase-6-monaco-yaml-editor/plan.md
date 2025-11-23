# Phase 6: Monaco YAML Editor Integration

**Created**: 2025-11-20
**Timeline**: 5 days (1 week with buffer)
**Priority**: High (MVP feature gap)
**Complexity**: Medium

## Overview

Add YAML editor mode to workflow canvas using Monaco Editor with real-time validation, syntax highlighting, and bidirectional sync with visual mode.

## Context

- **Research**: Complete Monaco integration guide in `RESEARCH_WORKFLOW_CANVAS_EXPORT.md`
- **Existing**: YAML ↔ IR ↔ React Flow conversion pipeline fully implemented
- **Store**: Mode state already exists in `workflow-editor-store.ts`
- **Utilities**: All conversion/validation utilities ready (`yaml-converter.ts`, `yaml-parser.ts`, `yaml-serializer.ts`)

## Key Decisions

- **UI**: Tab-based switcher (Visual | YAML) in canvas header
- **Editor**: @monaco-editor/react with monaco-yaml plugin
- **Sync**: Automatic conversion on mode switch with validation
- **Layout**: YAML mode replaces canvas (full-screen editor)
- **Save**: Auto-save on mode switch (consistent with current behavior)

## Implementation Phases

### Phase 1: Monaco Setup & Integration

**Status**: 🔴 Not Started
**Timeline**: Day 1-2
**Effort**: 6-8h
**Details**: [phase-01-monaco-setup.md](./phase-01-monaco-setup.md)

Install Monaco packages, configure Vite workers, create YamlEditor component, verify syntax highlighting.

### Phase 2: Mode Toggle UI

**Status**: 🔴 Not Started
**Timeline**: Day 2-3
**Effort**: 4-6h
**Details**: [phase-02-mode-toggle.md](./phase-02-mode-toggle.md)

Create tab switcher, update canvas header, implement conditional rendering, extend Zustand store.

### Phase 3: Bidirectional Sync

**Status**: 🔴 Not Started
**Timeline**: Day 3-4
**Effort**: 6-8h
**Details**: [phase-03-bidirectional-sync.md](./phase-03-bidirectional-sync.md)

Implement Visual→YAML and YAML→Visual conversion, validation error display, round-trip testing.

### Phase 4: Polish & Testing

**Status**: 🔴 Not Started
**Timeline**: Day 4-5
**Effort**: 4-6h
**Details**: [phase-04-polish-testing.md](./phase-04-polish-testing.md)

Keyboard shortcuts, unsaved changes warning, mobile responsive, browser compatibility, E2E tests.

## Success Criteria

- ✅ Tab-based mode switching works
- ✅ Monaco editor shows YAML syntax highlighting
- ✅ Invalid YAML shows inline error markers
- ✅ Mode switching preserves workflow state
- ✅ Bidirectional sync is lossless
- ✅ Keyboard shortcuts (Cmd+S, Cmd+Shift+Y)
- ✅ No console errors/warnings
- ✅ TypeScript strict compliance
- ✅ Browser compatibility (Chrome, Firefox, Safari)
- ✅ Mobile responsive

## Dependencies

**Packages** (already installed):

- ✅ `@monaco-editor/react@4.7.0` (package.json line 20)
- 🔴 `monaco-yaml@5.4.0` (to install)
- 🔴 `monaco-editor@0.54.0` (to install)

**Code**:

- ✅ `/apps/web/src/features/workflow-units/utils/yaml-converter.ts`
- ✅ `/apps/web/src/features/workflow-units/utils/yaml-parser.ts`
- ✅ `/apps/web/src/features/workflow-units/utils/yaml-serializer.ts`
- ✅ `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`
- ✅ `/apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx`

## Risk Assessment

**Medium Risks**:

- Monaco worker configuration in Vite may require trial-error
- YAML validation errors must be user-friendly
- Bundle size increase (~300kb gzipped)

**Mitigations**:

- Follow @monaco-editor/react official docs for Vite setup
- Use Zod error formatting for clear messages
- Implement code splitting for Monaco (lazy load)

## Unresolved Questions

1. Should YAML mode support auto-complete for node types? (Nice-to-have, not MVP)
2. Should we preserve YAML comments during Visual→YAML conversion? (Not supported by current serializer)
3. Should diff view show changes between saved/current YAML? (Future feature)
