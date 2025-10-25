import { FormEvent, useEffect, useMemo, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"

import { useCreateWorkspace } from "../hooks/use-create-workspace"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

type WorkspaceCreateFormProps = {
  onSuccess?: () => void
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

export const WorkspaceCreateForm = ({ onSuccess }: WorkspaceCreateFormProps) => {
  const [workspaceName, setWorkspaceName] = useState("")
  const [namespace, setNamespace] = useState("")
  const [namespaceDirty, setNamespaceDirty] = useState(false)
  const [description, setDescription] = useState("")

  const createWorkspaceMutation = useCreateWorkspace()

  const canSubmit = useMemo(() => workspaceName.trim().length > 2 && namespace.trim().length > 2, [workspaceName, namespace])

  useEffect(() => {
    if (!namespaceDirty) {
      setNamespace(slugify(workspaceName))
    }
  }, [workspaceName, namespaceDirty])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) return

    await createWorkspaceMutation.mutateAsync(
      {
        workspaceName: workspaceName.trim(),
        namespace: namespace.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setWorkspaceName("")
          setNamespaceDirty(false)
          setNamespace("")
          setDescription("")
          onSuccess?.()
        },
      },
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Tên workspace</Label>
        <Input
          id="workspaceName"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          placeholder="Ví dụ: Vận hành CRM Bất động sản"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="namespace">Namespace</Label>
          <span className="text-[11px] text-muted-foreground">Dùng để tạo URL và định danh duy nhất</span>
        </div>
        <Input
          id="namespace"
          value={namespace}
          onChange={(event) => {
            setNamespace(event.target.value)
            setNamespaceDirty(true)
          }}
          placeholder="vd: van-hanh-crm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ghi chú nhanh về mục đích của workspace"
        />
      </div>
      {createWorkspaceMutation.isError ? (
        <p className="text-sm text-destructive">
          {(createWorkspaceMutation.error instanceof Error && createWorkspaceMutation.error.message) ||
            "Không thể tạo workspace. Vui lòng thử lại."}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={!canSubmit || createWorkspaceMutation.isPending}>
        {createWorkspaceMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang tạo workspace...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Tạo workspace
          </>
        )}
      </Button>
    </form>
  )
}

export type { WorkspaceCreateFormProps }
