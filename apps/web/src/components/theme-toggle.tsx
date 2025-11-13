import { Sun, Moon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useThemeStore } from '@/stores';

/**
 * Theme Toggle Component
 *
 * Toggles between light and dark mode
 * - Shows sun icon in dark mode
 * - Shows moon icon in light mode
 * - Smooth transitions
 * - Accessible with aria-label
 */
export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Determine current effective theme (handle 'system' mode)
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 sm:h-10 sm:w-10"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rotate-0 scale-100" />
      )}
    </Button>
  );
}
