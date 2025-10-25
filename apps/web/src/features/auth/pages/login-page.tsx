import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "@tanstack/react-router"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { useLogin } from "../hooks/use-login"
import { useAuthStore } from "../stores/auth-store"

export const LoginPage = () => {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [username, setUsername] = useState("captainbolt")
  const [password, setPassword] = useState("nvmteam")

  const { mutateAsync: login, isPending, errorMessage, reset } = useLogin()

  useEffect(() => {
    if (isAuthenticated) {
      void router.navigate({ to: "/workspaces" })
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await login(
      { username, password },
      {
        onSuccess: async () => {
          await router.navigate({ to: "/workspaces" })
        },
      },
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_55%)]" />
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-white/60 backdrop-blur">
            Work smarter with BEQEEK
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Chào mừng bạn quay lại nền tảng số hóa quy trình BEQEEK
          </h1>
          <p className="text-lg text-white/70 md:max-w-lg">
            Đăng nhập để tiếp tục quản trị workspace, tự động hóa workflow và vận hành dữ liệu Active Table an toàn
            với mã hóa đầu cuối (E2EE).
          </p>
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Truy cập thử nhanh</h2>
            <p className="text-sm text-white/60">
              Môi trường mock đã kích hoạt sẵn tài khoản{" "}
              <span className="font-medium text-white">captainbolt / nvmteam</span>. Bạn có thể thay đổi thông tin
              này trong cấu hình MSW hoặc tạo workspace mới ngay sau khi đăng nhập.
            </p>
          </div>
        </div>

        <Card className="w-full backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Đăng nhập</CardTitle>
            <CardDescription>
              Truy cập tài khoản BEQEEK của bạn. Mọi kết nối và dữ liệu sẽ được bảo vệ theo cấu hình E2EE.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => setPassword("nvmteam")}
                  >
                    Dùng mật khẩu mẫu
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              {errorMessage ? (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Cần tài khoản mới? Liên hệ admin workspace hoặc sử dụng luồng mời thành viên trong dashboard.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
