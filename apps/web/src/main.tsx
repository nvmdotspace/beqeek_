import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"

import "@workspace/ui/globals.css"

import { router } from "./router"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Failed to find the root element")
}

document.documentElement.style.setProperty(
  "--font-geist-sans",
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
)
document.documentElement.style.setProperty(
  "--font-geist-mono",
  "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
)

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
