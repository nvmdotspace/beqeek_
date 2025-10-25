import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { WorkspaceMutationData } from "@/shared/api/types"

import { createWorkspace } from "../api/workspace-api"
import { workspaceQueryKey } from "./use-workspaces"

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: WorkspaceMutationData) => createWorkspace(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceQueryKey,
      })
    },
  })
}
