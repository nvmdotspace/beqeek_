# Active Tables — Comments, Kanban Colors, and Grants (Design Draft)

## Scope
- Comment threads on Active Table records: list, create, edit, delete, mentions, attachments-ready payload.
- Kanban view with user-customizable colors per status column/view; persisted in table `config.kanbanConfigs`.
- Grants (permissions) for comments aligned with legacy HTML module and Swagger API contracts.

## API Contracts (Authoritative)
- List: `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/get/comments`
  - Body: `CommentQueryRequest` { paging?: 'cursor'; filtering?: object; next_id?: string; direction?: 'asc'|'desc'; limit?: number }
  - Response: `CommentListResponse` { data: WorkflowComment[]; cursor fields }
- Get one: `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/get/comments/{commentId}`
  - Response: `CommentDetailResponse` { data: WorkflowComment }
- Create: `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/post/comments`
  - Body: `CommentPayload` { commentContent: string; parentId?: string; mentions?: string[]; hashed_keywords?: object }
  - Response: `CommentMutationResponse` { data: { id: string } }
- Update: `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/patch/comments/{commentId}`
  - Body: `CommentPayload`
  - Response: `StandardResponse`
- Delete: `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/delete/comments/{commentId}`
  - Response: `StandardResponse`

All types and paths match docs/swagger.yaml and apps/web/src/features/active-tables/api/active-comments-api.ts.

## State Design (Mandatory)
- Data Source: server → React Query; UI input → local state; app permissions → global state (Zustand).

1) Comments Thread
- Server State (React Query):
  - `useQuery(['comments', workspaceId, tableId, recordId, params], fetchComments)`
  - Cursor pagination (`next_id`, `direction`, `limit`), append on load more.
  - `useMutation` for create/update/delete, invalidate or optimistically patch cache.
- Local State (useState):
  - Draft content, edit mode commentId, confirm delete dialog open, mention query string.
- Global State (Zustand):
  - Current user, team/role, and resolved table permission snapshot for UI gating.

2) Kanban
- Server State (React Query):
  - Records list filtered by status, per active kanban screen.
- Local State:
  - Active kanban screen selection, color pickers per column, unsaved changes flag.
- Global State:
  - Table `config.kanbanConfigs` (read via table detail); persist via table update endpoint in existing management flow.

3) Grants (Permissions)
- Source: Table `config.permissionsConfig` per team+role with actions including comment_*.
- Enforcement in UI: compute effective permission for current user and conditionally enable read/edit/delete.
- No duplication of server state. Use a selector: `useAuthStore(s => ({ user: s.user, roles: s.roles, teams: s.teams }))` and resolve against table config.

## Grants Model (from legacy HTML module)
Action types and option enums to support in UI:
- comment_create → options: `not_allowed`, `all`, `related_team_member`, `created_or_assigned_team_member`, `created_or_related_team_member`.
- comment_access → options: `not_allowed`, `all`, `comment_self_created`, `comment_self_created_or_tagged`, `comment_created_by_team`, `comment_created_or_tagged_team_member`.
- comment_update/delete → options: `not_allowed`, `all`, `comment_self_created`, `comment_self_created_2h`, `comment_self_created_12h`, `comment_self_created_24h`, `comment_created_by_team`, `comment_created_by_team_2h`, `comment_created_by_team_12h`, `comment_created_by_team_24h`.

UI must map these values 1:1 to persistable `permissionsConfig.actions[].permission` entries.

## UI/UX Flows

1) Record Detail with Comments Panel
- Layout: Right-side panel or bottom drawer on mobile; virtualized scroll in a `ScrollArea` with auto-stick to bottom on new items when already at bottom.
- List item: Avatar, display name, timestamp (localized), Markdown-rendered content, optional attachments, action menu (Edit/Delete) gated by grants.
- Composer: Textarea with Markdown hint, mention autocomplete, submit button; disabled states follow grants; optimistic add with rollback.
- Empty state: Friendly message and shortcut hint.
- Errors: Inline toast via Sonner; preserve draft on failure.

2) Kanban View with Custom Colors
- Choose Kanban screen (from `config.kanbanConfigs`); add/edit screens in table settings.
- Column grouping: by selected status field; columns derived from field options or dynamic distinct values.
- Color customization: per column color using ColorPicker; preview applied live; store in `kanbanConfigs[].columnStyles[{ value, color }]`.
- Card template: show `kanbanHeadlineField` and selected `displayFields`.
- Persistence: Save button writes updated `config.kanbanConfigs` through table update API.

3) Grants Configuration UI
- Matrix by Team × Role, listing available actions (create/access/update/delete incl. comment_*).
- Each action shows a select with allowed options above.
- Save merges into table `config.permissionsConfig` and updates table config via existing create/update APIs.

## Components Mapping (shadcn + @workspace/ui)
- Already in `@workspace/ui`:
  - Avatar, Badge, Button, Card, Dialog, DropdownMenu, Input, Label, Popover, Select, Skeleton, Switch, Tabs, Textarea, ColorPicker.
- To add (from shadcn registry):
  - ScrollArea (comment list)
  - Separator (list item boundaries and menus)
  - Tooltip (controls)
  - Command (mention/autocomplete surface; or Combobox built on Command)
  - Sonner (toasts)
  - Sheet/Drawer (mobile comments panel)

Follow packages/ui structure and add barrel exports.

## i18n Keys (added in messages/en.json and messages/vi.json)
Prefix: `activeTables_comments_*`, `activeTables_kanban_*`, `activeTables_permissions_*`.
- Comments: title, placeholder, post, edit, delete, deleteConfirm, loadMore, empty, mentionPlaceholder, error[Load|Create|Update|Delete].
- Kanban: title, customizeColors, columnColor, addView, editView, save, cancel, statusField, headlineField, displayFields, colorReset.
- Permissions: title, comments_create/access/update/delete, options (not_allowed, all, self_created, self_created_or_tagged, created_by_team, created_or_tagged_team_member, self_created_2h/12h/24h, created_by_team_2h/12h/24h), save, saved, errorSave.

## Accessibility
- Keyboard navigation for list and composer; ARIA roles for list, items, and controls.
- Screen reader labels on action buttons; live region for toast.
- Color choices require contrast check; provide tooltip hint if low contrast.

## Performance
- Cursor pagination for long threads; windowed list rendering.
- Debounced mention search.
- Optimistic mutations with minimal re-fetch.

## Security
- Sanitize Markdown; block inline scripts.
- Respect grants before enabling edit/delete.
- Avoid leaking hashed keywords; include only when required by backend.

## Open Questions
- Attachments upload endpoints for comments (not present in current swagger) — placeholder UI only.
- Real-time updates via SSE/WebSocket — outside current scope; rely on refetch on focus and mutation events.

---
This draft aligns with docs/swagger.yaml, legacy HTML module behavior for permissions, and the existing app API layer at apps/web/src/features/active-tables/api/active-comments-api.ts.
