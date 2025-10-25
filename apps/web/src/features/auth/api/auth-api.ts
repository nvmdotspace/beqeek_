import { apiRequest } from "@/shared/api/http-client"
import type { AuthTokens, LoginRequest, RefreshTokenRequest } from "@/shared/api/types"

const AUTHENTICATE_ENDPOINT = "/api/auth/post/authenticate"
const REFRESH_ENDPOINT = "/api/auth/post/refresh_token"

export const authenticate = (payload: LoginRequest) =>
  apiRequest<AuthTokens, LoginRequest>({
    url: AUTHENTICATE_ENDPOINT,
    method: "POST",
    data: payload,
    skipAuth: true,
  })

export const refreshSession = (payload: RefreshTokenRequest) =>
  apiRequest<AuthTokens, RefreshTokenRequest>({
    url: REFRESH_ENDPOINT,
    method: "POST",
    data: payload,
    skipAuth: true,
  })
