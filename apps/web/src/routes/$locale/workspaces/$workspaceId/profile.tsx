import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { z } from 'zod';

const UserProfilePageLazy = lazy(() =>
  import('@/features/workspace-users/pages/user-profile-page').then((m) => ({
    default: m.UserProfilePage,
  })),
);

const profileSearchSchema = z.object({
  tab: z.enum(['profile', 'settings', 'billing']).optional().catch('profile'),
});

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/profile')({
  validateSearch: profileSearchSchema,
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <UserProfilePageLazy />
    </Suspense>
  );
}
