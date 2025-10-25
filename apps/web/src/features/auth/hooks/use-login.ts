import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import type { LoginRequest } from "@/shared/api/types"

import { ApiError } from "@/shared/api/api-error"

import { authenticate } from "../api/auth-api"
import { useAuthStore } from "../stores/auth-store"

export const useLogin = () => {
  const setTokens = useAuthStore((state) => state.setTokens)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => authenticate(payload),
    onSuccess: (data) => {
      setTokens(data)
      setErrorMessage(null)
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorMessage("Tài khoản hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra lại.")
          return
        }

        setErrorMessage(error.message)
        return
      }

      setErrorMessage(error instanceof Error ? error.message : "Không thể đăng nhập. Vui lòng thử lại.")
    },
  })

  return {
    ...mutation,
    errorMessage,
  }
}
