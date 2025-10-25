import { apiFetch } from "@/shared/api/http-client"
import type { AuthTokens, LoginRequest, RefreshTokenRequest } from "@/shared/api/types"

const AUTHENTICATE_ENDPOINT = "/api/auth/post/authenticate"
const REFRESH_ENDPOINT = "/api/auth/post/refresh_token"

export const authenticate = (payload: LoginRequest) =>
  apiFetch<AuthTokens>(AUTHENTICATE_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
    useAuth: false,
  })

export const refreshSession = (payload: RefreshTokenRequest) =>
  apiFetch<AuthTokens>(REFRESH_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
    useAuth: false,
  })
