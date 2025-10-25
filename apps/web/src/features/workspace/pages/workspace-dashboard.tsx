import { useMemo, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { LogOut, PlusCircle } from "lucide-react"

import { useAuthStore } from "@/features/auth"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { useWorkspaces } from "@/features/workspace"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { WorkspaceCreateForm } from "../components/workspace-create-form"
import { WorkspaceEmptyState } from "../components/workspace-empty-state"
import { WorkspaceGrid } from "../components/workspace-grid"

export const WorkspaceDashboardPage = () => {
  const router = useRouter()
  const { data, isLoading, error } = useWorkspaces()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const logout = useLogout()
  const userId = useAuthStore((state) => state.userId)

  const totalWorkspaces = data?.meta.total ?? 0
  const workspaces = data?.data ?? []

  const subtitle = useMemo(() => {
    if (isLoading) return "Đang tải danh sách workspace..."
    if (error) return "Không thể tải dữ liệu. Vui lòng thử lại."
    if (totalWorkspaces === 0)
      return "Chưa có workspace nào. Hãy khởi tạo workspace đầu tiên để bắt đầu số hóa dữ liệu công việc."
    return `${totalWorkspaces} workspace đang vận hành`
  }, [error, isLoading, totalWorkspaces])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]" />
      <header className="relative z-10 flex flex-col gap-6 px-6 pt-16 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-widest text-primary/80">Xin chào {userId ?? "builder"}</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Quản lý workspace</h1>
            <p className="max-w-2xl text-white/70">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setShowCreateForm((prev) => !prev)}>
              <PlusCircle className="mr-2 size-4" /> Thêm workspace
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                logout()
                void router.navigate({ to: "/login" })
              }}
            >
              <LogOut className="mr-2 size-4" /> Đăng xuất
            </Button>
          </div>
        </div>
        {showCreateForm && totalWorkspaces > 0 ? (
          <Card className="border-primary/30 bg-slate-900/70 text-foreground">
            <CardContent className="pt-6">
              <div className="mb-6 space-y-1">
                <h2 className="text-xl font-semibold text-white">Tạo workspace mới</h2>
                <p className="text-sm text-white/60">
                  Hoàn thiện tên, namespace và mô tả. Bạn có thể cấu hình team, role, Active Table sau khi tạo xong.
                </p>
              </div>
              <WorkspaceCreateForm onSuccess={() => setShowCreateForm(false)} />
            </CardContent>
          </Card>
        ) : null}
      </header>

      <main className="relative z-10 mx-auto mt-12 w-full max-w-6xl space-y-8 px-6 md:px-10">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-border/40 bg-slate-900/60">
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <Card className="border-destructive/30 bg-destructive/10 text-destructive">
            <CardContent className="space-y-2 pt-6">
              <h2 className="text-lg font-semibold">Không thể tải workspace</h2>
              <p className="text-sm text-destructive/90">
                {(error instanceof Error && error.message) ||
                  "Đã có lỗi xảy ra khi kết nối đến dịch vụ. Vui lòng thử làm mới trang."}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && totalWorkspaces === 0 ? (
          <WorkspaceEmptyState
            onCreateClick={() => setShowCreateForm((prev) => !prev)}
            createForm={<WorkspaceCreateForm onSuccess={() => setShowCreateForm(false)} />}
            showForm={showCreateForm}
          />
        ) : null}

        {!isLoading && !error && totalWorkspaces > 0 ? <WorkspaceGrid workspaces={workspaces} /> : null}
      </main>
    </div>
  )
}
