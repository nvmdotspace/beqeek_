import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'

import { useLanguageStore } from '@/stores/language-store'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { ApiError } from '@/shared/api/api-error'

export const useApiErrorHandler = () => {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const getLocalizedPath = useLanguageStore((state) => state.getLocalizedPath)

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        // Clear auth state
        logout()

        // Redirect to login page with current language
        const locale = useLanguageStore.getState().locale
        router.navigate({ to: '/$locale/login', params: { locale: locale || 'vi' } })

        return true // Error was handled
      }

      return false // Error was not handled
    },
    [router, logout, getLocalizedPath],
  )

  return { handleError }
}
