/**
 * Navigation Progress Bar
 *
 * Top-level progress indicator for route transitions
 * YouTube/GitHub-style loading bar that appears at the top of the page
 */

import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { cn } from '@workspace/ui/lib/utils';

export function NavigationProgress() {
  const routerState = useRouterState();
  const isLoading = routerState.status === 'pending';
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    if (isLoading) {
      setIsVisible(true);
      setProgress(0);

      // Simulate progress incrementally
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) {
          currentProgress = 90;
        }
        setProgress(currentProgress);
      }, 300);
    } else {
      // Complete progress bar
      setProgress(100);

      // Hide after animation completes
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 400);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimeout);
    };
  }, [isLoading]);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 z-50 transition-opacity duration-300',
        isVisible && progress < 100 ? 'opacity-100' : 'opacity-0',
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Page loading progress"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
