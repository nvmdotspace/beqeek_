import { apiRequest } from '@/shared/api/http-client';

import type { ActiveTablesResponse, ActiveWorkGroupsResponse } from '../types';

const workGroupsEndpoint = (workspaceId: string) =>
  `/api/workspace/${workspaceId}/workflow/get/active_work_groups`;
const tablesEndpoint = (workspaceId: string) =>
  `/api/workspace/${workspaceId}/workflow/get/active_tables`;

export const getActiveWorkGroups = (workspaceId: string) =>
  apiRequest<ActiveWorkGroupsResponse>({
    url: workGroupsEndpoint(workspaceId),
    method: 'POST',
  });

export const getActiveTables = (workspaceId: string) =>
  apiRequest<ActiveTablesResponse>({
    url: tablesEndpoint(workspaceId),
    method: 'POST',
  });
