import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: path.resolve(__dirname, "src/routes"),
      generatedRouteTree: path.resolve(__dirname, "src/routeTree.gen.ts"),
      autoCodeSplitting: true,
    }),
    react(),
    paraglideVitePlugin({
      project: path.resolve(__dirname, "../../project.inlang"),
      outdir: path.resolve(__dirname, "src/paraglide/generated"),
      strategy: [
        "url",
        "cookie",
        "preferredLanguage",
        "localStorage",
        "baseLocale",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "localhost",
    port: 4173,
    strictPort: true,
    fs: {
      allow: [
        path.resolve(__dirname, "../../.."),
        path.resolve(__dirname, "../../../messages"),
      ],
    },
  },
  preview: {
    host: "localhost",
    port: 4173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) return "react"
            if (id.includes("@radix-ui")) return "radix"
            if (id.includes("lucide-react")) return "icons"
            if (id.includes("@tanstack")) return "tanstack"
            if (id.includes("date-fns")) return "date-fns"
            return "vendor"
          }
        },
      },
    },
  },
})
