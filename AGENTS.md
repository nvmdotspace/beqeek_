# Repository Guidelines

## Project Structure & Module Organization
- `apps/web` hosts the Next.js 15 app, wired for Turbopack and the shared UI library. Page-level code lives under `app/`; colocation with components is preferred.
- `packages/ui` exposes reusable React components (`src/components/**`); update the barrel exports when adding new primitives.
- `packages/eslint-config` and `packages/typescript-config` provide shared lint/TS baselines; extend these rather than duplicating rules per app.
- `turbo.json` and `pnpm-workspace.yaml` define task pipelines and workspace membership; update both when adding a new package or app.

## Build, Test, and Development Commands
- `pnpm install` hydrates all workspace dependencies using the Node 22 toolchain declared in `package.json`.
- `pnpm dev` starts the Turborepo `dev` pipeline, which proxies through to `next dev --turbopack` for the web app.
- `pnpm build` runs `turbo build`, executing each package’s `build` step (notably `next build --turbopack` inside `apps/web`).
- `pnpm lint` fans out to `next lint` via Turborepo; use this before pushing to catch shared-config violations early.

## Coding Style & Naming Conventions
- TypeScript is the default; keep strict typing and align new `tsconfig` options with `packages/typescript-config`.
- Prettier (root `format` script) enforces two-space indentation and double-quoted JSX props; run `pnpm format` for bulk updates.
- Follow React conventions: components in PascalCase (`Button.tsx`), hooks in camelCase starting with `use`, and directories in lowercase-hyphen (`form-fields`).
- Re-export UI primitives from `packages/ui/src/index.ts` so consumers keep a single import surface.

## Testing Guidelines
- A dedicated test runner is not yet configured; when introducing one (Vitest + Testing Library recommended), add a `test` script per package and register it in `turbo.json`.
- Co-locate tests as `*.test.tsx` or group them under `__tests__/` to leverage Next.js module resolution.
- Until automated tests exist, rely on `pnpm lint` plus manual verification in `pnpm dev`; document any new coverage expectations in the PR description.

## Commit & Pull Request Guidelines
- Follow the existing Git history: short, imperative commit subjects with a scoped prefix when helpful (`chore:`, `fix:`, etc.); emojis are optional but used sparingly.
- Each PR should describe the change, note affected packages, and link issues or tasks. Screenshots/GIFs are expected for UI tweaks in `apps/web`.
- Ensure lint/build pipelines succeed locally (`pnpm lint`, `pnpm build`) before opening a PR, and mention any skipped checks with justification.
