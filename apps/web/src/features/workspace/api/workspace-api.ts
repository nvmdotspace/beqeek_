import { apiRequest } from "@/shared/api/http-client"
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
const DEFAULT_WORKSPACE_FIELDS =
  "id,namespace,workspaceName,myWorkspaceUser{id,fullName,email,phone,phoneCountryCode,avatar,thumbnailAvatar,emailVerifiedAt,phoneVerifiedAt,createdAt,updatedAt},ownedByUser,ownedBy,logo,thumbnailLogo,createdAt,updatedAt"

export const getWorkspaces = (fields: string = DEFAULT_WORKSPACE_FIELDS) =>
  apiRequest<WorkspaceListResponse>({
    url: LIST_ENDPOINT,
    method: "POST",
    data: {
      queries: {
        fields,
      },
    },
  })

export const getWorkspace = (workspaceId: string, fields: string = DEFAULT_WORKSPACE_FIELDS) =>
  apiRequest<StandardResponse<Workspace>>({
    url: DETAIL_ENDPOINT(workspaceId),
    method: "POST",
    data: {
      queries: {
        fields,
      },
    },
  })

export const createWorkspace = (payload: WorkspaceMutationData) =>
  apiRequest<StandardResponse<Workspace>, MutationRequest<WorkspaceMutationData>>({
    url: CREATE_ENDPOINT,
    method: "POST",
    data: {
      data: payload,
    } satisfies MutationRequest<WorkspaceMutationData>,
  })
