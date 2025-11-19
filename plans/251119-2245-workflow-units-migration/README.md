# Workflow Units Migration: Implementation Plan

**Created**: 2025-11-19 22:45
**Author**: Claude Code Assistant
**Duration**: 11 weeks (9 phases)
**Status**: Draft - Ready for Review

---

## Quick Links

- **[Overview Plan](./plan.md)** - High-level summary (80 lines)
- **[Phase 1: Foundation Setup](./phase-01-foundation-setup.md)** - Week 1
- **[Phase 2: Workflow Units CRUD](./phase-02-workflow-units-crud.md)** - Week 2
- **[Phase 3: React Flow Integration](./phase-03-react-flow-integration.md)** - Week 3-4
- **[Phase 4: YAML Conversion](./phase-04-yaml-conversion.md)** - Week 5
- **[Phase 5: Event Management](./phase-05-event-management.md)** - Week 6
- **[Phase 6: Monaco Editor](./phase-06-monaco-editor.md)** - Week 7
- **[Phase 7: Console Monitoring](./phase-07-console-monitoring.md)** - Week 8
- **[Phase 8: Advanced Features](./phase-08-advanced-features.md)** - Week 9-10
- **[Phase 9: Testing & Deployment](./phase-09-testing-deployment.md)** - Week 11

---

## Migration Summary

**Objective**: Migrate Workflow Units module from legacy Blade/Blockly to modern React Flow architecture.

**Technology Stack**:

- **Frontend**: React 19 + TypeScript 5.9
- **Workflow Builder**: React Flow v12+ (replacing Google Blockly)
- **Code Editor**: Monaco Editor (YAML)
- **Routing**: TanStack Router (file-based)
- **State**: React Query (server) + Zustand (editor) + useState (local)
- **Real-time**: WebSocket for console monitoring
- **Validation**: Zod schemas
- **Testing**: Vitest + Playwright

---

## Phase Breakdown

### Week 1: Foundation Setup

**Focus**: Folder structure, dependencies, routing, API skeleton
**Deliverable**: Working routes with placeholder content
**Files**: [phase-01-foundation-setup.md](./phase-01-foundation-setup.md)

**Key Tasks**:

- Install @xyflow/react, @monaco-editor/react, js-yaml, dagre
- Create feature directory structure
- Setup 4 TanStack Router routes
- API client skeleton + TypeScript types
- Zustand store initialization

---

### Week 2: Workflow Units CRUD

**Focus**: List page, create/edit/delete dialogs, React Query hooks
**Deliverable**: Functional CRUD for Workflow Units
**Files**: [phase-02-workflow-units-crud.md](./phase-02-workflow-units-crud.md)

**Key Tasks**:

- 5 React Query hooks (list, detail, create, update, delete)
- List page with search/filter
- Create/Edit/Delete dialogs
- Unit detail page skeleton
- Integration tests

---

### Week 3-4: React Flow Integration

**Focus**: Visual workflow builder with 13 custom node types
**Deliverable**: Working React Flow canvas with all node types
**Files**: [phase-03-react-flow-integration.md](./phase-03-react-flow-integration.md)

**Key Tasks**:

- 13 custom node components (4 triggers, 7 actions, 6 logic)
- Workflow canvas with React Flow
- Node palette (drag-and-drop)
- Node configuration panel
- Connection validation
- Mini-map and controls

---

### Week 5: YAML Conversion

**Focus**: Bi-directional YAML ↔ React Flow conversion
**Deliverable**: Reliable conversion utilities
**Files**: [phase-04-yaml-conversion.md](./phase-04-yaml-conversion.md)

**Key Tasks**:

- YAML parser (yaml-to-nodes.ts)
- YAML serializer (nodes-to-yaml.ts)
- Zod schemas for validation
- Nested block handling (condition, loop, match)
- Auto-layout with dagre
- Unit tests (>90% coverage)

---

### Week 6: Event Management

**Focus**: Workflow Events CRUD + trigger configuration
**Deliverable**: Event CRUD with 4 trigger types
**Files**: [phase-05-event-management.md](./phase-05-event-management.md)

**Key Tasks**:

- Event API hooks (5 hooks)
- Event list component (sidebar)
- Trigger configuration forms:
  - SCHEDULE (cron expression)
  - WEBHOOK (auto-generated URL)
  - OPTIN_FORM (form selector)
  - ACTIVE_TABLE (table + action selectors)
- Create/Edit/Delete event workflows

---

### Week 7: Monaco Editor

**Focus**: YAML code editor + dual-mode switching
**Deliverable**: Functional Monaco YAML editor with mode toggle
**Files**: [phase-06-monaco-editor.md](./phase-06-monaco-editor.md)

**Key Tasks**:

- Monaco Editor React wrapper
- YAML language configuration (monaco-yaml)
- Custom auto-completion provider
- Validation integration
- Dual-mode toggle (Visual ↔ YAML)
- Sync mechanism between modes

---

### Week 8: Console Monitoring

**Focus**: Real-time console logs via WebSocket
**Deliverable**: Real-time console monitoring page
**Files**: [phase-07-console-monitoring.md](./phase-07-console-monitoring.md)

**Key Tasks**:

- WebSocket client setup
- useConsoleWebSocket hook
- Console viewer component
- Real-time log streaming
- Log filtering (level: info, warn, error)
- Connection status indicators
- Auto-reconnect logic

---

### Week 9-10: Advanced Features

**Focus**: Enhanced workflow editing experience
**Deliverable**: Undo/redo, shortcuts, auto-layout, copy/paste
**Files**: [phase-08-advanced-features.md](./phase-08-advanced-features.md)

**Key Tasks**:

- Undo/redo functionality (50 steps)
- Keyboard shortcuts (Delete, Cmd+Z, Cmd+C/V, Cmd+S)
- Auto-layout with dagre
- Node grouping (stages)
- Copy/paste nodes
- Export/import workflows
- Performance optimization (memoization, virtual rendering)

---

### Week 11: Testing & Deployment

**Focus**: Testing, optimization, docs, production deployment
**Deliverable**: Production-ready module
**Files**: [phase-09-testing-deployment.md](./phase-09-testing-deployment.md)

**Key Tasks**:

- Unit tests (>80% coverage)
- Integration tests
- E2E tests with Playwright
- Accessibility audit (WCAG 2.1 AA)
- Performance benchmarks
- User + developer documentation
- Staging + production deployment

---

## Key Architecture Decisions

**1. React Flow over Blockly**:

- Native React integration
- Better enterprise UX (n8n-style)
- Active development community
- Flexible customization

**2. File-based Routing**:

- TanStack Router auto-generates routes
- Type-safe params with `getRouteApi()`
- Lazy loading for performance

**3. State Management Strategy**:

- React Query: Server data (API, caching, mutations)
- Zustand: Editor state (nodes, edges, mode, selected)
- useState: Local UI state (forms, toggles, dialogs)

**4. Design System Compliance**:

- Mandatory design tokens (no hardcoded colors)
- Layout primitives (Container, Stack, Inline, Grid)
- Typography components (Heading, Text, Code)
- Atlassian 8px spacing system

**5. YAML as Source of Truth**:

- Visual editor represents YAML structure
- Bi-directional conversion preserves logic
- Monaco editor for power users

---

## Research Citations

**React Flow v12**:

- Package: `@xyflow/react` (renamed from `reactflow`)
- Node dimensions: `node.measured.width/height`
- Custom nodes: React components with full control
- Built-in: Background, Controls, MiniMap, Panel
- [React Summit 2025 Workshop](https://gitnation.com/contents/build-and-customize-a-node-based-workflow-builder-with-react)
- [Medium Guide (July 2025)](https://medium.com/pinpoint-engineering/part-2-building-a-workflow-editor-with-react-flow-a-guide-to-auto-layout-and-complex-node-1aadae67a3a5)

**Monaco Editor**:

- `@monaco-editor/react`: Official React wrapper
- `monaco-yaml`: YAML language plugin
- Schema-based auto-completion + validation
- Worker registration required
- [monaco-yaml.js.org](https://monaco-yaml.js.org/)

**n8n Insights**:

- Uses Vue.js (NOT React Flow)
- Node-based graph with clear hierarchy
- Configuration panel on right
- Node palette on left
- React Flow popular for similar tools

---

## Success Metrics

**Technical**:

- Time to Interactive < 3s
- React Flow render < 500ms for 100 nodes
- YAML parsing < 100ms for 1000 lines
- WebSocket latency < 100ms

**User Experience**:

- Workflow creation 50% faster than legacy
- User satisfaction > 4.0/5.0
- Bug reports < 5 per week post-launch
- Feature adoption > 60% within 3 months

**Code Quality**:

- Test coverage > 80%
- 0 TypeScript errors
- 0 ESLint errors
- 0 hardcoded colors (design tokens only)

---

## Risk Management

| Risk                             | Impact | Probability | Mitigation                                 |
| -------------------------------- | ------ | ----------- | ------------------------------------------ |
| React Flow learning curve        | Medium | High        | Review docs, reference examples, iterate   |
| YAML parser complexity           | High   | Medium      | Use js-yaml library, extensive testing     |
| Nested block visualization       | Medium | High        | Simplify initial version, test UX          |
| WebSocket reliability            | High   | Medium      | Auto-reconnect, offline queue, fallback    |
| Performance with large workflows | Medium | Low         | Memoization, virtual rendering, benchmarks |
| User adoption resistance         | Medium | Medium      | Gradual rollout, training, keep legacy     |

---

## Related Documentation

**Project Docs**:

- `/docs/workflow-units-functional-spec.md` - Vietnamese spec with YAML examples
- `/docs/html-module/workflow-units.blade.php` - Legacy source code
- `/docs/design-system.md` - Design system standards
- `/README.md` - Project overview

**Existing Patterns**:

- `/apps/web/src/features/active-tables/` - CRUD patterns
- `/apps/web/src/shared/route-paths.ts` - Route constants
- `/apps/web/src/shared/api/http-client.ts` - API client base

**Migration Reference**:

- `/plans/workflow-units-migration-plan.md` - High-level migration plan

---

## Getting Started

**For Developers**:

1. Read [plan.md](./plan.md) for overview
2. Start with [Phase 1](./phase-01-foundation-setup.md)
3. Follow phases sequentially
4. Each phase includes:
   - Context & dependencies
   - Key insights & research
   - Requirements (functional, technical, design)
   - Architecture & data flow
   - Implementation steps (detailed)
   - Todo list (checkboxes)
   - Success criteria (testable)
   - Risk assessment

**For Reviewers**:

- Review [plan.md](./plan.md) for scope
- Check phase breakdown matches timeline
- Verify success metrics are measurable
- Validate risk mitigation strategies

**For Stakeholders**:

- Timeline: 11 weeks (9 phases)
- Budget: 1 senior developer full-time
- ROI: 50% faster workflow creation, better UX
- Risk: Medium (mitigated with incremental delivery)

---

## Next Steps

1. **Review & Approve** - Stakeholder approval of plan
2. **Resource Allocation** - Assign developers, designers
3. **Timeline Confirmation** - Validate 11-week estimate
4. **Kickoff Meeting** - Align team on architecture
5. **Phase 1 Start** - Begin foundation setup

---

## Questions?

For questions or feedback:

- Review specific phase files for details
- Check `/docs/workflow-units-functional-spec.md` for requirements
- Consult `/docs/design-system.md` for UI standards
- Reference `/CLAUDE.md` for development guidelines

---

**Plan Status**: Draft - Ready for stakeholder review and approval
