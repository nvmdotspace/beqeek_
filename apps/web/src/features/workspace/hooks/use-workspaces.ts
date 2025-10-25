import { useQuery } from "@tanstack/react-query"

import { getWorkspaces } from "../api/workspace-api"

export const workspaceQueryKey = ["workspaces"]

export const useWorkspaces = () => {
  return useQuery({
    queryKey: workspaceQueryKey,
    queryFn: () => getWorkspaces(),
  })
}
