import type { ReactNode } from "react"

import { Building2, Sparkles } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

export type WorkspaceEmptyStateProps = {
  onCreateClick: () => void
  createForm: ReactNode
  showForm: boolean
}

export const WorkspaceEmptyState = ({ onCreateClick, createForm, showForm }: WorkspaceEmptyStateProps) => {
  return (
    <Card className="border-dashed bg-muted/40 text-muted-foreground">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="size-6" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-foreground">Chưa có workspace nào</CardTitle>
          <CardDescription className="text-base">
            Khởi tạo workspace đầu tiên để cấu hình Active Table, workflows và mời thành viên cộng tác.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onCreateClick} className="w-full" variant="secondary">
          <Sparkles className="mr-2 size-4" /> Tạo workspace mới
        </Button>
        {showForm ? <div className="rounded-lg border border-border/70 bg-card p-4 text-left">{createForm}</div> : null}
      </CardContent>
    </Card>
  )
}
