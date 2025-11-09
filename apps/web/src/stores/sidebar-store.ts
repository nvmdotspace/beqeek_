import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

// Types for sidebar state management
export interface Workspace {
  id: string;
  workspaceName: string;
  namespace?: string;
  description?: string | null;
  logo?: string | null;
  thumbnailLogo?: string | null;
  memberCount?: number;
  tableCount?: number;
  workflowCount?: number;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export interface BadgeCounts {
  tables: number;
  workflows: number;
  notifications: number;
  teamMembers: number;
  messages: number;
  calendar: number;
  projects: number;
}

export interface RecentItem {
  id: string;
  type: 'table' | 'workflow' | 'form' | 'record';
  title: string;
  workspaceId: string;
  accessedAt: string;
  tableId?: string; // For record items
}

export interface SidebarState {
  // Workspace Context
  currentWorkspace: Workspace | null;
  workspacePermissions: Permission[];
  availableWorkspaces: Workspace[];

  // Navigation State
  activeSection: string;
  expandedSections: string[];
  recentItems: RecentItem[];

  // Real-time Data
  badgeCounts: BadgeCounts;
  lastUpdated: number;

  // UI State
  isCollapsed: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isSidebarOpen: boolean;
}

export interface SidebarActions {
  // Workspace Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setAvailableWorkspaces: (workspaces: Workspace[]) => void;
  updateWorkspacePermissions: (permissions: Permission[]) => void;

  // Navigation Actions
  setActiveSection: (section: string) => void;
  toggleSection: (section: string) => void;
  expandSection: (section: string) => void;
  collapseSection: (section: string) => void;

  // Badge Actions
  updateBadgeCounts: (counts: Partial<BadgeCounts>) => void;
  incrementBadge: (key: keyof BadgeCounts) => void;
  decrementBadge: (key: keyof BadgeCounts) => void;

  // Recent Items Actions
  addRecentItem: (item: RecentItem) => void;
  removeRecentItem: (id: string) => void;
  clearRecentItems: () => void;

  // UI Actions
  setCollapsed: (collapsed: boolean) => void;
  setMobile: (isMobile: boolean) => void;
  setTablet: (isTablet: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Permission Helpers
  hasPermission: (resource: string, action: Permission['actions'][number]) => boolean;
  canViewSection: (section: string) => boolean;
  canCreateItem: (type: string) => boolean;
}

export type SidebarStore = SidebarState & SidebarActions;

const initialState: SidebarState = {
  // Workspace Context
  currentWorkspace: null,
  workspacePermissions: [],
  availableWorkspaces: [],

  // Navigation State
  activeSection: 'dashboard',
  expandedSections: ['workspace-features', 'organization', 'system'],
  recentItems: [],

  // Real-time Data
  badgeCounts: {
    tables: 0,
    workflows: 0,
    notifications: 0,
    teamMembers: 0,
    messages: 0,
    calendar: 0,
    projects: 0,
  },
  lastUpdated: Date.now(),

  // UI State
  isCollapsed: false,
  isMobile: false,
  isTablet: false,
  isSidebarOpen: false,
};

export const useSidebarStore = create<SidebarStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Workspace Actions
        setCurrentWorkspace: (workspace) =>
          set(() => ({
            currentWorkspace: workspace,
            // Reset navigation state when workspace changes
            activeSection: 'dashboard',
            expandedSections: ['workspace-features'],
            recentItems: [],
          })),

        setAvailableWorkspaces: (workspaces) => set({ availableWorkspaces: workspaces }),

        updateWorkspacePermissions: (permissions) => set({ workspacePermissions: permissions }),

        // Navigation Actions
        setActiveSection: (section) => set({ activeSection: section }),

        toggleSection: (section) =>
          set((state) => ({
            expandedSections: state.expandedSections.includes(section)
              ? state.expandedSections.filter((s) => s !== section)
              : [...state.expandedSections, section],
          })),

        expandSection: (section) =>
          set((state) => ({
            expandedSections: state.expandedSections.includes(section)
              ? state.expandedSections
              : [...state.expandedSections, section],
          })),

        collapseSection: (section) =>
          set((state) => ({
            expandedSections: state.expandedSections.filter((s) => s !== section),
          })),

        // Badge Actions
        updateBadgeCounts: (counts) =>
          set((state) => ({
            badgeCounts: { ...state.badgeCounts, ...counts },
            lastUpdated: Date.now(),
          })),

        incrementBadge: (key) =>
          set((state) => ({
            badgeCounts: {
              ...state.badgeCounts,
              [key]: state.badgeCounts[key] + 1,
            },
            lastUpdated: Date.now(),
          })),

        decrementBadge: (key) =>
          set((state) => ({
            badgeCounts: {
              ...state.badgeCounts,
              [key]: Math.max(0, state.badgeCounts[key] - 1),
            },
            lastUpdated: Date.now(),
          })),

        // Recent Items Actions
        addRecentItem: (item) =>
          set((state) => {
            // Remove existing item with same ID if exists
            const filtered = state.recentItems.filter((i) => i.id !== item.id);
            // Add new item at the beginning, keep only last 10 items
            const updated = [item, ...filtered].slice(0, 10);
            return { recentItems: updated };
          }),

        removeRecentItem: (id) =>
          set((state) => ({
            recentItems: state.recentItems.filter((item) => item.id !== id),
          })),

        clearRecentItems: () => set({ recentItems: [] }),

        // UI Actions
        setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

        setMobile: (isMobile) => set({ isMobile }),

        setTablet: (isTablet) => set({ isTablet }),

        setSidebarOpen: (open) => set({ isSidebarOpen: open }),

        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

        // Permission Helpers
        hasPermission: (resource, action: Permission['actions'][number]) => {
          const { workspacePermissions } = get();

          // If permissions have not been loaded yet, allow access by default so the UI remains functional.
          if (workspacePermissions.length === 0) {
            return true;
          }

          const permission = workspacePermissions.find((p) => p.resource === resource);
          return permission ? permission.actions.includes(action) : false;
        },

        canViewSection: (section) => {
          const { hasPermission, workspacePermissions } = get();

          // Fallback to showing the navigation until permissions are available.
          if (workspacePermissions.length === 0) {
            return true;
          }

          const sectionPermissions = {
            tables: 'tables',
            workflow: 'workflow',
            team: 'team',
            roles: 'roles',
            analytics: 'analytics',
            settings: 'settings',
          };

          const resource = sectionPermissions[section as keyof typeof sectionPermissions];
          return resource ? hasPermission(resource, 'read') : true;
        },

        canCreateItem: (type) => {
          const { hasPermission, workspacePermissions } = get();

          if (workspacePermissions.length === 0) {
            return true;
          }

          const typePermissions = {
            table: 'tables',
            workflow: 'workflow',
            form: 'workflow',
            team: 'team',
          };

          const resource = typePermissions[type as keyof typeof typePermissions];
          return resource ? hasPermission(resource, 'write') : false;
        },
      }),
      {
        name: 'sidebar-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Persist only UI state and preferences
          isCollapsed: state.isCollapsed,
          expandedSections: state.expandedSections,
          recentItems: state.recentItems.slice(0, 5), // Keep only last 5 recent items
          // Don't persist real-time data or workspace context
        }),
      },
    ),
    { name: 'sidebar-store' },
  ),
);

// Selectors for optimized re-renders
export const selectCurrentWorkspace = (state: SidebarStore) => state.currentWorkspace;
export const selectAvailableWorkspaces = (state: SidebarStore) => state.availableWorkspaces;
export const selectActiveSection = (state: SidebarStore) => state.activeSection;
export const selectBadgeCounts = (state: SidebarStore) => state.badgeCounts;
export const selectRecentItems = (state: SidebarStore) => state.recentItems;
export const selectIsCollapsed = (state: SidebarStore) => state.isCollapsed;
export const selectIsMobile = (state: SidebarStore) => state.isMobile;
export const selectIsTablet = (state: SidebarStore) => state.isTablet;
export const selectIsSidebarOpen = (state: SidebarStore) => state.isSidebarOpen;
export const selectCanViewSection = (state: SidebarStore) => state.canViewSection;
export const selectCanCreateItem = (state: SidebarStore) => state.canCreateItem;
