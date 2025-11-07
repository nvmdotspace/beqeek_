/**
 * Route Error Component
 *
 * Displayed when a route encounters an error during loading or rendering
 * Integrates with TanStack Router's error handling
 */

import { useRouter } from '@tanstack/react-router';
import { ErrorCard } from './error-display';
import { toApiError } from '@/shared/utils/error-utils';

type RouteErrorProps = {
  error?: unknown;
};

export const RouteError = ({ error }: RouteErrorProps) => {
  const router = useRouter();

  const handleRetry = () => {
    // Reload the current route
    router.invalidate();
  };

  const handleBack = () => {
    // Go back to previous page
    window.history.back();
  };

  const apiError = toApiError(error || new Error('An unexpected error occurred'));

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ErrorCard error={apiError} onRetry={handleRetry} onBack={handleBack} showDetails={import.meta.env.DEV} />
      </div>
    </div>
  );
};
