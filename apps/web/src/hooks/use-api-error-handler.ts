import { useCallback } from 'react'

import { useLanguageStore } from '@/stores/language-store'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { router } from '@/router'
import { ApiError } from '@/shared/api/api-error'

export const useApiErrorHandler = () => {
  const logout = useAuthStore((state) => state.logout)
  const getLocalizedPath = useLanguageStore((state) => state.getLocalizedPath)

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        // Clear auth state
        logout()

        // Redirect to login page with current language
        const locale = useLanguageStore.getState().locale
        const to = locale === 'vi' ? '/login' : '/$locale/login'
        const params = locale === 'vi' ? undefined : { locale }
        router.navigate({ to, ...(params ? { params } : {}) })

        return true // Error was handled
      }

      return false // Error was not handled
    },
    [logout, getLocalizedPath],
  )

  return { handleError }
}
