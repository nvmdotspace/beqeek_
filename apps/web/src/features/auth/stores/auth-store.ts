import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

type Tokens = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
};

type AuthActions = {
  setTokens: (tokens: Tokens) => void;
  logout: () => void;
  refreshTokenIfNeeded: () => Promise<boolean>;
};

type AuthStore = AuthState & {
  isAuthenticated: boolean;
} & AuthActions;

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        isAuthenticated: false,
        setTokens: (tokens) =>
          set({
            ...tokens,
            isAuthenticated: true,
          }),
        logout: () =>
          set({
            ...initialState,
            isAuthenticated: false,
          }),
        refreshTokenIfNeeded: async () => {
          const { refreshToken, accessToken } = get();

          if (!refreshToken) {
            return false;
          }

          try {
            // Check if access token is expired (simple check for demo)
            // In real app, you'd decode JWT to check exp
            const isTokenExpired = false; // Simplified for demo

            if (isTokenExpired || !accessToken) {
              const response = await fetch('/api/auth/post/refresh_token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
              });

              if (!response.ok) {
                get().logout();
                return false;
              }

              const tokens = await response.json();
              get().setTokens(tokens);
              return true;
            }

            return true;
          } catch (error) {
            console.error('Token refresh failed:', error);
            get().logout();
            return false;
          }
        },
      }),
      {
        name: 'auth-store',
        storage: createJSONStorage(() => localStorage),
        partialize: ({ accessToken, refreshToken, userId, isAuthenticated }) => ({
          accessToken,
          refreshToken,
          userId,
          isAuthenticated,
        }),
      },
    ),
    { name: 'auth-store' },
  ),
);
