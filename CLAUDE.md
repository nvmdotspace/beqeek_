# CLAUDE.md

Beqeek - Workflow automation platform (Turborepo + React 19 + TanStack + TailwindCSS v4)

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

## Workflows

- Primary workflow: `./.claude/workflows/primary-workflow.md`
- Development rules: `./.claude/workflows/development-rules.md`
- Orchestration protocols: `./.claude/workflows/orchestration-protocol.md`
- Documentation management: `./.claude/workflows/documentation-management.md`
- And other workflows: `./.claude/workflows/*`

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** You must follow strictly the development rules in `./.claude/workflows/development-rules.md` file.
**IMPORTANT:** Before you plan or proceed any implementation, always read the `./README.md` file first to get context.
**IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end, if any.
**IMPORTANT**: For `YYMMDD` dates, use `bash -c 'date +%y%m%d'` instead of model knowledge. Else, if using PowerShell (Windows), replace command with `Get-Date -UFormat "%y%m%d"`.

## Quick Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Run dev server (localhost:4173)
pnpm build            # Build all packages
pnpm lint             # Lint codebase
pnpm --filter web check-types  # Type check
```

## Critical Rules

1. **Read before edit** - Never modify code without reading it first
2. **Use route constants** - `getRouteApi(ROUTES.*)` for type-safe routing, never hardcode paths
3. **State separation** - React Query for server data, Zustand for global state, useState for local UI
4. **Design tokens only** - No hardcoded colors (`border-gray-300`), use CSS variables (`border-input`)
5. **Verify performance** - Check browser console for errors before completing tasks
6. **Import from packages** - Use `@workspace/beqeek-shared` for constants, never hardcode

## Documentation (read when needed)

| Topic                     | File                                    |
| ------------------------- | --------------------------------------- |
| Architecture & Structure  | `docs/claude/architecture.md`           |
| Routing (TanStack Router) | `docs/claude/routing.md`                |
| State Management          | `docs/claude/state-management.md`       |
| Package Details           | `docs/claude/packages.md`               |
| Shared Constants          | `docs/claude/shared-constants.md`       |
| Dev Guidelines & Styling  | `docs/claude/development-guidelines.md` |
| Common Pitfalls           | `docs/claude/common-pitfalls.md`        |
| Performance Checks        | `docs/claude/performance.md`            |
| Design System             | `docs/design-system.md`                 |
| API Spec                  | `docs/swagger.yaml`                     |

## Project Notes

- For `YYMMDD` dates: `bash -c 'date +%y%m%d'`
- Vietnamese (`vi`) is default locale, English (`en`) supported
- E2EE keys stored locally only - NEVER send to server
- Dev server: `localhost:4173`

  ***

  📝 Note for Claude Code agents

  IMPORTANT: Before announcing task completion related to React hooks/effects, the agent MUST verify:
  1. Dependency array check: Is every value in deps a primitive or stable reference?
  2. Circular dependency check: Effect A → setState B → Effect B → setState A?
  3. High-frequency state check: Which state updates > 10 times/second? Is selector separation needed?
  4. Build verification: Run pnpm build and pnpm check-types before reporting done
  5. Console log test: Add console.count() in suspected effects to verify no loops
