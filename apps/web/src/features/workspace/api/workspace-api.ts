import { apiFetch } from "@/shared/api/http-client"
import type {
  MutationRequest,
  StandardResponse,
  Workspace,
  WorkspaceListResponse,
  WorkspaceMutationData,
} from "@/shared/api/types"

const LIST_ENDPOINT = "/api/user/me/get/workspaces"
const DETAIL_ENDPOINT = (workspaceId: string) => `/api/user/me/get/workspaces/${workspaceId}`
const CREATE_ENDPOINT = "/api/workspace/post/workspaces"

export const getWorkspaces = (fields?: string) =>
  apiFetch<WorkspaceListResponse>(LIST_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      queries: {
        fields,
      },
    }),
  })

export const getWorkspace = (workspaceId: string) =>
  apiFetch<{ data: Workspace }>(DETAIL_ENDPOINT(workspaceId), {
    method: "POST",
  })

export const createWorkspace = (payload: WorkspaceMutationData) =>
  apiFetch<StandardResponse & { data?: Workspace }>(CREATE_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      data: payload,
    } satisfies MutationRequest<WorkspaceMutationData>),
  })
