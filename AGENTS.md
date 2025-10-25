<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## Project Structure & Module Organization
- `apps/web` is a Vite + React SPA that uses the TanStack suite (Router, Query, Form) and Tailwind CSS utilities from `@workspace/ui`. Route components live in `src/routes`, shared providers in `src/providers`, global state in `src/stores`, and feature code should colocate with routes when practical.
- `packages/ui` exposes reusable React components (`src/components/**`) and Tailwind styles. Update the barrel exports in `packages/ui/src/index.ts` when adding new primitives.
- `packages/eslint-config` and `packages/typescript-config` provide shared lint/TS baselines; extend these rather than duplicating rules per app.
- `turbo.json` and `pnpm-workspace.yaml` define task pipelines and workspace membership; update both when adding a new package or app.

## Build, Test, and Development Commands
- `pnpm install` hydrates all workspace dependencies using the Node 22 toolchain declared in `package.json`.
- `pnpm dev` runs `turbo dev`, which triggers `pnpm --filter web dev` (Vite dev server). Prefer `pnpm --filter web dev -- --host 127.0.0.1` when binding needs to be explicit.
- `pnpm build` runs `turbo build`, which calls `vite build` in `apps/web` and any package-level build scripts.
- `pnpm lint` executes `turbo lint`; each package should expose a local `lint` script using the shared ESLint config.
- Type-checks run via `pnpm --filter web run check-types` until a unified `check-types` pipeline is in place.

## Coding Style & Naming Conventions
- TypeScript is required; keep strict options aligned with `packages/typescript-config`.
- Prettier (root `format` script) enforces two-space indentation and double-quoted JSX props; run `pnpm format` for bulk updates.
- Follow React conventions: components in PascalCase (`Button.tsx`), hooks in camelCase starting with `use`, and directories in lowercase-hyphen (`form-fields`).
- Re-export UI primitives from `packages/ui/src/index.ts` so consumers keep a single import surface.
- Use TanStack libraries for routing/data/forms;

## Global State Rules
- Zustand is the approved global state solution. Create stores under `apps/web/src/stores`, export typed hooks (e.g. `useAppStore`), and keep server state in React Query—not in Zustand.
- When adding new shared state, document the shape and usage inside the relevant store file and ensure components subscribe using selector functions to avoid unnecessary re-renders.

## Testing Guidelines
- A dedicated test runner is not yet configured; when introducing one (Vitest + Testing Library recommended), add a `test` script per package and register it in `turbo.json`.
- Co-locate tests as `*.test.tsx` or group them under `__tests__/` to leverage Vite module resolution.
- Until automated tests exist, rely on `pnpm lint` plus manual verification in `pnpm --filter web dev`; document any new coverage expectations in PR descriptions.

## Commit & Pull Request Guidelines
- Follow the existing Git history: short, imperative commit subjects with a scoped prefix when helpful (`chore:`, `fix:`, etc.); emojis are optional but used sparingly.
- Each PR should describe the change, note affected packages, and link issues or tasks. Screenshots/GIFs are expected for UI tweaks in `apps/web`.
- Ensure lint/build pipelines succeed locally (`pnpm lint`, `pnpm build`) before opening a PR, and mention any skipped checks with justification.
