import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
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

      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'beqeek-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration
        if (state) {
          applyTheme(state.theme);
        }
      },
    },
  ),
);

/**
 * Apply theme to document root
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === 'system') {
    // Use system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(systemTheme);
  } else {
    // Use explicit theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
}

/**
 * Initialize theme on app load
 * Call this in your app entry point
 */
export function initializeTheme() {
  const theme = useThemeStore.getState().theme;
  applyTheme(theme);

  // Listen for system theme changes when using 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  };

  mediaQuery.addEventListener('change', handleSystemThemeChange);

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
}
