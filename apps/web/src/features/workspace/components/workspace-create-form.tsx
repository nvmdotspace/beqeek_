import { FormEvent, useEffect, useMemo, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"

import { useCreateWorkspace } from "../hooks/use-create-workspace"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";

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
        <Label htmlFor="workspaceName">{m.workspace_form_nameLabel()}</Label>
        <Input
          id="workspaceName"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          placeholder={m.workspace_form_namePlaceholder()}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="namespace">{m.workspace_form_namespaceLabel()}</Label>
          <span className="text-[11px] text-muted-foreground">{m.workspace_form_namespaceHelp()}</span>
        </div>
        <Input
          id="namespace"
          value={namespace}
          onChange={(event) => {
            setNamespace(event.target.value)
            setNamespaceDirty(true)
          }}
          placeholder={m.workspace_form_namespacePlaceholder()}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{m.workspace_form_descriptionLabel()}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={m.workspace_form_descriptionPlaceholder()}
        />
      </div>
      {createWorkspaceMutation.isError ? (
        <p className="text-sm text-destructive">
          {(createWorkspaceMutation.error instanceof Error && createWorkspaceMutation.error.message) ||
            m.workspace_form_createError()}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={!canSubmit || createWorkspaceMutation.isPending}>
        {createWorkspaceMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            {m.workspace_form_creating()}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            {m.workspace_form_create()}
          </>
        )}
      </Button>
    </form>
  )
}

export type { WorkspaceCreateFormProps }
