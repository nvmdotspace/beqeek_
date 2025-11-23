/**
 * Get user initials from full name.
 * Returns first letter of first and last name (or just first if single name).
 *
 * @param fullName - User's full name
 * @returns Initials (1-2 characters) or 'U' as fallback
 *
 * @example
 * getUserInitials('John Doe') // 'JD'
 * getUserInitials('Alice') // 'A'
 * getUserInitials('') // 'U'
 * getUserInitials(null) // 'U'
 */
export function getUserInitials(fullName?: string | null): string {
  if (!fullName || fullName.trim().length === 0) {
    return 'U';
  }

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (parts.length === 0) {
    return 'U';
  }

  const firstPart = parts[0];
  if (parts.length === 1 || !firstPart) {
    return firstPart?.[0]?.toUpperCase() ?? 'U';
  }

  const lastPart = parts[parts.length - 1];
  const firstInitial = firstPart[0] ?? '';
  const lastInitial = lastPart?.[0] ?? '';

  return (firstInitial + lastInitial).toUpperCase();
}
