#!/bin/bash

# Helper script to run ESLint on staged files in monorepo workspaces
# Usage: lint-staged-helper.sh file1 file2 file3...

for file in "$@"; do
  # Determine workspace from file path
  if [[ $file == apps/* ]]; then
    workspace=$(echo "$file" | cut -d'/' -f1-2)
  elif [[ $file == packages/* ]]; then
    workspace=$(echo "$file" | cut -d'/' -f1-2)
  else
    continue
  fi

  # Check if workspace has eslint.config.js
  if [ -f "$workspace/eslint.config.js" ]; then
    echo "Linting $file in workspace $workspace"
    (cd "$workspace" && pnpm exec eslint --fix --max-warnings 0 "${file#$workspace/}")
  fi
done
