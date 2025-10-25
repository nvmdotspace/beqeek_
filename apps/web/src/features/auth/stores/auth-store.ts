import { create } from "zustand"
import { devtools, persist, createJSONStorage } from "zustand/middleware"

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
}

type AuthStore = AuthState & {
  isAuthenticated: boolean
} & AuthActions

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
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
      }),
      {
        name: "auth-store",
        storage: createJSONStorage(() => localStorage),
        partialize: ({ accessToken, refreshToken, userId, isAuthenticated }) => ({
          accessToken,
          refreshToken,
          userId,
          isAuthenticated,
        }),
      },
    ),
    { name: "auth-store" },
  ),
)
