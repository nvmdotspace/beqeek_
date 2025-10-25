import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useApiErrorHandler } from './use-api-error-handler';

export const useQueryWithAuth = <T>(options: UseQueryOptions<T, Error, T, any>) => {
  const { handleError } = useApiErrorHandler();

  const query = useQuery(options);

  // Handle 401 errors
  if (query.error) {
    handleError(query.error);
  }

  return query;
};
