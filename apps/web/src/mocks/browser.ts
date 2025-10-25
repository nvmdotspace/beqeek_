import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth'
import { workspaceHandlers } from './handlers/workspaces'
import { workspaceTeamHandlers } from './handlers/workspace-teams'
import { workspaceRoleHandlers } from './handlers/workspace-roles'
import { workspaceUserHandlers } from './handlers/workspace-users'
import { activeTableHandlers } from './handlers/active-tables'
import { activeTableRecordHandlers } from './handlers/active-table-records'
import { workflowConnectorHandlers } from './handlers/workflow-connectors'
import { workflowFormHandlers } from './handlers/workflow-forms'
import { commentsActionsHandlers } from './handlers/comments-actions'
import { eventHandlers } from './handlers/events'

export const worker = setupWorker(
  ...authHandlers,
  ...workspaceHandlers,
  ...workspaceTeamHandlers,
  ...workspaceRoleHandlers,
  ...workspaceUserHandlers,
  ...activeTableHandlers,
  ...activeTableRecordHandlers,
  ...workflowConnectorHandlers,
  ...workflowFormHandlers,
  ...commentsActionsHandlers,
  ...eventHandlers,
)