/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: "mock" | "rest"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
