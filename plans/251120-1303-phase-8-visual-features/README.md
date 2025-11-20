# Phase 8: Visual Features - Plan Directory

**Created**: 2025-11-20 13:03
**Status**: Ready for Implementation
**Plan Directory**: `/plans/251120-1303-phase-8-visual-features/`

## 📋 Documents

### 1. [plan.md](./plan.md) - Executive Summary

High-level overview with:

- Context and target state
- Architecture overview
- Implementation phases (1-4)
- Success criteria
- Risk assessment
- Timeline: 4-6 hours

### 2. [phase-8-visual-features.md](./phase-8-visual-features.md) - Implementation Guide

Detailed step-by-step instructions for:

**Phase 1: MiniMap Integration** (1-2 hours)

- Configure React Flow MiniMap component
- Dynamic node coloring (triggers=blue, actions=green, logic=teal)
- Responsive CSS (hide on mobile)
- Performance testing

**Phase 2: Export Utilities** (2-3 hours)

- Install html-to-image@1.11.11
- Create export-utils.ts with helpers
- Implement exportWorkflowToPng() function
- Filename generation and download logic

**Phase 3: UI Integration** (1 hour)

- Add Export button to canvas header
- Loading state management
- Toast notifications
- Keyboard shortcut (Cmd+Shift+E)

**Phase 4: Testing & Polish** (1 hour)

- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsive verification
- Performance benchmarks
- Bundle size check (<50kb increase)

## 🎯 Quick Start

### Prerequisites

- React Flow @xyflow/react@12.9.3 (already installed)
- Zustand workflow editor store (existing)
- Design system CSS tokens (existing)

### Implementation Order

1. Read [plan.md](./plan.md) for context
2. Follow [phase-8-visual-features.md](./phase-8-visual-features.md) Phase 1-4
3. Run test checklist after each phase
4. Deploy with confidence

### Key Files to Modify

```
apps/web/src/features/workflow-units/
├── components/workflow-builder/
│   ├── workflow-canvas.tsx       [MODIFY] Add MiniMap config
│   └── canvas-header.tsx         [MODIFY] Add Export button
└── utils/
    └── export-utils.ts           [CREATE] Export helpers
```

### Dependencies to Add

```bash
pnpm --filter web add html-to-image@1.11.11
```

## ✅ Success Criteria

### Functional

- [x] MiniMap shows all nodes in real-time
- [x] Node colors match type categories
- [x] Export produces 2x retina PNG
- [x] File downloads with descriptive name
- [x] Works with 100+ node workflows

### Non-Functional

- [x] Bundle size increase < 50kb gzipped
- [x] Export time < 500ms for 100 nodes
- [x] TypeScript strict compliance
- [x] Design system standards followed
- [x] Mobile responsive (minimap hidden)

### User Experience

- [x] Export button next to Save button
- [x] Clear loading states
- [x] Success/error toast notifications
- [x] Keyboard shortcut support
- [x] No canvas interaction blocking

## 📊 Technical Specs

### MiniMap Configuration

- **Position**: bottom-right (React Flow default)
- **Colors**: HSL values from design tokens
  - Triggers: `hsl(217 91% 60%)` (blue)
  - Actions: `hsl(142 76% 36%)` (green)
  - Logic: `hsl(173 80% 40%)` (teal)
- **Interactivity**: Pannable, zoomable
- **Mobile**: Hidden at 768px breakpoint

### Export Configuration

- **Library**: html-to-image@1.11.11
- **Format**: PNG only (MVP)
- **Quality**: 2x pixelRatio (retina)
- **Filtering**: Exclude .react-flow**minimap, .react-flow**controls, .react-flow\_\_panel
- **Filename**: `workflow-{sanitized-name}-{timestamp}.png`
- **Max size**: Recommend <500 nodes (browser limit)

## 🚨 Risk Mitigation

| Risk                          | Impact | Mitigation                  |
| ----------------------------- | ------ | --------------------------- |
| Large workflow timeout        | Medium | 10s timeout, progress toast |
| Browser memory limits         | Low    | Document 500-node limit     |
| Cross-browser inconsistencies | Low    | Lock html-to-image@1.11.11  |
| MiniMap performance           | Low    | React Flow virtualization   |

## 📚 Resources

### External Documentation

- [React Flow MiniMap API](https://reactflow.dev/api-reference/components/mini-map)
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image)
- [React Flow Export Example](https://reactflow.dev/examples/interaction/download-image)

### Internal Documentation

- [Design System](/docs/design-system.md)
- [Code Standards](/docs/code-standards.md)
- [System Architecture](/docs/system-architecture.md)

## 🔧 Testing Commands

```bash
# Type check
pnpm --filter web check-types

# Build production
NODE_ENV=production pnpm --filter web build

# Lint
pnpm --filter web lint

# Bundle size analysis
pnpm --filter web build -- --mode production
```

## 📝 Commit Convention

```bash
git commit -m "feat: add workflow canvas minimap and PNG export

- Implement React Flow MiniMap with dynamic node coloring
- Add PNG export with html-to-image@1.11.11 (2x retina)
- Export button in canvas header with loading states
- Mobile responsive (hide minimap on small screens)
- Keyboard shortcut: Cmd+Shift+E

Closes #XXX"
```

## 🎬 Next Steps

1. **Review plan** with team (if applicable)
2. **Create GitHub issue** from Phase 1-4 tasks
3. **Start Phase 1**: MiniMap Integration
4. **Daily updates** to Discord (`./.claude/hooks/send-discord.sh`)
5. **Code review** after Phase 3 (`/code-reviewer` agent)
6. **Deploy to staging** for QA

## 🔄 Version History

| Version | Date       | Changes              |
| ------- | ---------- | -------------------- |
| 1.0     | 2025-11-20 | Initial plan created |

---

**Plan Author**: Planner Agent
**Implementation Team**: Development Team
**Estimated Completion**: 4-6 hours (1 sprint)
