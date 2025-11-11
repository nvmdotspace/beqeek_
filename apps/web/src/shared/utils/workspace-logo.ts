/**
 * Workspace Logo Generator
 *
 * Generates consistent, colorful gradient logos for workspaces based on their name.
 * Can be toggled to use API-provided logos instead.
 */

/**
 * Feature flag to toggle between generated logos and API logos
 * Set to `true` to use generated gradient logos
 * Set to `false` to use API-provided logos (thumbnailLogo, logo, or dicebear)
 */
export const USE_GENERATED_LOGOS = true;

/**
 * Gradient color palette for workspace logos
 * Each gradient has start and end colors for a smooth visual effect
 */
const GRADIENT_PALETTES = [
  // Purple/Magenta
  { start: '#C084FC', end: '#E879F9' }, // purple-400 to fuchsia-400
  { start: '#A855F7', end: '#D946EF' }, // purple-500 to fuchsia-500
  { start: '#9333EA', end: '#C026D3' }, // purple-600 to fuchsia-600

  // Blue
  { start: '#60A5FA', end: '#3B82F6' }, // blue-400 to blue-500
  { start: '#3B82F6', end: '#2563EB' }, // blue-500 to blue-600
  { start: '#2563EB', end: '#1D4ED8' }, // blue-600 to blue-700

  // Cyan/Teal
  { start: '#22D3EE', end: '#06B6D4' }, // cyan-400 to cyan-500
  { start: '#14B8A6', end: '#0D9488' }, // teal-500 to teal-600

  // Green
  { start: '#4ADE80', end: '#22C55E' }, // green-400 to green-500
  { start: '#22C55E', end: '#16A34A' }, // green-500 to green-600

  // Orange/Amber
  { start: '#FB923C', end: '#F97316' }, // orange-400 to orange-500
  { start: '#FBBF24', end: '#F59E0B' }, // amber-400 to amber-500

  // Red/Rose
  { start: '#F87171', end: '#EF4444' }, // red-400 to red-500
  { start: '#FB7185', end: '#F43F5E' }, // rose-400 to rose-500

  // Indigo
  { start: '#818CF8', end: '#6366F1' }, // indigo-400 to indigo-500
  { start: '#6366F1', end: '#4F46E5' }, // indigo-500 to indigo-600
];

/**
 * Generate a consistent hash from a string
 * Same input will always produce the same output
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get workspace initials from workspace name
 * Takes first letter of first two words, or first two letters if single word
 */
export function getWorkspaceInitials(workspaceName: string): string {
  if (!workspaceName) return '?';

  const words = workspaceName.trim().split(/\s+/);

  if (words.length >= 2) {
    // Take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    // Take first two letters of single word
    const name = words[0];
    if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}

/**
 * Get a consistent gradient palette for a workspace based on its name
 * Same workspace name will always get the same gradient
 */
export function getWorkspaceGradient(workspaceName: string): { start: string; end: string } {
  const hash = hashString(workspaceName);
  const index = hash % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

/**
 * Generate a gradient CSS background string for a workspace
 */
export function getWorkspaceGradientStyle(workspaceName: string): string {
  const gradient = getWorkspaceGradient(workspaceName);
  return `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`;
}

/**
 * Generate an inline style object for workspace logo background
 */
export function getWorkspaceLogoStyle(workspaceName: string): React.CSSProperties {
  return {
    background: getWorkspaceGradientStyle(workspaceName),
  };
}

/**
 * Generate a data URL for workspace logo (for use in img src)
 * This creates a simple SVG with gradient background and initials
 */
export function getWorkspaceLogoDataUrl(workspaceName: string, size: number = 128): string {
  const initials = getWorkspaceInitials(workspaceName);
  const gradient = getWorkspaceGradient(workspaceName);
  const fontSize = Math.floor(size * 0.4); // 40% of size

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.end};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="600"
        fill="white"
      >${initials}</text>
    </svg>
  `.trim();

  // Encode SVG to data URL
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get workspace logo URL
 * Returns generated logo if USE_GENERATED_LOGOS is true,
 * otherwise returns API-provided logo with fallback
 */
export function getWorkspaceLogo(workspace: {
  workspaceName: string;
  thumbnailLogo?: string | null;
  logo?: string | null;
  namespace?: string | null;
}): string {
  if (USE_GENERATED_LOGOS) {
    return getWorkspaceLogoDataUrl(workspace.workspaceName, 128);
  }

  // Fallback to API logos
  return (
    workspace.thumbnailLogo ||
    workspace.logo ||
    (workspace.namespace ? `https://api.dicebear.com/7.x/initials/svg?seed=${workspace.namespace}` : '') ||
    getWorkspaceLogoDataUrl(workspace.workspaceName, 128)
  );
}

/**
 * Type-safe export for React CSS properties
 */
export type WorkspaceLogoStyle = React.CSSProperties;
