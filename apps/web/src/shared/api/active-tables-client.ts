import { apiRequest } from './http-client';

/**
 * HTTP request configuration options
 * Subset of Axios config that's commonly used
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Generic response wrapper
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Request body type for POST/PUT operations
 * Use Record<string, unknown> as safe alternative to any
 */
export type RequestBody = Record<string, unknown> | FormData | undefined;

/**
 * Real API client implementation for Active Tables
 *
 * @remarks
 * This client is type-safe and requires explicit type parameters.
 * All methods are workspace-scoped and automatically prefix URLs.
 *
 * @example
 * ```typescript
 * const client = createActiveTablesApiClient('workspace123');
 *
 * // Fetch tables - explicit type required
 * const response = await client.get<ActiveTablesResponse>('/workflow/get/active_tables');
 *
 * // Create table - explicit types for both request and response
 * const createResponse = await client.post<{ id: string }, CreateTablePayload>(
 *   '/workflow/post/active_tables',
 *   tableData
 * );
 * ```
 */
export class ActiveTablesApiClientImpl {
  private workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  /**
   * Perform GET request
   *
   * @template T - Response data type (must be explicitly specified)
   * @param url - Relative or absolute URL
   * @param config - Optional request configuration
   * @returns Promise resolving to wrapped response data
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await apiRequest<T>({
      url: this.resolveUrl(url),
      method: 'GET',
      ...config,
    });
    return { data: response };
  }

  /**
   * Perform POST request
   *
   * @template T - Response data type (must be explicitly specified)
   * @template D - Request body type (defaults to Record<string, unknown>)
   * @param url - Relative or absolute URL
   * @param data - Request body
   * @param config - Optional request configuration
   * @returns Promise resolving to wrapped response data
   */
  async post<T, D extends RequestBody = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await apiRequest<T>({
      url: this.resolveUrl(url),
      method: 'POST',
      data,
      ...config,
    });
    return { data: response };
  }

  /**
   * Perform PUT request
   *
   * @template T - Response data type (must be explicitly specified)
   * @template D - Request body type (defaults to Record<string, unknown>)
   * @param url - Relative or absolute URL
   * @param data - Request body
   * @param config - Optional request configuration
   * @returns Promise resolving to wrapped response data
   */
  async put<T, D extends RequestBody = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await apiRequest<T>({
      url: this.resolveUrl(url),
      method: 'PUT',
      data,
      ...config,
    });
    return { data: response };
  }

  /**
   * Perform DELETE request
   *
   * @param url - Relative or absolute URL
   * @param config - Optional request configuration
   * @returns Promise resolving to void
   */
  async delete(url: string, config?: RequestConfig): Promise<void> {
    await apiRequest<void>({
      url: this.resolveUrl(url),
      method: 'DELETE',
      ...config,
    });
  }

  /**
   * Resolve relative URLs to workspace-scoped absolute URLs
   *
   * @param url - URL to resolve
   * @returns Absolute URL with workspace prefix
   * @private
   */
  private resolveUrl(url: string): string {
    // Convert relative URLs to absolute workspace URLs
    if (url.startsWith('/')) {
      return `/api/workspace/${this.workspaceId}${url}`;
    }
    return url;
  }
}

/**
 * Factory function to create API client for a specific workspace
 *
 * @param workspaceId - Workspace ID to scope all requests to
 * @returns Configured API client instance
 *
 * @example
 * ```typescript
 * const client = createActiveTablesApiClient('732878538910205325');
 * ```
 */
export function createActiveTablesApiClient(workspaceId: string): ActiveTablesApiClientImpl {
  return new ActiveTablesApiClientImpl(workspaceId);
}
