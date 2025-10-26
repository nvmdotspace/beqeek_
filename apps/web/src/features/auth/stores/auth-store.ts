import { create } from "zustand"
import { devtools, persist, createJSONStorage } from "zustand/middleware"

import { refreshSession } from "@/features/auth/api/auth-api"

type Tokens = {
  accessToken: string
  refreshToken: string
  userId: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
}

type AuthActions = {
  setTokens: (tokens: Tokens) => void
  logout: () => void
  refreshTokenIfNeeded: (force?: boolean) => Promise<boolean>
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
}

let refreshTokenPromise: Promise<boolean> | null = null

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setTokens: (tokens) =>
          set(() => ({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userId: tokens.userId,
          })),
        logout: () =>
          set(() => ({
            ...initialState,
          })),
        refreshTokenIfNeeded: async (force = false) => {
          const { refreshToken, accessToken } = get()

          if (!refreshToken) {
            return false
          }

          if (!force && accessToken) {
            return true
          }

          if (!refreshTokenPromise) {
            refreshTokenPromise = (async () => {
              try {
                const currentRefreshToken = get().refreshToken
                if (!currentRefreshToken) {
                  return false
                }

                const data = await refreshSession({ refreshToken: currentRefreshToken })

                get().setTokens({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  userId: data.userId,
                })

                return true
              } catch (error) {
                console.error("Token refresh failed:", error)
                get().logout()
                return false
              } finally {
                refreshTokenPromise = null
              }
            })()
          }

          return refreshTokenPromise
        },
      }),
      {
        name: "auth-store",
        storage: createJSONStorage(() => localStorage),
        partialize: ({ accessToken, refreshToken, userId }) => ({
          accessToken,
          refreshToken,
          userId,
        }),
      },
    ),
    { name: "auth-store" },
  ),
)

export const selectIsAuthenticated = (state: AuthStore) => Boolean(state.accessToken)

export const getIsAuthenticated = () => selectIsAuthenticated(useAuthStore.getState())
