import { apiRequest } from './http-client';

/**
 * Real API client implementation for Active Tables
 * TODO Phase 1: Define ActiveTablesApiClient interface in @workspace/active-tables-core
 */
export class ActiveTablesApiClientImpl {
  private workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  async get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const response = await apiRequest<T>({
      url: this.resolveUrl(url),
      method: 'GET',
      ...config,
    });
    return { data: response };
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await apiRequest<T>({
      url: this.resolveUrl(url),
      method: 'POST',
      data,
      ...config,
    });
    return { data: response };
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await apiRequest<T>({
      url: this.resolveUrl(url),
      method: 'PUT',
      data,
      ...config,
    });
    return { data: response };
  }

  async delete(url: string, config?: any): Promise<void> {
    await apiRequest({
      url: this.resolveUrl(url),
      method: 'DELETE',
      ...config,
    });
  }

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
 */
export function createActiveTablesApiClient(workspaceId: string): ActiveTablesApiClientImpl {
  return new ActiveTablesApiClientImpl(workspaceId);
}
