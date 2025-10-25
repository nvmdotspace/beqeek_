import { useAuthStore } from '@/features/auth/stores/auth-store';

import { ApiError } from './api-error';

type RequestOptions = RequestInit & {
  /** Use bearer token automatically when true */
  useAuth?: boolean;
};

const createHeaders = (init?: HeadersInit) => {
  const headers = new Headers(init ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
};

export async function apiFetch<T>(
  input: string,
  { useAuth = true, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = createHeaders(headers);

  if (useAuth) {
    const authStore = useAuthStore.getState();

    // Try to refresh token if needed
    if (authStore.refreshToken && !authStore.accessToken) {
      await authStore.refreshTokenIfNeeded();
    }

    // Get fresh auth state after potential refresh
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
      console.log('API Request with token:', input, accessToken.substring(0, 20) + '...');
    } else {
      console.log('API Request without token:', input);
    }
  }

  const response = await fetch(input, {
    ...init,
    headers: requestHeaders,
  });

  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    let errorPayload: unknown = null;

    if (contentType.includes('application/json')) {
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = null;
      }
    } else {
      const text = await response.text();
      errorPayload = text.length > 0 ? text : null;
    }

    let message = response.statusText || 'Request failed';

    if (typeof errorPayload === 'string' && errorPayload.length > 0) {
      message = errorPayload;
    } else if (
      typeof errorPayload === 'object' &&
      errorPayload !== null &&
      'message' in errorPayload &&
      typeof (errorPayload as Record<string, unknown>).message === 'string'
    ) {
      message = (errorPayload as Record<string, unknown>).message as string;
    } else {
      message = `Request failed with status ${response.status}`;
    }

    throw new ApiError(message, response.status, errorPayload);
  }

  if (response.status === 204 || contentType.length === 0) {
    return undefined as T;
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as T;
}
