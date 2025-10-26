import { useEffect } from 'react';
import { useQueryWithAuth } from './use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useSidebarStore, selectCurrentWorkspace } from '@/stores/sidebar-store';

// Mock API functions - these should be replaced with actual API calls
const fetchTablesCount = async (workspaceId: string): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get(`/workspaces/${workspaceId}/tables/count`);
  return Math.floor(Math.random() * 20); // Mock data
};

const fetchWorkflowsCount = async (workspaceId: string): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get(`/workspaces/${workspaceId}/workflows/count`);
  return Math.floor(Math.random() * 15); // Mock data
};

const fetchNotificationsCount = async (): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get('/notifications/count');
  return Math.floor(Math.random() * 10); // Mock data
};

const fetchTeamMembersCount = async (workspaceId: string): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get(`/workspaces/${workspaceId}/members/count`);
  return Math.floor(Math.random() * 50); // Mock data
};

const fetchMessagesCount = async (): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get('/messages/count');
  return Math.floor(Math.random() * 25); // Mock data
};

const fetchCalendarEventsCount = async (): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get('/calendar/events/count');
  return Math.floor(Math.random() * 8); // Mock data
};

const fetchProjectsCount = async (workspaceId: string): Promise<number> => {
  // TODO: Replace with actual API call
  // return api.get(`/workspaces/${workspaceId}/projects/count`);
  return Math.floor(Math.random() * 12); // Mock data
};

// Query keys
export const badgeCountsQueryKey = (workspaceId?: string) => ['badge-counts', workspaceId ?? 'global'];

export const useBadgeCounts = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const updateBadgeCounts = useSidebarStore((state) => state.updateBadgeCounts);

  const workspaceId = currentWorkspace?.id;

  // Individual queries for each badge count
  const tablesQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(workspaceId), 'tables'],
    queryFn: () => fetchTablesCount(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const workflowsQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(workspaceId), 'workflows'],
    queryFn: () => fetchWorkflowsCount(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    refetchInterval: 30000,
  });

  const notificationsQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(), 'notifications'],
    queryFn: fetchNotificationsCount,
    enabled: isAuthenticated,
    refetchInterval: 15000, // More frequent for notifications
  });

  const teamMembersQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(workspaceId), 'teamMembers'],
    queryFn: () => fetchTeamMembersCount(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    refetchInterval: 60000, // Less frequent for team members
  });

  const messagesQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(), 'messages'],
    queryFn: fetchMessagesCount,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const calendarQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(), 'calendar'],
    queryFn: fetchCalendarEventsCount,
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const projectsQuery = useQueryWithAuth({
    queryKey: [...badgeCountsQueryKey(workspaceId), 'projects'],
    queryFn: () => fetchProjectsCount(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    refetchInterval: 45000,
  });

  // Update sidebar store when data changes
  useEffect(() => {
    const counts = {
      tables: tablesQuery.data ?? 0,
      workflows: workflowsQuery.data ?? 0,
      notifications: notificationsQuery.data ?? 0,
      teamMembers: teamMembersQuery.data ?? 0,
      messages: messagesQuery.data ?? 0,
      calendar: calendarQuery.data ?? 0,
      projects: projectsQuery.data ?? 0,
    };

    updateBadgeCounts(counts);
  }, [
    tablesQuery.data,
    workflowsQuery.data,
    notificationsQuery.data,
    teamMembersQuery.data,
    messagesQuery.data,
    calendarQuery.data,
    projectsQuery.data,
    updateBadgeCounts,
  ]);

  // Combined loading state
  const isLoading =
    isAuthenticated &&
    (tablesQuery.isLoading ||
      workflowsQuery.isLoading ||
      notificationsQuery.isLoading ||
      teamMembersQuery.isLoading ||
      messagesQuery.isLoading ||
      calendarQuery.isLoading ||
      projectsQuery.isLoading);

  // Combined error state
  const hasError = !!(
    tablesQuery.error ||
    workflowsQuery.error ||
    notificationsQuery.error ||
    teamMembersQuery.error ||
    messagesQuery.error ||
    calendarQuery.error ||
    projectsQuery.error
  );

  // Refetch all counts
  const refetchAll = async () => {
    const promises = [];

    if (workspaceId) {
      promises.push(tablesQuery.refetch());
      promises.push(workflowsQuery.refetch());
      promises.push(teamMembersQuery.refetch());
      promises.push(projectsQuery.refetch());
    }

    promises.push(notificationsQuery.refetch());
    promises.push(messagesQuery.refetch());
    promises.push(calendarQuery.refetch());

    await Promise.allSettled(promises);
  };

  return {
    // Individual query states for debugging
    queries: {
      tables: tablesQuery,
      workflows: workflowsQuery,
      notifications: notificationsQuery,
      teamMembers: teamMembersQuery,
      messages: messagesQuery,
      calendar: calendarQuery,
      projects: projectsQuery,
    },
    // Combined states
    isLoading,
    hasError,
    refetchAll,
    // Convenience getters
    counts: {
      tables: tablesQuery.data ?? 0,
      workflows: workflowsQuery.data ?? 0,
      notifications: notificationsQuery.data ?? 0,
      teamMembers: teamMembersQuery.data ?? 0,
      messages: messagesQuery.data ?? 0,
      calendar: calendarQuery.data ?? 0,
      projects: projectsQuery.data ?? 0,
    },
  };
};

// Hook for real-time updates (WebSocket integration placeholder)
export const useRealtimeBadgeUpdates = () => {
  const { refetchAll } = useBadgeCounts();

  useEffect(() => {
    // TODO: Implement WebSocket connection for real-time updates
    // This is a placeholder for WebSocket integration

    // Example WebSocket implementation:
    /*
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'badge_update') {
        // Update specific badge count
        updateBadgeCounts({ [data.badgeType]: data.count });
      } else if (data.type === 'badge_refresh') {
        // Refetch all counts
        refetchAll();
      }
    };
    
    return () => {
      ws.close();
    };
    */

    // For now, we'll use polling as a fallback
    const interval = setInterval(() => {
      refetchAll();
    }, 60000); // Refetch every minute as fallback

    return () => clearInterval(interval);
  }, [refetchAll]);
};
