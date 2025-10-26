import path from "node:path"
import { defineConfig, splitVendorChunkPlugin } from "vite"
import react from "@vitejs/plugin-react"
import { paraglide } from "@inlang/paraglide-js-adapter-vite"

export default defineConfig({
  plugins: [
    react(),
    paraglide({
      project: path.resolve(__dirname, "../../project.inlang"),
      outdir: path.resolve(__dirname, "src/paraglide/generated"),
    }),
    splitVendorChunkPlugin(),
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
