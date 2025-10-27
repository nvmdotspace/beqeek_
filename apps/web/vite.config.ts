import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { paraglideVitePlugin } from "@inlang/paraglide-js"

export default defineConfig({
  plugins: [
    react(),
    paraglideVitePlugin({
      project: path.resolve(__dirname, "../../project.inlang"),
      outdir: path.resolve(__dirname, "src/paraglide/generated"),
			// forcing locale modules to detect problems during CI/CD
			// (all other projects use message-modules)
			outputStructure: "locale-modules",
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
