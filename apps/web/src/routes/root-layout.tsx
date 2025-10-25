import { Outlet } from "@tanstack/react-router"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { AppProviders } from "@/providers/app-providers"

export const RootLayout = () => {
  return (
    <AppProviders>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
      </div>
      {import.meta.env.DEV ? (
        <>
          <ReactQueryDevtools buttonPosition="bottom-right" />
          <TanStackRouterDevtools position="bottom-left" />
        </>
      ) : null}
    </AppProviders>
  )
}
