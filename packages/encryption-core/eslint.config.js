import { config as baseConfig } from "@workspace/eslint-config/base"

export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-case-declarations": "off",
    },
  },
]