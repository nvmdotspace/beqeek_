import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import { RootLayout } from "./routes/root-layout"
import { HomeRoute } from "./routes/home"

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({
  routeTree,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
