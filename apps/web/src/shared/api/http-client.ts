import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/features/auth/stores/auth-store';

import { ApiError } from './api-error';
import { getApiBaseUrl, resolveApiUrl } from './config';

export interface ApiRequestConfig<TData = unknown> extends AxiosRequestConfig<TData> {
  /**
   * Skip adding Authorization header and refresh handling.
   * Useful for public endpoints such as login.
   */
  skipAuth?: boolean;
  /**
   * Internal flag used to prevent infinite retry loops.
   */
  _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const ensureUrl = (config: AxiosRequestConfig) => {
  if (config.url) {
    config.url = resolveApiUrl(config.url);
  }
};

apiClient.interceptors.request.use(async (config) => {
  const typedConfig = config as InternalAxiosRequestConfig & ApiRequestConfig;

  ensureUrl(typedConfig);

  if (typedConfig.skipAuth) {
    return typedConfig;
  }

  const authStore = useAuthStore.getState();
  let { accessToken, refreshToken } = authStore;

  if (!accessToken && refreshToken) {
    const refreshed = await authStore.refreshTokenIfNeeded();
    if (refreshed) {
      accessToken = useAuthStore.getState().accessToken;
    }
  }

  if (accessToken) {
    typedConfig.headers = typedConfig.headers ?? {};
    const headers = typedConfig.headers as Record<string, string>;
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return typedConfig;
});

const buildApiError = (error: AxiosError) => {
  const status = error.response?.status ?? 0;
  const details = error.response?.data ?? error.cause;

  let message = error.message || 'Request failed';

  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    if (typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.length > 0) {
        message = data.message;
      } else if (typeof data.error === 'string' && data.error.length > 0) {
        message = data.error;
      }
    }
  } else if (error.response?.statusText) {
    message = error.response.statusText;
  }

  return new ApiError(message, status, details);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) {
      throw buildApiError(error);
    }

    const originalRequest = error.config as ApiRequestConfig;

    if (error.response?.status === 401 && !originalRequest.skipAuth) {
      if (originalRequest._retry) {
        useAuthStore.getState().logout();
        throw buildApiError(error);
      }

      originalRequest._retry = true;

      const refreshed = await useAuthStore.getState().refreshTokenIfNeeded(true);
      if (refreshed) {
        const nextToken = useAuthStore.getState().accessToken;
        if (nextToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          const headers = originalRequest.headers as Record<string, string>;
          headers.Authorization = `Bearer ${nextToken}`;
          return apiClient(originalRequest);
        }
      }

      useAuthStore.getState().logout();
    }

    throw buildApiError(error);
  },
);

export const apiRequest = async <TResponse, TData = unknown>(config: ApiRequestConfig<TData>) => {
  const response = await apiClient.request<TResponse, { data: TResponse }, TData>(config);
  return response.data;
};

export { apiClient };
