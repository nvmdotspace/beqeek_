export const initialsFromName = (name: string | undefined | null) => {
  if (!name) return "BQ"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }

  const first = parts.at(0)?.[0]
  const last = parts.at(-1)?.[0]

  return `${first ?? ''}${last ?? ''}`.toUpperCase() || "BQ"
}
