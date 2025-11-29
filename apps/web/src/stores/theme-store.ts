import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme Store
 *
 * Manages application theme (light/dark/system)
 * - Persisted to localStorage
 * - Automatically applies theme to document root
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getResolvedTheme('system'),

      setTheme: (theme: Theme) => {
        const resolved = getResolvedTheme(theme);
        set({ theme, resolvedTheme: resolved });
        applyTheme(resolved);
      },

      toggleTheme: () => {
        const currentResolved = get().resolvedTheme;
        const newTheme = currentResolved === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'beqeek-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration
        if (state) {
          const resolved = getResolvedTheme(state.theme);
          useThemeStore.setState({ resolvedTheme: resolved });
          applyTheme(resolved);
        }
      },
    },
  ),
);

/**
 * Get resolved theme (handles 'system' preference)
 */
function getResolvedTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document root
 */
function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

/**
 * Initialize theme on app load
 * Call this in your app entry point
 *
 * NOTE: We read directly from localStorage because Zustand's persist
 * middleware rehydrates asynchronously. Reading from the store state
 * would return the default value ('system') before rehydration completes.
 */
export function initializeTheme() {
  // Read directly from localStorage to avoid async rehydration issue
  let theme: Theme = 'system';
  try {
    const stored = localStorage.getItem('beqeek-theme-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.theme) {
        theme = parsed.state.theme;
      }
    }
  } catch {
    // Fallback to system theme if localStorage read fails
  }

  const resolved = getResolvedTheme(theme);
  applyTheme(resolved);

  // Listen for system theme changes when using 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      const newResolved = getResolvedTheme('system');
      useThemeStore.setState({ resolvedTheme: newResolved });
      applyTheme(newResolved);
    }
  };

  mediaQuery.addEventListener('change', handleSystemThemeChange);

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
}
